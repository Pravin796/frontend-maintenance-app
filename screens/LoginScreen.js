import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../src/services/authService';

export default function LoginScreen({ onLogin, onNavigateRegister, onNavigateChangePassword, onBack }) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);

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
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-[#FAF9F6]"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
            paddingBottom: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View className="items-center mt-6 mb-8">
            {/* App Icon */}
            <Image
              source={require('../assets/icon.png')}
              style={{
                width: 84,
                height: 84,
                borderRadius: 24,
                marginBottom: 16,
                shadowColor: '#F57C00',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
              }}
              resizeMode="contain"
            />

            <Text className="text-3xl font-extrabold text-[#1F2937] mb-1.5 text-center">
              Welcome Home
            </Text>
            <Text className="text-sm font-medium text-gray-500 text-center">
              Manage your home with ease
            </Text>
          </View>

          {/* Form Card */}
          <View
            className="bg-white p-6 rounded-3xl border border-gray-100"
            style={{
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            {error ? (
              <View className="bg-red-50 border border-red-200 p-3.5 rounded-2xl mb-4">
                <Text className="text-red-600 text-center text-sm font-medium">{error}</Text>
              </View>
            ) : null}

            {/* Mobile Number Input */}
            <View className="mb-4">
              <View className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 flex-row items-center">
                <Ionicons name="call-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-gray-400 mb-0.5">Mobile Number</Text>
                  <TextInput
                    className="text-gray-900 text-sm font-medium p-0"
                    placeholder="Enter your mobile number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    value={mobile}
                    onChangeText={setMobile}
                    autoCapitalize="none"
                    editable={!loading}
                    onFocus={() => {
                      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-2">
              <View className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 flex-row items-center">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-gray-400 mb-0.5">Password</Text>
                  <TextInput
                    className="text-gray-900 text-sm font-medium p-0"
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    editable={!loading}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollTo({ y: 60, animated: true });
                      }, 100);
                    }}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  className="pl-2"
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Change Password Link */}
            {onNavigateChangePassword ? (
              <View className="flex-row justify-end mb-6 mt-1">
                <TouchableOpacity onPress={onNavigateChangePassword} disabled={loading}>
                  <Text className="text-[#F57C00] font-semibold text-xs">Reset / Change Password</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="mb-6" />
            )}

            {/* Primary Gradient Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              className={`rounded-2xl overflow-hidden mb-5 ${loading ? 'opacity-70' : ''}`}
              onPress={handleLogin}
              disabled={loading}
              style={{
                shadowColor: '#F57C00',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
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
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View className="flex-row items-center justify-center">
                    <Text className="text-white font-bold text-base mr-2">Login</Text>
                    <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Register Link */}
            <View className="flex-row justify-center mb-3">
              <Text className="text-gray-500 text-sm">Don{"'"}t have an account? </Text>
              <TouchableOpacity onPress={onNavigateRegister} disabled={loading}>
                <Text className="text-[#F57C00] font-bold text-sm">Register</Text>
              </TouchableOpacity>
            </View>

            {/* Back to Welcome */}
            <TouchableOpacity
              className="items-center py-2"
              onPress={onBack}
              disabled={loading}
            >
              <Text className="text-gray-400 font-semibold text-sm">Back to Welcome</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
