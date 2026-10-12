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

export default function ChangePasswordScreen({
  user,
  isForced = false,
  onSuccess,
  onCancel,
  onLogout,
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);

  const handleChangePassword = async () => {
    if (loading) return;

    setError('');
    setSuccessMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      const message = response?.message || 'Password changed successfully.';
      setSuccessMessage(message);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      const updatedUser = user ? { ...user, mustChangePassword: false } : null;

      // Brief visual feedback before transitioning
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(updatedUser);
        }
      }, 900);
    } catch (err) {
      if (!err.response) {
        setError('Unable to connect to server. Please check your network connection.');
      } else if (err.response.data?.message) {
        setError(err.response.data.message);
      } else if (err.response.status === 401) {
        setError(
          err.response.data?.message ||
          'Authentication required. Please log in first with your temporary or current password.'
        );
      } else {
        setError('Failed to change password. Please check your inputs and try again.');
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

            <Text className="text-3xl font-extrabold text-[#1F2937] mb-1.5 text-center px-2">
              {isForced ? 'Password Required' : 'Change Password'}
            </Text>
            <Text className="text-sm font-medium text-gray-500 text-center px-4">
              {isForced
                ? 'You must change your temporary password before accessing your dashboard.'
                : 'Enter your current password and choose a new password.'}
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
                <Text className="text-emerald-700 text-center text-sm font-medium">
                  {successMessage}
                </Text>
              </View>
            ) : null}

            {/* Current Password Field */}
            <View className="mb-3.5">
              <View className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 flex-row items-center">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-gray-400 mb-0.5">Current Password</Text>
                  <TextInput
                    className="text-gray-900 text-sm font-medium p-0"
                    placeholder="Enter current password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showCurrentPassword}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    editable={!loading}
                    autoCapitalize="none"
                    onFocus={() => {
                      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                    }}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  className="pl-2"
                >
                  <Ionicons
                    name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password Field */}
            <View className="mb-3.5">
              <View className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 flex-row items-center">
                <Ionicons name="key-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-gray-400 mb-0.5">New Password</Text>
                  <TextInput
                    className="text-gray-900 text-sm font-medium p-0"
                    placeholder="Min 6 characters"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    editable={!loading}
                    autoCapitalize="none"
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollTo({ y: 100, animated: true });
                      }, 100);
                    }}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  className="pl-2"
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Field */}
            <View className="mb-6">
              <View className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 flex-row items-center">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-gray-400 mb-0.5">Confirm New Password</Text>
                  <TextInput
                    className="text-gray-900 text-sm font-medium p-0"
                    placeholder="Re-enter new password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    editable={!loading}
                    autoCapitalize="none"
                    onFocus={() => {
                      setTimeout(() => {
                        scrollViewRef.current?.scrollTo({ y: 160, animated: true });
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

            {/* Submit Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              className={`rounded-2xl overflow-hidden mb-4 ${loading ? 'opacity-70' : ''}`}
              onPress={handleChangePassword}
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
                    <Text className="text-white font-bold text-base mr-2">
                      {isForced ? 'Update Password & Continue' : 'Update Password'}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Cancel / Back Button */}
            {!isForced && onCancel ? (
              <TouchableOpacity
                className="items-center py-2"
                onPress={onCancel}
                disabled={loading}
              >
                <Text className="text-gray-400 font-semibold text-sm">
                  {user ? 'Cancel' : 'Back to Login'}
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* Logout Button (if forced) */}
            {isForced && onLogout ? (
              <TouchableOpacity
                className="items-center py-2"
                onPress={onLogout}
                disabled={loading}
              >
                <Text className="text-gray-400 font-semibold text-sm">Log Out</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
