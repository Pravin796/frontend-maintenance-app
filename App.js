import './global.css';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, SafeAreaView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

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
    <View style={{ flex: 1, backgroundColor: '#FAF9F6' }}>
      <StatusBar style="light" />

      {/* Top Gradient Section: flex: 1 ensures it fills all available screen height */}
      <LinearGradient
        colors={['#FF6F00', '#FF8500', '#F57C00', '#E65100']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={{
          flex: 1,
          paddingTop: 48,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Header content: Icon + Title + Subtitle */}
        <View style={{ alignItems: 'center', paddingHorizontal: 24, marginTop: 70 }}>
          <Image
            source={require('./assets/icon.png')}
            style={{
              width: 86,
              height: 86,
              borderRadius: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.2,
              shadowRadius: 10,
            }}
            resizeMode="contain"
          />

          <Text style={{ fontSize: 28, fontWeight: '800', color: '#ffffff', textAlign: 'center', marginTop: 12, marginBottom: 4, letterSpacing: -0.5 }}>
            Radhika Residency
          </Text>

          <Text style={{ fontSize: 14, fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center' }}>
            Manage maintenance and payments in one place.
          </Text>
        </View>

        {/* Bottom group of the gradient: Building + Wave directly connected with no gap */}
        <View style={{ width: '100%', alignItems: 'center' }}>
          <Image
            source={require('./assets/building.png')}
            style={{
              width: '100%',
              height: 260,
              marginBottom: -18,
              zIndex: 2,
            }}
            resizeMode="contain"
          />

          {/* Smooth Organic Wavy Curve */}
          <View style={{ width: '100%', height: 48, overflow: 'hidden' }}>
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 375 48"
              preserveAspectRatio="none"
            >
              <Path
                d="M 0,20 C 95,48 190,50 280,30 C 320,21 355,18 375,20 L 375,48 L 0,48 Z"
                fill="#FAF9F6"
              />
            </Svg>
          </View>
        </View>
      </LinearGradient>

      {/* Bottom Sheet Section: increased height and comfortable breathing room */}
      <View
        style={{
          backgroundColor: '#FAF9F6',
          paddingHorizontal: 24,
          paddingTop: 38,
          paddingBottom: 90,
        }}
      >
        {/* Mobile Number Entry Pill */}
        {/* <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setCurrentScreen('login')}
          style={{
            backgroundColor: '#ffffff',
            borderColor: '#E5E7EB',
            borderWidth: 1,
            borderRadius: 18,
            paddingHorizontal: 16,
            paddingVertical: 13,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 13,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 1,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons name="phone-portrait-outline" size={22} color="#4B5563" style={{ marginRight: 12 }} />
            <View>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B7280', marginBottom: 2 }}>Mobile Number</Text>
              <Text style={{ fontSize: 12, color: '#9CA3AF' }}>Enter your mobile number</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity> */}

        {/* Primary Login Button with guaranteed inline flex styles */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setCurrentScreen('login')}
          style={{
            borderRadius: 18,
            overflow: 'hidden',
            marginBottom: 13,
            shadowColor: '#F57C00',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <LinearGradient
            colors={['#FF8A00', '#F57C00', '#E65100']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              paddingHorizontal: 20,
              width: '100%',
            }}
          >
            <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 16, marginRight: 8 }}>Login</Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer Link to Register */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#6B7280', fontSize: 14 }}>Don{"'"}t have an account? </Text>
          <TouchableOpacity onPress={() => setCurrentScreen('register')}>
            <Text style={{ color: '#F57C00', fontWeight: 'bold', fontSize: 14 }}>Register</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}
