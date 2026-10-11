import './global.css';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import { authService } from './src/services/authService';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [currentUser, setCurrentUser] = useState(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await authService.getStoredToken();
        const user = await authService.getCurrentUser();
        if (token && user) {
          setCurrentUser(user);
          if (user.mustChangePassword) {
            setCurrentScreen('changePassword');
          } else {
            setCurrentScreen('dashboard');
          }
        }
      } catch {
        // If restoration fails, stay on welcome screen
      } finally {
        setIsRestoringSession(false);
      }
    };

    restoreSession();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue clearing local state
    }
    setCurrentUser(null);
    setCurrentScreen('welcome');
  };

  if (isRestoringSession) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  if (currentScreen === 'login') {
    return (
      <LoginScreen
        onLogin={(userData) => {
          const user = {
            userId: userData.userId,
            roomNumber: userData.roomNumber,
            mobileNumber: userData.mobileNumber,
            role: userData.role,
            mustChangePassword: userData.mustChangePassword,
          };
          setCurrentUser(user);
          if (userData.mustChangePassword) {
            setCurrentScreen('changePassword');
          } else {
            setCurrentScreen('dashboard');
          }
        }}
        onNavigateRegister={() => setCurrentScreen('register')}
        onNavigateChangePassword={() => setCurrentScreen('changePassword')}
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

  if (currentScreen === 'changePassword') {
    return (
      <ChangePasswordScreen
        user={currentUser}
        isForced={Boolean(currentUser?.mustChangePassword)}
        onSuccess={(updatedUser) => {
          const nextUser = updatedUser || (currentUser ? { ...currentUser, mustChangePassword: false } : null);
          setCurrentUser(nextUser);
          if (nextUser) {
            setCurrentScreen('dashboard');
          } else {
            setCurrentScreen('login');
          }
        }}
        onCancel={() => {
          if (currentUser && !currentUser.mustChangePassword) {
            setCurrentScreen('dashboard');
          } else {
            setCurrentScreen('login');
          }
        }}
        onLogout={handleLogout}
      />
    );
  }

  if (currentScreen === 'dashboard') {
    return (
      <DashboardScreen
        user={currentUser}
        onLogout={handleLogout}
        onChangePassword={() => setCurrentScreen('changePassword')}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 items-center justify-center p-6">
        <Image
          source={require('./assets/icon.png')}
          className="w-24 h-24 rounded-3xl mb-8 shadow-sm"
          resizeMode="cover"
        />

        <Text className="text-3xl font-extrabold text-slate-900 text-center mb-3">
          Radhika Maintenance
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
