import './global.css';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, SafeAreaView, TouchableOpacity } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');

  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onLogin={() => setCurrentScreen('dashboard')}
        onNavigateRegister={() => setCurrentScreen('register')}
        onBack={() => setCurrentScreen('welcome')}
      />
    );
  }

  if (currentScreen === 'register') {
    return (
      <RegisterScreen
        onNavigateLogin={() => setCurrentScreen('login')}
        onBack={() => setCurrentScreen('welcome')}
      />
    );
  }

  if (currentScreen === 'dashboard') {
    return <DashboardScreen onLogout={() => setCurrentScreen('welcome')} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 items-center justify-center p-6">
        <View className="w-24 h-24 bg-blue-600 rounded-3xl items-center justify-center mb-8 shadow-sm">
          <Text className="text-white text-4xl font-bold">RM</Text>
        </View>

        <Text className="text-3xl font-extrabold text-slate-900 text-center mb-3">
          Residency Maintenance
        </Text>

        <Text className="text-base text-slate-500 text-center mb-10 leading-6 px-4">
          Manage maintenance and payments in one place.
        </Text>

        <View className="w-full mt-2">
          <TouchableOpacity
            className="bg-blue-600 rounded-2xl py-4 items-center mb-4"
            onPress={() => setCurrentScreen('login')}
          >
            <Text className="text-white font-bold text-lg">Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white border border-slate-200 rounded-2xl py-4 items-center"
            onPress={() => setCurrentScreen('register')}
          >
            <Text className="text-slate-700 font-bold text-lg">Create an Account</Text>
          </TouchableOpacity>
        </View>

        <StatusBar style="dark" />
      </View>
    </SafeAreaView>
  );
}
