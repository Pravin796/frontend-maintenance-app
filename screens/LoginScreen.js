import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { authService } from '../src/services/authService';

export default function LoginScreen({ onLogin, onNavigateRegister, onBack }) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    const trimmedMobile = mobile.trim();
    const trimmedPassword = password.trim();

    if (!trimmedMobile || !trimmedPassword) {
      setError('Please enter both mobile number and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await authService.login({
        mobileNumber: trimmedMobile,
        password: trimmedPassword,
      });

      if (data && data.token) {
        onLogin(data);
      } else {
        setError('Login failed: Authentication token was not returned.');
      }
    } catch (err) {
      if (!err.response) {
        setError('Unable to connect to server. Please check your network connection.');
      } else if (err.response.status === 401) {
        setError(err.response.data?.message || 'Invalid mobile number or password.');
      } else if (err.response.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Server error. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
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
              editable={!loading}
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
              editable={!loading}
            />
          </View>

          <TouchableOpacity 
            className={`bg-blue-600 rounded-2xl py-4 items-center mb-4 ${loading ? 'opacity-70' : ''}`}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-lg">Login</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-2 mb-4">
            <Text className="text-slate-500">Don't have an account? </Text>
            <TouchableOpacity onPress={onNavigateRegister} disabled={loading}>
              <Text className="text-blue-600 font-bold">Register</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            className="items-center mt-2"
            onPress={onBack}
            disabled={loading}
          >
            <Text className="text-slate-500 font-semibold">Back to Welcome</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
