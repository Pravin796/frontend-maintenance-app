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

export default function LoginScreen({ onLogin, onNavigateRegister, onNavigateChangePassword, onBack }) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
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
      className="flex-1 bg-slate-50"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
            paddingBottom: keyboardHeight > 0 ? keyboardHeight + 60 : 30,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-10 mt-32">
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

            <View className="mb-2">
              <Text className="text-slate-700 font-semibold mb-2 ml-1">Password</Text>
              <View className="relative justify-center">
                <TextInput
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 text-slate-900 text-base"
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
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

            {onNavigateChangePassword ? (
              <View className="flex-row justify-end mb-6">
                <TouchableOpacity onPress={onNavigateChangePassword} disabled={loading}>
                  <Text className="text-blue-600 font-semibold text-sm">Reset / Change Password</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="mb-6" />
            )}

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
              <Text className="text-slate-500">Don{"'"}t have an account? </Text>
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
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
