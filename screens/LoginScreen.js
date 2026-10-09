import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';

export default function LoginScreen({ onLogin, onNavigateRegister, onBack }) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!mobile.trim() || !password.trim()) {
      setError('Please enter both mobile number and password.');
      return;
    }
    setError('');
    // No real authentication yet. Just navigate to dashboard.
    onLogin();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-blue-600 rounded-3xl items-center justify-center mb-6 shadow-sm">
            <Text className="text-white text-3xl font-bold">RM</Text>
          </View>
          <Text className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back</Text>
          <Text className="text-base text-slate-500 text-center">Login to your account</Text>
        </View>

        <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          {error ? (
            <Text className="text-red-500 mb-4 text-center">{error}</Text>
          ) : null}

          <View className="mb-4">
            <Text className="text-slate-700 font-semibold mb-2 ml-1">Mobile Number</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 text-base"
              placeholder="Enter your mobile number"
              keyboardType="phone-pad"
              value={mobile}
              onChangeText={setMobile}
              autoCapitalize="none"
            />
          </View>

          <View className="mb-6">
            <Text className="text-slate-700 font-semibold mb-2 ml-1">Password</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 text-base"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            className="bg-blue-600 rounded-2xl py-4 items-center mb-4"
            onPress={handleLogin}
          >
            <Text className="text-white font-bold text-lg">Login</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-2 mb-4">
            <Text className="text-slate-500">Don't have an account? </Text>
            <TouchableOpacity onPress={onNavigateRegister}>
              <Text className="text-blue-600 font-bold">Register</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            className="items-center mt-2"
            onPress={onBack}
          >
            <Text className="text-slate-500 font-semibold">Back to Welcome</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
