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
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import WaveHeader from '../src/components/WaveHeader';
import PrimaryButton from '../src/components/PrimaryButton';
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
  const [keyboardPadding, setKeyboardPadding] = useState(0);
  const inputPositions = useRef({});
  // Offset from top of ScrollView to start of form card
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
              Create Account
            </Text>
            <Text
              style={{
                fontSize: 13.5,
                fontWeight: '500',
                color: '#6B7280',
                textAlign: 'center',
              }}
            >
              Join your residency community
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

            {/* Room Number Input */}
            <View
              onLayout={(e) => { inputPositions.current.room = formCardY.current + e.nativeEvent.layout.y; }}
              style={{
                backgroundColor: '#FFFFFF',
                borderWidth: 1.5,
                borderColor: '#E2E8F0',
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 9,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <Ionicons name="home-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#4B5569', marginBottom: 1 }}>
                  Room Number
                </Text>
                <TextInput
                  style={{
                    color: '#1F2937',
                    fontSize: 13.5,
                    fontWeight: '500',
                    padding: 0,
                  }}
                  placeholder="e.g. 101"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  value={room}
                  onChangeText={setRoom}
                  editable={!loading}
                  onFocus={() => scrollToInput('room')}
                />
              </View>
            </View>

            {/* Full Name Input */}
            <View
              onLayout={(e) => { inputPositions.current.fullName = formCardY.current + e.nativeEvent.layout.y; }}
              style={{
                backgroundColor: '#FFFFFF',
                borderWidth: 1.5,
                borderColor: '#E2E8F0',
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 9,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <Ionicons name="person-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#4B5569', marginBottom: 1 }}>
                  Full Name
                </Text>
                <TextInput
                  style={{
                    color: '#1F2937',
                    fontSize: 13.5,
                    fontWeight: '500',
                    padding: 0,
                  }}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9CA3AF"
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!loading}
                  onFocus={() => scrollToInput('fullName')}
                />
              </View>
            </View>

            {/* Mobile Number Input */}
            <View
              onLayout={(e) => { inputPositions.current.mobile = formCardY.current + e.nativeEvent.layout.y; }}
              style={{
                backgroundColor: '#FFFFFF',
                borderWidth: 1.5,
                borderColor: '#E2E8F0',
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 9,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <Ionicons name="call-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#4B5569', marginBottom: 1 }}>
                  Mobile Number
                </Text>
                <TextInput
                  style={{
                    color: '#1F2937',
                    fontSize: 13.5,
                    fontWeight: '500',
                    padding: 0,
                  }}
                  placeholder="Enter 10-digit mobile number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={mobile}
                  onChangeText={setMobile}
                  autoCapitalize="none"
                  editable={!loading}
                  onFocus={() => scrollToInput('mobile')}
                />
              </View>
            </View>

            {/* Password Input */}
            <View
              onLayout={(e) => { inputPositions.current.password = formCardY.current + e.nativeEvent.layout.y; }}
              style={{
                backgroundColor: '#FFFFFF',
                borderWidth: 1.5,
                borderColor: '#E2E8F0',
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 9,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
              }}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#4B5569', marginBottom: 1 }}>
                  Password
                </Text>
                <TextInput
                  style={{
                    color: '#1F2937',
                    fontSize: 13.5,
                    fontWeight: '500',
                    padding: 0,
                  }}
                  placeholder="Min 8 characters"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                  onFocus={() => scrollToInput('password')}
                />
              </View>
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={{ paddingLeft: 8 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
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
                marginBottom: 14,
              }}
            >
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#4B5569', marginBottom: 1 }}>
                  Confirm Password
                </Text>
                <TextInput
                  style={{
                    color: '#1F2937',
                    fontSize: 13.5,
                    fontWeight: '500',
                    padding: 0,
                  }}
                  placeholder="Re-enter password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading}
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

            {/* Primary Gradient Button */}
            <PrimaryButton
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              iconName="arrow-forward"
              style={{ borderRadius: 22, marginBottom: 12 }}
            />

            {/* Login Link */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text style={{ color: '#4B5569', fontSize: 13.5, fontWeight: '500' }}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={onNavigateLogin}
                disabled={loading}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={{ color: '#F57C00', fontWeight: 'bold', fontSize: 13.5 }}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>

            {/* Back to Welcome */}
            <TouchableOpacity
              style={{ alignItems: 'center', paddingVertical: 4 }}
              onPress={onBack}
              disabled={loading}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={{ color: '#64748B', fontWeight: '600', fontSize: 13.5 }}>
                Back to Welcome
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
}
