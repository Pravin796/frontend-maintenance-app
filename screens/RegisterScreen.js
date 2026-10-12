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

export default function RegisterScreen({ onNavigateLogin, onBack }) {
  const [room, setRoom] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);

  const handleRegister = async () => {
    setError('');
    setSuccessMessage('');

    if (!room.trim() || !fullName.trim() || !mobile.trim() || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    const roomNum = parseInt(room, 10);
    const isValidRoom =
      (roomNum >= 101 && roomNum <= 110) ||
      (roomNum >= 201 && roomNum <= 210) ||
      (roomNum >= 301 && roomNum <= 310) ||
      (roomNum >= 401 && roomNum <= 410);

    if (!isValidRoom) {
      setError('Invalid room number (e.g. 101-110, 201-210, 301-310, 401-410).');
      return;
    }

    if (mobile.replace(/[^0-9]/g, '').length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      await authService.register({
        roomNumber: room,
        name: fullName,
        mobileNumber: mobile,
        password: password,
        confirmPassword: confirmPassword,
      });

      setSuccessMessage('Registration successful! You can now login.');

      setRoom('');
      setFullName('');
      setMobile('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to register. Please check your connection and try again.');
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
          <View className="items-center mt-6 mb-7">
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
              Create Account
            </Text>
            <Text className="text-sm font-medium text-gray-500 text-center">
              Join your residency community
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

            {successMessage ? (
              <View className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl mb-4">
                <Text className="text-emerald-700 text-center text-sm font-medium">{successMessage}</Text>
              </View>
            ) : null}

            {/* Room Number Input */}
            <View className="mb-3.5">
              <View className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 flex-row items-center">
                <Ionicons name="home-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-gray-400 mb-0.5">Room Number</Text>
                  <TextInput
                    className="text-gray-900 text-sm font-medium p-0"
                    placeholder="e.g. 101"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    value={room}
                    onChangeText={setRoom}
                    editable={!loading}
                    onFocus={() => {
                      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Full Name Input */}
            <View className="mb-3.5">
              <View className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 flex-row items-center">
                <Ionicons name="person-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-gray-400 mb-0.5">Full Name</Text>
                  <TextInput
                    className="text-gray-900 text-sm font-medium p-0"
                    placeholder="Enter your full name"
                    placeholderTextColor="#9CA3AF"
                    value={fullName}
                    onChangeText={setFullName}
                    editable={!loading}
                    onFocus={() => {
                      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Mobile Number Input */}
            <View className="mb-3.5">
              <View className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 flex-row items-center">
                <Ionicons name="call-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-gray-400 mb-0.5">Mobile Number</Text>
                  <TextInput
                    className="text-gray-900 text-sm font-medium p-0"
                    placeholder="Enter 10-digit mobile number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    value={mobile}
                    onChangeText={setMobile}
                    autoCapitalize="none"
                    editable={!loading}
                    onFocus={() => {
                      scrollViewRef.current?.scrollTo({ y: 40, animated: true });
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-3.5">
              <View className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 flex-row items-center">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-gray-400 mb-0.5">Password</Text>
                  <TextInput
                    className="text-gray-900 text-sm font-medium p-0"
                    placeholder="Min 8 characters"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    editable={!loading}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollTo({ y: 120, animated: true });
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

            {/* Confirm Password Input */}
            <View className="mb-6">
              <View className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 flex-row items-center">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-gray-400 mb-0.5">Confirm Password</Text>
                  <TextInput
                    className="text-gray-900 text-sm font-medium p-0"
                    placeholder="Re-enter password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    editable={!loading}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollTo({ y: 180, animated: true });
                      }, 100);
                    }}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  className="pl-2"
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary Gradient Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              className={`rounded-2xl overflow-hidden mb-5 ${loading ? 'opacity-70' : ''}`}
              onPress={handleRegister}
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
                    <Text className="text-white font-bold text-base mr-2">Create Account</Text>
                    <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Login Link */}
            <View className="flex-row justify-center mb-3">
              <Text className="text-gray-500 text-sm">Already have an account? </Text>
              <TouchableOpacity onPress={onNavigateLogin} disabled={loading}>
                <Text className="text-[#F57C00] font-bold text-sm">Login</Text>
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
