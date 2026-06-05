import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getPatientSessions } from '../services/api';
import { AuthContext } from '../AuthContext';
import { useTheme } from '../ThemeContext';

const { width } = Dimensions.get('window');

export default function WeeklyReportScreen() {
  const { colors } = useTheme();
  const { patientId } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [patientId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const sessions = await getPatientSessions(patientId);
      
      // Calculate last 7 days stats
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const safeSessions = Array.isArray(sessions) ? sessions : [];
      const weekSessions = safeSessions.filter(s => new Date(s.start_time) > lastWeek);
      
      const anxietyScores = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3 };
      const totalAnxiety = weekSessions.reduce((acc, s) => acc + (anxietyScores[s.initial_anxiety] || 0), 0);
      const totalDuration = weekSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
      
      const avgAnxiety = weekSessions.length > 0 ? (totalAnxiety / weekSessions.length).toFixed(1) : 0;
      
      setStats({
        sessionCount: weekSessions.length,
        avgAnxiety,
        totalDuration,
        anxietyLevel: avgAnxiety <= 1.5 ? 'Low' : avgAnxiety <= 2.5 ? 'Medium' : 'High'
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <Text style={styles.headerTitle}>Weekly Insights</Text>
        <Text style={styles.headerSubtitle}>Your progress over the last 7 days</Text>
      </LinearGradient>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="musical-notes" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.sessionCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sessions</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="time" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalDuration}m</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Time</Text>
        </View>
      </View>

      <View style={[styles.mainReport, { backgroundColor: colors.card }]}>
        <Text style={[styles.reportTitle, { color: colors.text }]}>Average Anxiety Level</Text>
        <View style={styles.anxietyScale}>
          <View style={[styles.scaleItem, stats.anxietyLevel === 'Low' && { backgroundColor: colors.success }]}>
            <Text style={[styles.scaleText, stats.anxietyLevel === 'Low' ? { color: '#fff' } : { color: colors.textSecondary }]}>Low</Text>
          </View>
          <View style={[styles.scaleItem, stats.anxietyLevel === 'Medium' && { backgroundColor: '#f57c00' }]}>
            <Text style={[styles.scaleText, stats.anxietyLevel === 'Medium' ? { color: '#fff' } : { color: colors.textSecondary }]}>Med</Text>
          </View>
          <View style={[styles.scaleItem, stats.anxietyLevel === 'High' && { backgroundColor: colors.error }]}>
            <Text style={[styles.scaleText, stats.anxietyLevel === 'High' ? { color: '#fff' } : { color: colors.textSecondary }]}>High</Text>
          </View>
        </View>
        
        <Text style={[styles.reportDesc, { color: colors.textSecondary }]}>
          Based on your {stats.sessionCount} sessions this week, your average anxiety index is {stats.avgAnxiety}/3.0. 
          {stats.anxietyLevel === 'Low' ? ' Great job maintaining calmness!' : ' Consider more meditation sessions.'}
        </Text>
      </View>

      <View style={[styles.tipCard, { backgroundColor: colors.accent }]}>
        <Ionicons name="bulb" size={24} color={colors.primary} />
        <View style={styles.tipContent}>
          <Text style={[styles.tipTitle, { color: colors.primary }]}>Pro Tip</Text>
          <Text style={[styles.tipText, { color: colors.text }]}>
            Users who listen to at least 15 minutes of &quot;Deep Sleep&quot; ambient music report 30% lower anxiety levels by the end of the week.
          </Text>
        </View>
      </View>
      
      <View style={{height: 40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#e0e0e0', marginTop: 5 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  statCard: { width: (width - 60) / 2, padding: 20, borderRadius: 15, alignItems: 'center', elevation: 2 },
  statValue: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  statLabel: { fontSize: 12, marginTop: 4 },
  mainReport: { marginHorizontal: 20, padding: 20, borderRadius: 15, elevation: 2, marginBottom: 20 },
  reportTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  anxietyScale: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 10, padding: 5, marginBottom: 20 },
  scaleItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  scaleText: { fontWeight: 'bold', fontSize: 14 },
  reportDesc: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  tipCard: { marginHorizontal: 20, padding: 20, borderRadius: 15, flexDirection: 'row', alignItems: 'center' },
  tipContent: { marginLeft: 15, flex: 1 },
  tipTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  tipText: { fontSize: 14, lineHeight: 20 }
});
