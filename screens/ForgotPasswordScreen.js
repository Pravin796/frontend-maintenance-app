import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import WaveHeader from '../src/components/WaveHeader';
import PrimaryButton from '../src/components/PrimaryButton';

export default function ForgotPasswordScreen({
  onNavigateLogin,
  onBack,
  navigation,
}) {
  const handleBack = () => {
    if (onNavigateLogin) {
      onNavigateLogin();
    } else if (onBack) {
      onBack();
    } else if (navigation) {
      navigation.goBack();
    }
  };

  const steps = [
    {
      step: '1',
      title: 'Contact Society Admin',
      desc: 'Reach out to your building administration office or Admin in Room 207.',
      icon: 'business-outline',
    },
    {
      step: '2',
      title: 'Identity & Room Verification',
      desc: 'The admin verifies your identity and room assignment to safeguard your account against unauthorized access.',
      icon: 'shield-checkmark-outline',
    },
    {
      step: '3',
      title: 'Receive Temporary Password',
      desc: 'Admin securely generates a temporary password (locked with a 1-hour anti-conflict cooldown).',
      icon: 'key-outline',
    },
    {
      step: '4',
      title: 'Sign In & Set New Password',
      desc: 'Log in with your mobile number and temporary password. You will be required to set your new permanent password immediately.',
      icon: 'lock-closed-outline',
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9F6' }}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: '#FAF9F6',
          paddingBottom: 40,
        }}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Wave */}
        <WaveHeader height={72} />

        {/* Header Content */}
        <View style={{ alignItems: 'center', marginTop: 4, marginBottom: 20, paddingHorizontal: 24 }}>
          <Image
            source={require('../assets/icon.png')}
            style={{
              width: 80,
              height: 80,
              borderRadius: 22,
              marginBottom: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
            }}
            resizeMode="contain"
          />

          <Text
            style={{
              fontSize: 26,
              fontWeight: '800',
              color: '#1F2937',
              textAlign: 'center',
              letterSpacing: -0.5,
              marginBottom: 6,
            }}
          >
            Forgot Password?
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#6B7280',
              textAlign: 'center',
              lineHeight: 20,
              paddingHorizontal: 16,
            }}
          >
            Password recovery for apartment residents is securely assisted by society administration.
          </Text>
        </View>

        {/* Security Policy Card */}
        <View
          style={{
            backgroundColor: '#FFF7ED',
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: '#FFEDD5',
            padding: 16,
            marginHorizontal: 20,
            marginBottom: 20,
            flexDirection: 'row',
            alignItems: 'flex-start',
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#FFEDD5',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              marginTop: 2,
            }}
          >
            <Ionicons name="shield-checkmark" size={20} color="#EA580C" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#9A3412', marginBottom: 4 }}>
              Admin-Assisted Security Policy
            </Text>
            <Text style={{ fontSize: 12.5, color: '#C2410C', lineHeight: 18 }}>
              To protect room ownership and financial records from unauthorized takeover, automated OTP/SMS resets are disabled. Passwords can only be reset through verified administrator assistance.
            </Text>
          </View>
        </View>

        {/* Steps Container Card */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            borderWidth: 1.5,
            borderColor: '#F1F5F9',
            paddingHorizontal: 20,
            paddingVertical: 22,
            marginHorizontal: 20,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.04,
            shadowRadius: 10,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: '#1F2937',
              marginBottom: 16,
            }}
          >
            How Password Recovery Works
          </Text>

          {steps.map((item, idx) => (
            <View
              key={item.step}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: idx === steps.length - 1 ? 0 : 18,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#FFF7ED',
                  borderWidth: 1.5,
                  borderColor: '#FDBA74',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                  marginTop: 2,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#EA580C' }}>
                  {item.step}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 2 }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 12.5, color: '#64748B', lineHeight: 18 }}>
                  {item.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Admin Contact Help Card */}
        <View
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: '#E2E8F0',
            padding: 16,
            marginHorizontal: 20,
            marginBottom: 28,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Ionicons name="information-circle-outline" size={24} color="#64748B" style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13.5, fontWeight: '600', color: '#334155' }}>
              Building Administration Office
            </Text>
            <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
              Location: Room 207 • Available during society office hours
            </Text>
          </View>
        </View>

        {/* Back to Sign In Button */}
        <View style={{ paddingHorizontal: 20 }}>
          <PrimaryButton
            title="Back to Sign In"
            onPress={handleBack}
            iconName="arrow-back"
          />
        </View>

        {/* Secondary back link */}
        <TouchableOpacity
          onPress={handleBack}
          style={{ alignItems: 'center', marginTop: 16 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={{ fontSize: 13.5, fontWeight: '600', color: '#F57C00' }}>
            Return to Login Screen
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
