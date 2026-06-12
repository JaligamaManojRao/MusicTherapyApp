import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPatient, startTherapySession } from '../services/api';
import { AuthContext } from '../AuthContext';

import { useTheme } from '../ThemeContext';

const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2);
};

export default function HomeScreen({ navigation }) {
  const { colors, radius, shadow } = useTheme();
  
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  
  const { patientId } = useContext(AuthContext);

  const loadData = async () => {
    try {
      const data = await getPatient(patientId);
      setPatient(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (patientId) loadData();
  }, [patientId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleStartSession = async () => {
    try {
      setSessionLoading(true);
      const sessionData = await startTherapySession(patientId);
      navigation.navigate('TherapySession', { sessionData });
    } catch (error) {
      alert('Failed to start session. Ensure vitals are entered first.');
    } finally {
      setSessionLoading(false);
    }
  };

  if (loading || !patient) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient 
        colors={[colors.primary, colors.primaryDark]} 
        style={styles.topGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.headerTitle}>{patient.name.split(' ')[0]}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
               <LinearGradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']} style={styles.avatarMini}>
                 <Text style={styles.avatarMiniText}>{getInitials(patient.name)}</Text>
               </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Status Card */}
        <View style={[styles.mainCard, { backgroundColor: colors.card }, shadow]}>
           <View style={styles.statusRow}>
              <View style={[styles.statusIndicator, { backgroundColor: colors.success }]} />
              <Text style={[styles.statusText, { color: colors.textSecondary }]}>System Active • Monitoring Vitals</Text>
           </View>
           <Text style={[styles.cardTagline, { color: colors.text }]}>Ready for your daily therapeutic session?</Text>
           
           <TouchableOpacity style={styles.startSessionBtn} onPress={handleStartSession} disabled={sessionLoading}>
              <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.btnGradient}>
                {sessionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Begin Therapy Now</Text>}
              </LinearGradient>
           </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Wellness Hub</Text>
        
        <View style={styles.actionGrid}>
          <ActionCard 
            title="Vitals" 
            icon="fitness" 
            color="#6366f1" 
            onPress={() => navigation.navigate('VitalSigns')} 
            colors={colors} shadow={shadow} radius={radius}
          />
          <ActionCard 
            title="History" 
            icon="time" 
            color="#8b5cf6" 
            onPress={() => navigation.navigate('History')} 
            colors={colors} shadow={shadow} radius={radius}
          />
          <ActionCard 
            title="Specialists" 
            icon="medical" 
            color="#f43f5e" 
            onPress={() => navigation.navigate('Specialists')} 
            colors={colors} shadow={shadow} radius={radius}
          />
          <ActionCard 
            title="Reports" 
            icon="bar-chart" 
            color="#10b981" 
            onPress={() => navigation.navigate('WeeklyReport')} 
            colors={colors} shadow={shadow} radius={radius}
          />
        </View>

        <View style={[styles.infoBanner, { backgroundColor: colors.accent }]}>
           <Ionicons name="information-circle" size={24} color={colors.primary} />
           <Text style={[styles.infoBannerText, { color: colors.primary }]}>
             Consistent listening helps reduce chronic stress levels.
           </Text>
        </View>
        
        <View style={{height: 100}} />
      </ScrollView>
    </View>
  );
}

function ActionCard({ title, icon, color, onPress, colors, shadow, radius }) {
  return (
    <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.card }, shadow]} onPress={onPress}>
      <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={[styles.actionLabel, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, fontWeight: '500' },
  topGradient: { paddingBottom: 40, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, paddingTop: 20 },
  welcomeText: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '500' },
  headerTitle: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  avatarMini: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  avatarMiniText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  scrollView: { marginTop: -30 },
  scrollContent: { paddingHorizontal: 20 },
  mainCard: { borderRadius: 25, padding: 25, marginBottom: 30 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  statusIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardTagline: { fontSize: 20, fontWeight: 'bold', marginBottom: 25, lineHeight: 28 },
  startSessionBtn: { borderRadius: 15, overflow: 'hidden' },
  btnGradient: { paddingVertical: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, marginLeft: 5 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { width: '47%', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 20 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionLabel: { fontSize: 15, fontWeight: 'bold' },
  infoBanner: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, marginTop: 10 },
  infoBannerText: { flex: 1, marginLeft: 12, fontSize: 13, fontWeight: '500', lineHeight: 18 },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
});
