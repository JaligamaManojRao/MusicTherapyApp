import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';

export default function SettingsScreen({ navigation }) {
  const { dark, colors, toggleTheme } = useTheme();

  const renderSettingItem = (icon, title, subtitle, rightElement, onPress) => (
    <TouchableOpacity 
      style={[styles.item, { borderBottomColor: colors.border }]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.itemSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {rightElement}
    </TouchableOpacity>
  );

  const renderSectionHeader = (title) => (
    <Text style={[styles.sectionHeader, { color: colors.primary }]}>{title}</Text>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        
        {renderSectionHeader('Appearance')}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          {renderSettingItem(
            dark ? 'moon' : 'sunny', 
            'Dark Mode', 
            'Reduce glare and improve battery life',
            <Switch 
              value={dark} 
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: colors.primary }}
            />
          )}
        </View>

        {renderSectionHeader('Notifications')}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          {renderSettingItem('notifications', 'Reminders', 'Get notified for daily therapy', <Switch value={true} />)}
          {renderSettingItem(
            'stats-chart', 
            'Weekly Reports', 
            'Summary of your anxiety levels', 
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />,
            () => navigation.navigate('WeeklyReport')
          )}
        </View>

        {renderSectionHeader('Privacy & Safety')}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          {renderSettingItem('lock-closed', 'Biometric Lock', 'Use FaceID/Fingerprint', <Switch value={false} />)}
          {renderSettingItem('share', 'Data Sharing', 'Share progress with your doctor', null, () => {})}
        </View>

        {renderSectionHeader('About')}
        <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
          {renderSettingItem('information-circle', 'App Version', 'v1.2.4 (Genuine Build)', <Text style={{color: colors.textSecondary}}>Latest</Text>)}
          {renderSettingItem('help-circle', 'Help Center', 'FAQs and Support', <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />, () => Alert.alert('Support', 'Contacting support...'))}
          {renderSettingItem('document-text', 'Terms of Service', null, <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />, () => {})}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert('Logout', 'Are you sure?')}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerText}>© 2026 Music Therapy Major Project</Text>
        <View style={{height: 40}} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  sectionHeader: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginLeft: 5 },
  sectionCard: { borderRadius: 15, marginBottom: 25, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1 },
  iconContainer: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  itemSubtitle: { fontSize: 12, marginTop: 2 },
  logoutBtn: { backgroundColor: '#fff', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#ffebee' },
  logoutText: { color: '#d32f2f', fontWeight: 'bold', fontSize: 16 },
  footerText: { textAlign: 'center', color: '#999', fontSize: 12, marginTop: 30 }
});
