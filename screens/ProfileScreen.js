import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getPatient } from '../services/api';
import { AuthContext } from '../AuthContext';

import { useTheme } from '../ThemeContext';

export default function ProfileScreen({ navigation }) {
  const { colors } = useTheme();
  
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const { patientId, setPatientId } = useContext(AuthContext);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const data = await getPatient(patientId);
      setPatient(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [patientId]);

  if (loading || !patient) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2);
  };

  const safeMedicalHistory = typeof patient.medical_history === 'string' 
    ? (function(){ try { return JSON.parse(patient.medical_history); } catch(e){ return {}; } })() 
    : (patient.medical_history || {});
    
  const safeFootIssues = typeof patient.foot_related_issues === 'string'
    ? (function(){ try { const p = JSON.parse(patient.foot_related_issues); return Array.isArray(p) ? p : []; } catch(e){ return []; } })()
    : (Array.isArray(patient.foot_related_issues) ? patient.foot_related_issues : []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Profile Section */}
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <TouchableOpacity 
          style={styles.settingsBtn} 
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(patient.name)}</Text>
        </View>
        <Text style={styles.name}>{patient.name}</Text>
        <Text style={styles.idText}>ID: {patient.patient_id}</Text>
      </LinearGradient>

      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Name:</Text>
            <Text style={[styles.value, { color: colors.text }]}>{patient.name}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>DOB (YYYY-MM-DD):</Text>
            <Text style={[styles.value, { color: colors.text }]}>{patient.date_of_birth || 'Not set'}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Age:</Text>
            <Text style={[styles.value, { color: colors.text }]}>{patient.age}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Gender:</Text>
            <Text style={[styles.value, { color: colors.text }]}>{patient.gender || 'Not specified'}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Phone:</Text>
            <Text style={[styles.value, { color: colors.text }]}>{patient.phone || 'Not specified'}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email:</Text>
            <Text style={[styles.value, { color: colors.text }]}>{patient.email}</Text>
          </View>
        </View>
      </View>

      {/* Medical History */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Medical History</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {Object.entries(safeMedicalHistory).map(([condition, severity], idx) => (
            <View key={idx} style={styles.tagRow}>
              <Ionicons name="medical" size={16} color={colors.error} />
              <Text style={[styles.tagText, { color: colors.text }]}>{condition} ({severity})</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Foot Issues */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Foot Related Issues</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {safeFootIssues && safeFootIssues.length > 0 ? (
            safeFootIssues.map((issue, idx) => (
              <View key={idx} style={styles.tagRow}>
                <Ionicons name="walk" size={16} color="#ed6c02" />
                <Text style={[styles.tagText, { color: colors.text }]}>{issue}</Text>
              </View>
            ))
          ) : (
            <Text style={[styles.noDataText, { color: colors.textSecondary }]}>No foot related issues reported.</Text>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => setPatientId(null)}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      
      <View style={{height: 40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 30, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5, position: 'relative' },
  settingsBtn: { position: 'absolute', top: 40, right: 20, zIndex: 10 },
  avatar: { width: 80, height: 80, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  idText: { fontSize: 14, color: '#e0e0e0', marginTop: 5 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  card: { padding: 15, borderRadius: 12, elevation: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  label: { fontSize: 15, flex: 1 },
  value: { fontSize: 15, fontWeight: '500', flex: 1, textAlign: 'right' },
  tagRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  tagText: { marginLeft: 10, fontSize: 15 },
  noDataText: { fontSize: 14, fontStyle: 'italic', textAlign: 'center', paddingVertical: 10 },
  logoutBtn: { marginHorizontal: 20, marginTop: 20, backgroundColor: '#ffebee', padding: 15, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ffcdd2' },
  logoutText: { color: '#d32f2f', fontSize: 16, fontWeight: 'bold' }
});
