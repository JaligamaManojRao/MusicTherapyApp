import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSpecialists } from '../services/api';

import { useTheme } from '../ThemeContext';

export default function SpecialistsScreen() {
  const { colors } = useTheme();
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        const data = await getSpecialists();
        setSpecialists(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialists();
  }, []);

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, '')}`);
  };

  const renderSpecialistItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
          <Ionicons name="medical" size={24} color={colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.hospital, { color: colors.textSecondary }]}>{item.hospital}</Text>
        </View>
      </View>
      
      <Text style={[styles.specialty, { color: colors.primary, backgroundColor: colors.accent }]}>{item.specialty}</Text>
      
      <View style={styles.detailRow}>
        <Ionicons name="location" size={16} color={colors.textSecondary} />
        <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.address}</Text>
      </View>
      
      <TouchableOpacity style={[styles.callButton, { backgroundColor: colors.primary }]} onPress={() => handleCall(item.phone)}>
        <Ionicons name="call" size={18} color="#fff" />
        <Text style={styles.callButtonText}>Call {item.phone}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.pageHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Mumbai Medical Directory</Text>
        <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>Top rated Music Therapists and Psychiatrists</Text>
      </View>
      
      <FlatList
        data={specialists}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderSpecialistItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pageHeader: { padding: 20, borderBottomWidth: 1 },
  pageTitle: { fontSize: 22, fontWeight: 'bold' },
  pageSubtitle: { fontSize: 14, marginTop: 4 },
  listContent: { padding: 15 },
  card: { borderRadius: 15, padding: 20, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconContainer: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  headerText: { flex: 1 },
  name: { fontSize: 18, fontWeight: 'bold' },
  hospital: { fontSize: 13, fontWeight: '500' },
  specialty: { fontSize: 14, fontWeight: '600', marginBottom: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5, alignSelf: 'flex-start' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  detailText: { marginLeft: 8, fontSize: 14 },
  callButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 10 },
  callButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 }
});
