import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './screens/HomeScreen';
import VitalSignsScreen from './screens/VitalSignsScreen';
import TherapySessionScreen from './screens/TherapySessionScreen';
import ECGMonitorScreen from './screens/ECGMonitorScreen';

import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import SpecialistsScreen from './screens/SpecialistsScreen';
import SettingsScreen from './screens/SettingsScreen';
import WeeklyReportScreen from './screens/WeeklyReportScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen 
        name="VitalSigns" 
        component={VitalSignsScreen} 
        options={{ headerShown: true, title: 'Enter Vital Signs' }} 
      />
      <Stack.Screen 
        name="TherapySession" 
        component={TherapySessionScreen} 
        options={{ headerShown: true, title: 'Therapy Session' }} 
      />
      <Stack.Screen 
        name="Specialists" 
        component={SpecialistsScreen} 
        options={{ headerShown: true, title: 'Medical Directory' }} 
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ headerShown: true, title: 'Settings' }} 
      />
      <Stack.Screen 
        name="WeeklyReport" 
        component={WeeklyReportScreen} 
        options={{ headerShown: true, title: 'Weekly Progress' }} 
      />
      <Stack.Screen 
        name="ECGMonitor" 
        component={ECGMonitorScreen} 
        options={{ headerShown: true, title: 'Live ECG Monitor' }} 
      />
    </Stack.Navigator>
  );
}

import { AuthContext, AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import LoginScreen from './screens/LoginScreen';

function RootNavigator() {
  const { patientId } = React.useContext(AuthContext);

  if (!patientId) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }



  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';

            } else if (route.name === 'History') {
              iconName = focused ? 'time' : 'time-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#667eea',
          tabBarInactiveTintColor: '#999999',
          tabBarStyle: { backgroundColor: '#fff', paddingBottom: 5, height: 60, shadowOpacity: 0.1 },
          headerShown: true
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} options={{ headerShown: false }} />

        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
