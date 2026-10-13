import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import WaveHeader from '../src/components/WaveHeader';
import PrimaryButton from '../src/components/PrimaryButton';
import { authService } from '../src/services/authService';

export default function ChangePasswordScreen({
  user,
  isForced = false,
  onSuccess,
  onCancel,
  onLogout,
  navigation,
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
  const [keyboardPadding, setKeyboardPadding] = useState(0);
  const inputPositions = useRef({});
  const formCardY = useRef(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e) => setKeyboardPadding(e.endCoordinates.height);
    const onHide = () => setKeyboardPadding(0);

    const subShow = Keyboard.addListener(showEvent, onShow);
    const subHide = Keyboard.addListener(hideEvent, onHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  const scrollToInput = useCallback((fieldName) => {
    setTimeout(() => {
      const yPos = inputPositions.current[fieldName];
      if (yPos != null && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: Math.max(0, yPos - 180), animated: true });
      }
    }, 300);
  }, []);

  const handleBackAction = () => {
    if (isForced && onLogout) {
      onLogout();
    } else if (onCancel) {
      onCancel();
    } else if (navigation) {
      navigation.goBack();
    }
  };

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
        } else if (navigation) {
          navigation.goBack();
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
    <View style={{ flex: 1, backgroundColor: '#FAF9F6' }}>
      <StatusBar style="light" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            flexGrow: 1,
            backgroundColor: '#FAF9F6',
            paddingBottom: Math.max(36, keyboardPadding + 20),
          }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Fluid Wavy Header */}
          <WaveHeader height={72} />

          {/* Header Content: App Icon + Title + Subtitle */}
          <View style={{ alignItems: 'center', marginTop: 4, marginBottom: 16, paddingHorizontal: 20 }}>
            <Image
              source={require('../assets/icon.png')}
              style={{
                width: 84,
                height: 84,
                borderRadius: 24,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.16,
                shadowRadius: 8,
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
                marginBottom: 4,
              }}
            >
              Change Password
            </Text>
            <Text
              style={{
                fontSize: 13.5,
                fontWeight: '500',
                color: '#6B7280',
                textAlign: 'center',
                lineHeight: 19,
                paddingHorizontal: 16,
              }}
            >
              {isForced
                ? 'You must change your temporary password before accessing your dashboard.'
                : 'Enter your current password and choose\na new password.'}
            </Text>
          </View>

          {/* Form Card */}
          <View
            onLayout={(e) => { formCardY.current = e.nativeEvent.layout.y; }}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 26,
              borderWidth: 1.5,
              borderColor: '#F1F5F9',
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 20,
              marginHorizontal: 16,
              marginBottom: 30,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            {error ? (
              <View
                style={{
                  backgroundColor: '#FEF2F2',
                  borderColor: '#FCA5A5',
                  borderWidth: 1,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 14,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="alert-circle" size={18} color="#DC2626" style={{ marginRight: 8 }} />
                <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: '500', flex: 1 }}>
                  {error}
                </Text>
              </View>
            ) : null}

            {successMessage ? (
              <View
                style={{
                  backgroundColor: '#ECFDF5',
                  borderColor: '#A7F3D0',
                  borderWidth: 1,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 14,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="checkmark-circle" size={18} color="#059669" style={{ marginRight: 8 }} />
                <Text style={{ color: '#059669', fontSize: 13, fontWeight: '500', flex: 1 }}>
                  {successMessage}
                </Text>
              </View>
            ) : null}

            {/* Current Password Field */}
            <View
              onLayout={(e) => { inputPositions.current.currentPassword = formCardY.current + e.nativeEvent.layout.y; }}
              style={{
                backgroundColor: '#FFFFFF',
                borderWidth: 1.5,
                borderColor: '#E2E8F0',
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 9,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#4B5569', marginBottom: 1 }}>
                  Current Password
                </Text>
                <TextInput
                  style={{
                    color: '#1F2937',
                    fontSize: 13.5,
                    fontWeight: '500',
                    padding: 0,
                  }}
                  placeholder="Enter current password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  editable={!loading}
                  autoCapitalize="none"
                  onFocus={() => scrollToInput('currentPassword')}
                />
              </View>
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={{ paddingLeft: 8 }}
              >
                <Ionicons
                  name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            {/* New Password Field */}
            <View
              onLayout={(e) => { inputPositions.current.newPassword = formCardY.current + e.nativeEvent.layout.y; }}
              style={{
                backgroundColor: '#FFFFFF',
                borderWidth: 1.5,
                borderColor: '#E2E8F0',
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 9,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Ionicons name="key-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#4B5569', marginBottom: 1 }}>
                  New Password
                </Text>
                <TextInput
                  style={{
                    color: '#1F2937',
                    fontSize: 13.5,
                    fontWeight: '500',
                    padding: 0,
                  }}
                  placeholder="Min 6 characters"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  editable={!loading}
                  autoCapitalize="none"
                  onFocus={() => scrollToInput('newPassword')}
                />
              </View>
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={{ paddingLeft: 8 }}
              >
                <Ionicons
                  name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm New Password Field */}
            <View
              onLayout={(e) => { inputPositions.current.confirmPassword = formCardY.current + e.nativeEvent.layout.y; }}
              style={{
                backgroundColor: '#FFFFFF',
                borderWidth: 1.5,
                borderColor: '#E2E8F0',
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 9,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 18,
              }}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#4B5569', marginBottom: 1 }}>
                  Confirm New Password
                </Text>
                <TextInput
                  style={{
                    color: '#1F2937',
                    fontSize: 13.5,
                    fontWeight: '500',
                    padding: 0,
                  }}
                  placeholder="Re-enter new password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading}
                  autoCapitalize="none"
                  onFocus={() => scrollToInput('confirmPassword')}
                />
              </View>
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={{ paddingLeft: 8 }}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <PrimaryButton
              title={isForced ? 'Update Password & Continue' : 'Update Password'}
              onPress={handleChangePassword}
              loading={loading}
              iconName="arrow-forward"
              style={{ borderRadius: 22, marginBottom: 14 }}
            />

            {/* Cancel / Back Link */}
            <TouchableOpacity
              style={{ alignItems: 'center', paddingVertical: 4 }}
              onPress={handleBackAction}
              disabled={loading}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={{ color: '#64748B', fontWeight: '600', fontSize: 13.5 }}>
                {isForced ? 'Log Out' : user ? 'Cancel' : 'Back to Login'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
}
