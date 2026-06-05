import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { savePhysiologicalData, getPatient } from '../services/api';
import { AuthContext } from '../AuthContext';
import { useTheme } from '../ThemeContext';

export default function VitalSignsScreen({ navigation }) {
  const { colors } = useTheme();
  const { patientId } = useContext(AuthContext);

  const [heartRate, setHeartRate] = useState('');
  const [systolicBP, setSystolicBP] = useState('');
  const [diastolicBP, setDiastolicBP] = useState('');
  const [bodyTemp, setBodyTemp] = useState('');
  const [spo2, setSpo2] = useState('');
  const [footIssueFlag, setFootIssueFlag] = useState(false);
  const [patient, setPatient] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  // Fetch patient profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getPatient(patientId);
        setPatient(data);
      } catch (error) {
        console.error('Error fetching patient profile:', error);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, [patientId]);

  // --- WEBSOCKET LOGIC START ---
  useEffect(() => {
    // Replace with your Python backend IP
    const ws = new WebSocket('ws://192.168.29.231:5001');

    ws.onopen = () => {
      console.log('Connected to ECG Python Backend');
      setWsConnected(true);
    };

    ws.onmessage = (e) => {
      // e.data is the raw value from the sensor (e.g., "399")
      // NOTE: This updates the heartRate field with raw data.
      // You may need an algorithm to convert raw pulses to actual BPM.
      setHeartRate(e.data);
    };

    ws.onerror = (e) => {
      console.log('WebSocket Error: ', e.message);
      setWsConnected(false);
    };

    ws.onclose = (e) => {
      console.log('WebSocket Connection Closed: ', e.code, e.reason);
      setWsConnected(false);
    };

    return () => ws.close(); // Cleanup on unmount
  }, []);
  // --- WEBSOCKET LOGIC END ---

  const handleSave = async () => {
    if (!heartRate || !systolicBP || !diastolicBP || !bodyTemp || !spo2) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        patient_id: patientId,
        heart_rate: parseInt(heartRate),
        systolic_bp: parseInt(systolicBP),
        diastolic_bp: parseInt(diastolicBP),
        body_temperature: parseFloat(bodyTemp),
        spo2: parseInt(spo2),
        foot_issue_flag: footIssueFlag
      };

      await savePhysiologicalData(payload);
      Alert.alert('Success', 'Vital signs saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save vital signs.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.infoText, { color: colors.textSecondary }]}>
        {wsConnected
          ? '🟢 ECG Streaming Active: Heart Rate is updating automatically from the sensor.'
          : '⚪ Enter current physiological readings to evaluate anxiety level before starting therapy.'}
      </Text>

      {/* Profile Data (Read-only) */}
      <View style={[styles.profileDataCard, { backgroundColor: colors.accent, borderColor: colors.primary }]}>
        <View style={styles.profileItem}>
          <Text style={[styles.profileLabel, { color: colors.primary }]}>Height</Text>
          <Text style={[styles.profileValue, { color: colors.text }]}>{patient?.height ? `${patient.height} cm` : '170 cm'}</Text>
        </View>
        <View style={styles.profileItem}>
          <Text style={[styles.profileLabel, { color: colors.primary }]}>Weight</Text>
          <Text style={[styles.profileValue, { color: colors.text }]}>{patient?.weight ? `${patient.weight} kg` : '65 kg'}</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={[styles.label, { color: colors.text }]}>Heart Rate (Live Raw)</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.text, fontWeight: 'bold' }]}
              placeholder="Waiting for sensor..."
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              value={heartRate}
              onChangeText={setHeartRate}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: colors.text }]}>O2 Meter (SpO2%)</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }]}
              placeholder="98"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              value={spo2}
              onChangeText={setSpo2}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={[styles.label, { color: colors.text }]}>Systolic BP (mmHg)</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }]}
              placeholder="120"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              value={systolicBP}
              onChangeText={setSystolicBP}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: colors.text }]}>Diastolic BP (mmHg)</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }]}
              placeholder="80"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              value={diastolicBP}
              onChangeText={setDiastolicBP}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Body Temperature (°F)</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, backgroundColor: colors.background, color: colors.text }]}
            placeholder="98.6"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
            value={bodyTemp}
            onChangeText={setBodyTemp}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.label, { color: colors.text }]}>Current Foot Related Issue?</Text>
          <View style={styles.switchContainer}>
            <Text style={{ marginRight: 10, color: footIssueFlag ? colors.textSecondary : colors.primary, fontWeight: 'bold' }}>No</Text>
            <Switch
              trackColor={{ false: "#767577", true: colors.primary }}
              thumbColor={footIssueFlag ? colors.accent : "#f4f3f4"}
              onValueChange={setFootIssueFlag}
              value={footIssueFlag}
            />
            <Text style={{ marginLeft: 10, color: footIssueFlag ? colors.primary : colors.textSecondary, fontWeight: 'bold' }}>Yes</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.buttonContainer} onPress={handleSave} disabled={loading}>
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.button}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Vital Signs</Text>}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoText: { fontSize: 14, marginBottom: 20, fontStyle: 'italic' },
  profileDataCard: { flexDirection: 'row', borderRadius: 12, padding: 15, marginBottom: 20, borderWidth: 1 },
  profileItem: { flex: 1, alignItems: 'center' },
  profileLabel: { fontSize: 12, textTransform: 'uppercase', marginBottom: 4 },
  profileValue: { fontSize: 18, fontWeight: 'bold' },
  card: { borderRadius: 15, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, marginBottom: 30 },
  inputGroup: { marginBottom: 15 },
  row: { flexDirection: 'row' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  switchContainer: { flexDirection: 'row', alignItems: 'center' },
  buttonContainer: { marginBottom: 40 },
  button: { padding: 18, borderRadius: 25, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});