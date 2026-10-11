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

      // Give user brief visual feedback before transitioning
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
          <View className="items-center mb-8 mt-32">
            {/* <View
            className={`w-20 h-20 rounded-3xl items-center justify-center mb-4 shadow-sm ${
              isForced ? 'bg-amber-500' : 'bg-blue-600'
            }`}
          >
            <Text className="text-white text-3xl font-bold">
              {isForced ? '!' : 'CP'}
            </Text>
          </View> */}
            <Text className="text-3xl font-extrabold text-slate-900 mb-2 text-center">
              {isForced ? 'Password Change Required' : 'Change Password'}
            </Text>
            <Text className="text-base text-slate-500 text-center px-4">
              {isForced
                ? 'You must change your temporary password before accessing your dashboard.'
                : 'Enter your current password and choose a new password.'}
            </Text>
          </View>

          <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
            {error ? (
              <View className="bg-red-50 border border-red-200 p-4 rounded-xl mb-4">
                <Text className="text-red-600 text-center">{error}</Text>
              </View>
            ) : null}

            {successMessage ? (
              <View className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mb-4">
                <Text className="text-emerald-700 text-center font-medium">
                  {successMessage}
                </Text>
              </View>
            ) : null}

            {/* Current Password Field */}
            <View className="mb-4">
              <Text className="text-slate-700 font-semibold mb-2 ml-1">Current Password</Text>
              <View className="relative justify-center">
                <TextInput
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 text-slate-900 text-base"
                  placeholder="Enter current password"
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  editable={!loading}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  className="absolute right-4"
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={22}
                    color="#64748b"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password Field */}
            <View className="mb-4">
              <Text className="text-slate-700 font-semibold mb-2 ml-1">New Password</Text>
              <View className="relative justify-center">
                <TextInput
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 text-slate-900 text-base"
                  placeholder="Enter new password (min 6 characters)"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  editable={!loading}
                  autoCapitalize="none"
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({ y: 120, animated: true });
                    }, 150);
                  }}
                />
                <TouchableOpacity
                  className="absolute right-4"
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={22}
                    color="#64748b"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Field */}
            <View className="mb-6">
              <Text className="text-slate-700 font-semibold mb-2 ml-1">Confirm New Password</Text>
              <View className="relative justify-center">
                <TextInput
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 pr-12 text-slate-900 text-base"
                  placeholder="Re-enter new password"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading}
                  autoCapitalize="none"
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

            {/* Submit Button */}
            <TouchableOpacity
              className={`bg-blue-600 rounded-2xl py-4 items-center mb-3 ${loading ? 'opacity-70' : ''
                }`}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  {isForced ? 'Update Password & Continue' : 'Update Password'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Voluntary Cancel / Back Button (only if not forced) */}
            {!isForced && onCancel ? (
              <TouchableOpacity
                className="items-center py-3"
                onPress={onCancel}
                disabled={loading}
              >
                <Text className="text-slate-600 font-semibold">
                  {user ? 'Cancel' : 'Back to Login'}
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* Logout Button (if forced, allow user to log out instead of getting trapped) */}
            {isForced && onLogout ? (
              <TouchableOpacity
                className="items-center py-3"
                onPress={onLogout}
                disabled={loading}
              >
                <Text className="text-slate-500 font-semibold">Log Out</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
