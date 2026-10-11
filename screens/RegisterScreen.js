import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
      setError('Invalid room number.');
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
        confirmPassword: confirmPassword
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
      className="flex-1 bg-slate-50"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
            paddingBottom: keyboardHeight > 0 ? keyboardHeight + 80 : 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-8 mt-10">
            <Text className="text-3xl font-extrabold text-slate-900 mb-2">Create Account</Text>
            <Text className="text-base text-slate-500 text-center">Join Radhika Maintenance</Text>
          </View>

          <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
            {error ? (
              <Text className="text-red-500 mb-4 text-center">{error}</Text>
            ) : null}

            {successMessage ? (
              <View className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mb-4">
                <Text className="text-emerald-700 text-center">{successMessage}</Text>
              </View>
            ) : null}

            <View className="mb-4">
              <Text className="text-slate-700 font-semibold mb-2 ml-1">Room Number</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 text-base"
                placeholder="e.g. 101"
                keyboardType="number-pad"
                value={room}
                onChangeText={setRoom}
              />
            </View>

            <View className="mb-4">
              <Text className="text-slate-700 font-semibold mb-2 ml-1">Full Name</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 text-base"
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View className="mb-4">
              <Text className="text-slate-700 font-semibold mb-2 ml-1">Mobile Number</Text>
              <TextInput
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 text-base"
                placeholder="Enter 10-digit mobile number"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: 140, animated: true });
                  }, 150);
                }}
              />
            </View>

            <View className="mb-4">
              <Text className="text-slate-700 font-semibold mb-2 ml-1">Password</Text>
              <View className="relative justify-center">
                <TextInput
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 text-slate-900 text-base"
                  placeholder="Min 8 characters"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({ y: 220, animated: true });
                    }, 150);
                  }}
                />
                <TouchableOpacity
                  className="absolute right-4"
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={22}
                    color="#64748b"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-slate-700 font-semibold mb-2 ml-1">Confirm Password</Text>
              <View className="relative justify-center">
                <TextInput
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 text-slate-900 text-base"
                  placeholder="Re-enter password"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 150);
                  }}
                />
                <TouchableOpacity
                  className="absolute right-4"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={22}
                    color="#64748b"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              className={`bg-blue-600 rounded-2xl py-4 items-center mb-4 ${loading ? 'opacity-70' : ''}`}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-lg">Create Account</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-2 mb-4">
              <Text className="text-slate-500">Already have an account? </Text>
              <TouchableOpacity onPress={onNavigateLogin}>
                <Text className="text-blue-600 font-bold">Login</Text>
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
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
