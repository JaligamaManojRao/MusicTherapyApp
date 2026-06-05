import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { endTherapySession } from '../services/api';
import { useTheme } from '../ThemeContext';

export default function TherapySessionScreen({ route, navigation }) {
  const { colors, shadow, radius } = useTheme();
  const { sessionData } = route.params;
  const [startTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);

  const safeTracks = Array.isArray(sessionData.recommended_tracks) ? sessionData.recommended_tracks : [];
  const safeSpecialists = Array.isArray(sessionData.specialists) ? sessionData.specialists : [];

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnxietyBadgeStyle = (level) => {
    switch (level) {
      case 'HIGH': return { bg: '#fee2e2', text: '#b91c1c', label: 'HIGH ANXIETY' };
      case 'MEDIUM': return { bg: '#ffedd5', text: '#c2410c', label: 'MEDIUM ANXIETY' };
      default: return { bg: '#d1fae5', text: '#047857', label: 'LOW ANXIETY' };
    }
  };

  const badgeStyle = getAnxietyBadgeStyle(sessionData.anxiety_level);

  const renderTrackItem = ({ item }) => (
    <TouchableOpacity style={[styles.trackCard, { backgroundColor: colors.card }, shadow]}>
      <Image source={{ uri: item.album_art_url || 'https://via.placeholder.com/60' }} style={styles.trackImage} />
      <View style={styles.trackInfo}>
        <Text style={[styles.trackTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.trackArtist, { color: colors.textSecondary }]} numberOfLines={1}>{item.artist}</Text>
        <Text style={[styles.trackDetails, { color: colors.primary }]}>{item.tempo} BPM • {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}</Text>
      </View>
      <Ionicons name="play-circle" size={32} color={colors.primary} />
    </TouchableOpacity>
  );

  const handleComplete = async () => {
    setLoading(true);
    const endTime = Date.now();
    const durationMinutes = Math.max(1, Math.floor((endTime - startTime) / 60000));
    try {
      await endTherapySession(sessionData.session_id, durationMinutes, sessionData.foot_massage_recommended);
      navigation.navigate('HomeMain');
    } catch (e) {
      alert("Failed to save session time.");
      navigation.navigate('HomeMain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.topHeader}>
          <Text style={styles.sessionLabel}>ACTIVE SESSION</Text>
          <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
          <Text style={styles.idText}>ID: {sessionData.session_id}</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Vitals Summary Card */}
          <View style={[styles.vitalsCard, { backgroundColor: colors.card }, shadow]}>
            <View style={styles.anxietyRow}>
              <Text style={[styles.anxietyTitle, { color: colors.text }]}>Anxiety Analysis</Text>
              <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
                <Text style={[styles.badgeText, { color: badgeStyle.text }]}>{badgeStyle.label}</Text>
              </View>
            </View>

            <View style={styles.vitalsGrid}>
              <VitalIcon icon="heart" label="BPM" value={sessionData.vital_signs.heart_rate} color="#ef4444" colors={colors} />
              <VitalIcon icon="fitness" label="BP" value={sessionData.vital_signs.blood_pressure} color="#3b82f6" colors={colors} />
              <VitalIcon icon="pulse" label="GSR" value={sessionData.vital_signs.gsr_value} color="#f59e0b" colors={colors} />
              <VitalIcon icon="thermometer" label="TEMP" value={sessionData.vital_signs.body_temperature} color="#10b981" colors={colors} />
            </View>
          </View>

          {sessionData.foot_massage_recommended && (
            <LinearGradient colors={['#ecfdf5', '#f0fdf4']} style={[styles.kansyaCard, shadow]}>
              <View style={styles.kansyaHeader}>
                <Ionicons name="sparkles" size={20} color="#059669" />
                <Text style={styles.kansyaTitle}>Therapeutic Recommendation</Text>
              </View>
              <Text style={styles.kansyaMain}>Kansya Thali foot massage is recommended alongside this playlist to maximize relaxation.</Text>
            </LinearGradient>
          )}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Curated Playlist</Text>
          {safeTracks.map((item, idx) => (
            <View key={item.spotify_track_id || idx}>
              {renderTrackItem({ item })}
            </View>
          ))}

          {safeSpecialists && safeSpecialists.length > 0 && (
            <View style={styles.specialistSection}>
              <View style={styles.alertHeader}>
                <Ionicons name="alert-circle" size={24} color={colors.error} />
                <Text style={[styles.alertTitle, { color: colors.error }]}>High Risk: Specialist Support</Text>
              </View>
              <Text style={[styles.alertDesc, { color: colors.textSecondary }]}>Based on your vitals, we recommend consulting these specialists in Mumbai:</Text>

              {safeSpecialists.map((doc, idx) => (
                <View key={idx} style={[styles.docCard, { backgroundColor: colors.card }, shadow]}>
                  <Text style={[styles.docName, { color: colors.text }]}>{doc.name}</Text>
                  <Text style={[styles.docSpec, { color: colors.error }]}>{doc.specialty}</Text>
                  <View style={styles.docHospitalRow}>
                    <Ionicons name="business" size={14} color={colors.textSecondary} />
                    <Text style={[styles.docHospital, { color: colors.textSecondary }]}>{doc.hospital}</Text>
                  </View>
                  <View style={styles.docHospitalRow}>
                    <Ionicons name="call" size={14} color={colors.primary} />
                    <Text style={[styles.docPhone, { color: colors.primary }]}>{doc.phone}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.completeBtn} onPress={handleComplete} disabled={loading}>
            <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.btnGradient}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Complete & Save Session</Text>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 50 }} />
        </View>
      </ScrollView>
    </View>
  );
}

function VitalIcon({ icon, label, value, color, colors }) {
  return (
    <View style={styles.vitalItem}>
      <View style={[styles.vitalIconBg, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.vitalValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.vitalLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: { paddingVertical: 40, alignItems: 'center', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  sessionLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
  timerText: { color: '#fff', fontSize: 64, fontWeight: '300', marginVertical: 10 },
  idText: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  content: { paddingHorizontal: 20, marginTop: -30 },
  vitalsCard: { borderRadius: 25, padding: 20, marginBottom: 25 },
  anxietyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  anxietyTitle: { fontSize: 18, fontWeight: 'bold' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  vitalsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  vitalItem: { alignItems: 'center', flex: 1 },
  vitalIconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  vitalValue: { fontSize: 16, fontWeight: 'bold' },
  vitalLabel: { fontSize: 10, fontWeight: '600' },
  kansyaCard: { borderRadius: 20, padding: 20, marginBottom: 25, borderLeftWidth: 5, borderLeftColor: '#10b981' },
  kansyaHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  kansyaTitle: { color: '#065f46', fontSize: 14, fontWeight: 'bold', marginLeft: 8 },
  kansyaMain: { color: '#065f46', fontSize: 13, lineHeight: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  trackCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 15, marginBottom: 15 },
  trackImage: { width: 60, height: 60, borderRadius: 10 },
  trackInfo: { flex: 1, marginLeft: 15 },
  trackTitle: { fontSize: 16, fontWeight: 'bold' },
  trackArtist: { fontSize: 14, marginVertical: 2 },
  trackDetails: { fontSize: 12, fontWeight: '600' },
  completeBtn: { marginTop: 10, borderRadius: 20, overflow: 'hidden' },
  btnGradient: { paddingVertical: 18, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  specialistSection: { marginTop: 10, marginBottom: 20 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  alertTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  alertDesc: { fontSize: 13, marginBottom: 15, lineHeight: 18 },
  docCard: { borderRadius: 15, padding: 15, marginBottom: 12 },
  docName: { fontSize: 15, fontWeight: 'bold' },
  docSpec: { fontSize: 13, fontWeight: '600', marginVertical: 4 },
  docHospitalRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  docHospital: { fontSize: 12, marginLeft: 6 },
  docPhone: { fontSize: 12, marginLeft: 6, fontWeight: 'bold' }
});
