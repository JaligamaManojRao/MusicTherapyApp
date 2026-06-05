import React, { useState, useContext, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPatientSessions } from '../services/api';
import { AuthContext } from '../AuthContext';

import { useTheme } from '../ThemeContext';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { patientId } = useContext(AuthContext);

  useFocusEffect(
    useCallback(() => {
      const fetchSessions = async () => {
        try {
          setLoading(true);
          const data = await getPatientSessions(patientId);
          const safeData = Array.isArray(data) ? data : [];
          const sortedData = safeData.sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
          setSessions(sortedData);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      if (patientId) fetchSessions();
    }, [patientId])
  );

  const renderItem = ({ item }) => {
    const date = new Date(item.start_time);
    const dateStr = `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    
    let anxietyColor = colors.success; // LOW
    if(item.initial_anxiety === 'HIGH') anxietyColor = colors.error;
    if(item.initial_anxiety === 'MEDIUM') anxietyColor = '#f57c00'; // Orange is usually constant for warnings

    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
          <Text style={[styles.sessionId, { color: colors.primary }]}>{item.session_id}</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>{dateStr}</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Initial Anxiety:</Text>
            <Text style={[styles.value, {color: anxietyColor, fontWeight: 'bold'}]}>{item.initial_anxiety}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Listening Duration:</Text>
            <Text style={[styles.value, { color: colors.text }]}>{item.duration ? `${item.duration} mins` : 'Incomplete'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Kansya Thali:</Text>
            <Text style={[styles.value, { color: colors.text }]}>{item.foot_massage_completed ? 'Completed' : 'Not Tracked'}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Therapy History</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{marginTop: 50}} />
      ) : sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={60} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No therapy sessions yet.</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.session_id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: 'bold' },
  card: { borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, borderBottomWidth: 1, paddingBottom: 10 },
  sessionId: { fontWeight: 'bold' },
  date: { fontSize: 13 },
  cardBody: { paddingTop: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { },
  value: { fontWeight: '500' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 10, fontSize: 16 }
});
