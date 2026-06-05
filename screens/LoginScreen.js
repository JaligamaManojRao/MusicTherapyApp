import React, { useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../AuthContext';
import { loginPatient, registerPatient, updatePatient } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';

export default function LoginScreen() {
  const { colors, radius, shadow } = useTheme();
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('65');
  const [dateOfBirth, setDateOfBirth] = useState('2001-01-01');
  const [loading, setLoading] = useState(false);
  const { setPatientId } = useContext(AuthContext);

  React.useEffect(() => {
    if (isRegistering && dateOfBirth && dateOfBirth.length === 10) {
      const parts = dateOfBirth.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const day = parseInt(parts[2]);
        
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          const birthDate = new Date(year, month - 1, day);
          const today = new Date();
          let calculatedAge = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
          }
          if (calculatedAge >= 0 && calculatedAge < 120) {
            setAge(calculatedAge.toString());
          }
        }
      }
    }
  }, [dateOfBirth, isRegistering]);

  const PREDEFINED_USERS = [
    { name: 'Heramb Ghanekar', email: 'heramb@example.com', gender: 'Male', age: 21, phone: '+91-98765' + Math.floor(10000 + Math.random() * 90000) },
    { name: 'Manoj Rao Jaligama', email: 'manoj@example.com', gender: 'Male', age: 22, phone: '+91-98201' + Math.floor(10000 + Math.random() * 90000) },
    { name: 'Om Gohel', email: 'om@example.com', gender: 'Male', age: 21, phone: '+91-91345' + Math.floor(10000 + Math.random() * 90000) },
    { name: 'KJSIT', email: 'kjsit@example.com', gender: 'Female', age: 45, phone: '+91-22240' + Math.floor(10000 + Math.random() * 90000) }
  ];

  const handleQuickSelect = async (user) => {
    setLoading(true);
    setName(user.name);
    setEmail(user.email);
    const birthYear = 2026 - user.age;
    const dob = `${birthYear}-0${Math.floor(Math.random() * 9) + 1}-15`;

    try {
      const data = await loginPatient(user.email);
      await updatePatient(data.patient_id, { gender: user.gender, phone: user.phone, date_of_birth: dob, age: user.age });
      setPatientId(data.patient_id);
    } catch (e) {
      try {
        const data = await registerPatient({
          name: user.name, age: user.age, gender: user.gender, email: user.email, 
          phone: user.phone, date_of_birth: dob, height: 175, weight: 70,
          medical_history: { "Anxiety": "Mild" }, foot_related_issues: []
        });
        setPatientId(data.patient_id);
      } catch (err) { 
        Alert.alert("Error", "Could not auto-login"); 
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMainAction = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    if (isRegistering && !name) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const data = await registerPatient({
          name,
          email,
          age: parseInt(age) || 25,
          gender,
          phone,
          date_of_birth: dateOfBirth,
          height: parseFloat(height) || 170.0,
          weight: parseFloat(weight) || 65.0,
          medical_history: { "General": "Initial Registration" },
          foot_related_issues: []
        });
        setPatientId(data.patient_id);
      } else {
        const data = await loginPatient(email);
        setPatientId(data.patient_id);
      }
    } catch (e) {
      let msg = isRegistering ? "Registration failed. Check all fields." : "Login failed. Patient not found with this email.";
      if (e.response && e.response.data && e.response.data.detail) {
        msg = e.response.data.detail;
      }
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.fullBg} />
      
      <SafeAreaView style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 40 }}>
          <View style={styles.topSection}>
             <View style={styles.logoCircle}>
                <Ionicons name="musical-notes" size={40} color="#fff" />
             </View>
             <Text style={styles.appTitle}>Personalised Music Intervention</Text>
          </View>

          <View style={[styles.loginCard, { backgroundColor: colors.glass }]}>
             <Text style={[styles.cardTitle, { color: colors.text }]}>{isRegistering ? "Create Account" : "Welcome Back"}</Text>
             
             <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput 
                  style={[styles.input, { color: colors.text }]} 
                  placeholder="Email Address" 
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
             </View>

             {isRegistering && (
               <View>
                 <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput 
                      style={[styles.input, { color: colors.text }]} 
                      placeholder="Full Name" 
                      placeholderTextColor={colors.textSecondary}
                      value={name}
                      onChangeText={setName}
                    />
                 </View>

                 <View style={styles.row}>
                   <View style={[styles.inputContainer, { flex: 1, marginRight: 10, backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                      <TextInput 
                        style={[styles.input, { color: colors.text, opacity: 0.8 }]} 
                        placeholder="Age" 
                        placeholderTextColor={colors.textSecondary}
                        value={age ? age.toString() : ''}
                        editable={false}
                      />
                   </View>
                   <View style={[styles.genderContainer, { flex: 1.5 }]}>
                      <TouchableOpacity 
                        style={[styles.genderBtn, gender === 'Male' && { backgroundColor: colors.primary }]} 
                        onPress={() => setGender('Male')}
                      >
                        <Text style={[styles.genderText, gender === 'Male' && { color: '#fff' }]}>Male</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.genderBtn, gender === 'Female' && { backgroundColor: colors.primary }]} 
                        onPress={() => setGender('Female')}
                      >
                        <Text style={[styles.genderText, gender === 'Female' && { color: '#fff' }]}>Female</Text>
                      </TouchableOpacity>
                   </View>
                 </View>

                 <View style={styles.inputContainer}>
                    <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput 
                      style={[styles.input, { color: colors.text }]} 
                      placeholder="Phone Number" 
                      placeholderTextColor={colors.textSecondary}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                 </View>

                 <View style={styles.row}>
                   <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                      <TextInput 
                        style={[styles.input, { color: colors.text }]} 
                        placeholder="Height (cm)" 
                        placeholderTextColor={colors.textSecondary}
                        value={height}
                        onChangeText={setHeight}
                        keyboardType="number-pad"
                      />
                   </View>
                   <View style={[styles.inputContainer, { flex: 1 }]}>
                      <TextInput 
                        style={[styles.input, { color: colors.text }]} 
                        placeholder="Weight (kg)" 
                        placeholderTextColor={colors.textSecondary}
                        value={weight}
                        onChangeText={setWeight}
                        keyboardType="number-pad"
                      />
                   </View>
                 </View>

                 <View style={styles.inputContainer}>
                    <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <TextInput 
                      style={[styles.input, { color: colors.text }]} 
                      placeholder="DOB (YYYY-MM-DD)" 
                      placeholderTextColor={colors.textSecondary}
                      value={dateOfBirth}
                      onChangeText={setDateOfBirth}
                    />
                 </View>
               </View>
             )}

             <TouchableOpacity style={styles.mainBtn} onPress={handleMainAction} disabled={loading}>
                <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.btnGradient}>
                   {loading ? (
                     <ActivityIndicator color="#fff" />
                   ) : (
                     <Text style={styles.btnText}>{isRegistering ? "Register" : "Sign In"}</Text>
                   )}
                </LinearGradient>
             </TouchableOpacity>

             <View style={styles.dividerRow}>
                <View style={[styles.line, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR QUICK ACCESS</Text>
                <View style={[styles.line, { backgroundColor: colors.border }]} />
             </View>

             <View style={styles.quickSelectGrid}>
                {PREDEFINED_USERS.map((user, idx) => (
                  <TouchableOpacity key={idx} style={[styles.userChip, { backgroundColor: colors.card }, shadow]} onPress={() => handleQuickSelect(user)}>
                     <Text style={[styles.userChipText, { color: colors.primary }]}>{user.name.split(' ')[0]}</Text>
                  </TouchableOpacity>
                ))}
             </View>
          </View>

          <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)} style={styles.switchBtn}>
             <Text style={styles.switchText}>
               {isRegistering ? "Already have an account? Sign In" : "New patient? Create an account"}
             </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fullBg: { ...StyleSheet.absoluteFillObject },
  content: { flex: 1, justifyContent: 'center', padding: 25 },
  topSection: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  appTitle: { color: '#fff', fontSize: 32, fontWeight: 'bold', letterSpacing: 1, textAlign: 'center' },
  appTagline: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  loginCard: { borderRadius: 30, padding: 30, paddingVertical: 40 },
  cardTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 15, paddingHorizontal: 15, marginBottom: 15 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 55, fontSize: 16 },
  mainBtn: { borderRadius: 15, overflow: 'hidden', marginTop: 10 },
  btnGradient: { paddingVertical: 18, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  line: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 10, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  quickSelectGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  userChip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, margin: 5 },
  userChipText: { fontSize: 13, fontWeight: 'bold' },
  switchBtn: { marginTop: 30, alignItems: 'center' },
  switchText: { color: '#fff', fontSize: 14, fontWeight: '500', opacity: 0.9 },
  row: { flexDirection: 'row' },
  genderContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 15, padding: 4, marginBottom: 15, alignItems: 'center' },
  genderBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  genderText: { fontSize: 14, fontWeight: '600', color: '#555' }
});
