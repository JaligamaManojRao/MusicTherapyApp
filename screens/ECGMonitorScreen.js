import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../ThemeContext';

export default function ECGMonitorScreen() {
  const { colors } = useTheme();
  const [heartRate, setHeartRate] = useState('---');
  const [status, setStatus] = useState('Disconnected');
  const [logs, setLogs] = useState([]);

  const SERVER_IP = '192.168.29.231';
  const PORT = '5001';

  const addLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString().split(' ')[0];
    setLogs((prev) => [`[${timestamp}] ${msg}`, ...prev].slice(0, 5));
  };

  useEffect(() => {
    let ws;
    let timeout;

    const connect = () => {
      setStatus('Connecting...');
      ws = new WebSocket(`ws://${SERVER_IP}:${PORT}`);

      ws.onopen = () => {
        setStatus('Connected');
        addLog('✅ Link Established');
      };

      ws.onmessage = (e) => {
        setHeartRate(e.data);
      };

      ws.onerror = (e) => {
        setStatus('Error');
        addLog('⚠️ Connection Failed');
      };

      ws.onclose = () => {
        setStatus('Disconnected');
        addLog('🔄 Retrying in 3s...');
        // Try to reconnect every 3 seconds
        timeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Visual Status Indicator */}
      <View style={[styles.statusBanner, { backgroundColor: status === 'Connected' ? '#2ecc71' : '#e74c3c' }]}>
        <Text style={styles.statusText}>{status.toUpperCase()}</Text>
      </View>

      {/* Main Data Card */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>RAW SENSOR STREAM</Text>
        <Text style={[styles.hugeValue, { color: colors.primary }]}>{heartRate}</Text>
        <Text style={[styles.unitText, { color: colors.textSecondary }]}>Units (Port {PORT})</Text>
      </View>

      {/* Live Logs for Debugging */}
      <View style={styles.terminal}>
        <Text style={styles.terminalHeader}>SYSTEM LOGS</Text>
        {logs.map((log, i) => (
          <Text key={i} style={styles.logText}>{log}</Text>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  statusBanner: { padding: 8, borderRadius: 20, alignItems: 'center', marginBottom: 20 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  card: { borderRadius: 20, padding: 40, alignItems: 'center', elevation: 5, shadowOpacity: 0.1 },
  label: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  hugeValue: { fontSize: 100, fontWeight: 'bold', marginVertical: 10 },
  unitText: { fontSize: 14 },
  terminal: { backgroundColor: '#121212', padding: 15, borderRadius: 12, marginTop: 25 },
  terminalHeader: { color: '#666', fontSize: 10, marginBottom: 8, fontWeight: 'bold' },
  logText: { color: '#00FF00', fontFamily: 'monospace', fontSize: 12, marginBottom: 4 }
});
