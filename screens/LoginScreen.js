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
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { authService } from '../src/services/authService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LoginScreen({ onLogin, onNavigateRegister, onNavigateChangePassword, onBack }) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
    >
      <StatusBar style="light" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1, backgroundColor: '#FFFFFF', paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Wavy Header Section */}
          <View style={{ width: '100%', height: 350, position: 'relative', overflow: 'hidden' }}>
            {/* Base Header Gradient */}
            <LinearGradient
              colors={['#FF6F00', '#FF8500', '#F57C00', '#E65100']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.85, y: 1 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />

            {/* Organic Fluid Wavy Textures */}
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 375 350"
              preserveAspectRatio="none"
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <Defs>
                <SvgLinearGradient id="waveHighlight1" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
                  <Stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.06" />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                </SvgLinearGradient>
                <SvgLinearGradient id="waveHighlight2" x1="1" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.02" />
                </SvgLinearGradient>
              </Defs>

              {/* Sweeping translucent wave bands */}
              <Path
                d="M -50,60 C 50,140 180,50 420,150 L 420,-30 L -50,-30 Z"
                fill="url(#waveHighlight1)"
              />
              <Path
                d="M -30,130 C 100,210 240,90 420,200 L 420,350 L -30,350 Z"
                fill="url(#waveHighlight2)"
              />
              <Path
                d="M -20,250 C 90,170 230,280 410,180"
                stroke="rgba(255, 255, 255, 0.16)"
                strokeWidth="1.8"
                fill="none"
              />
              <Path
                d="M -40,100 C 110,180 260,70 420,130"
                stroke="rgba(255, 255, 255, 0.22)"
                strokeWidth="2.2"
                fill="none"
              />
              <Path
                d="M 20,310 C 130,220 280,300 420,240"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth="1.5"
                fill="none"
              />

              {/* Bottom S-Curve Divider Wave separating orange header from white background */}
              <Path
                d="M 0,42 C 30,24 60,10 98,10 C 168,10 215,62 296,62 C 330,62 358,54 375,48 L 375,70 L 0,70 Z"
                fill="#FFFFFF"
                transform="translate(0, 280)"
              />
            </Svg>

            {/* Back button (if available) */}
            {onBack && (
              <TouchableOpacity
                onPress={onBack}
                style={{
                  position: 'absolute',
                  top: Platform.OS === 'ios' ? 52 : 44,
                  left: 20,
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 20,
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            {/* Header Content: Icon, Title & Subtitle */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 50,
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: Platform.OS === 'ios' ? 24 : 16,
              }}
            >
              {/* App Icon Tile */}
              <View
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 26,
                  overflow: 'hidden',
                  marginBottom: 16,
                  shadowColor: '#B45309',
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.35,
                  shadowRadius: 18,
                  elevation: 10,
                }}
              >
                <LinearGradient
                  colors={['#FFB74D', '#FFA726', '#FF9800', '#F57C00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Glass / Gloss shine on upper half */}
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 42,
                      backgroundColor: 'rgba(255, 255, 255, 0.22)',
                      borderTopLeftRadius: 26,
                      borderTopRightRadius: 26,
                    }}
                  />

                  {/* House icon */}
                  <Ionicons name="home" size={46} color="#FFFFFF" />
                </LinearGradient>
              </View>

              {/* Title */}
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: '800',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  letterSpacing: -0.5,
                  marginBottom: 6,
                }}
              >
                Welcome Back
              </Text>

              {/* Subtitle */}
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '500',
                  color: 'rgba(255, 255, 255, 0.92)',
                  textAlign: 'center',
                }}
              >
                Sign in to your account
              </Text>
            </View>
          </View>

          {/* Form Area */}
          <View
            style={{
              backgroundColor: '#FFFFFF',
              paddingHorizontal: 24,
              paddingTop: 8,
            }}
          >
            {/* Error Message */}
            {error ? (
              <View
                style={{
                  backgroundColor: '#FEF2F2',
                  borderColor: '#FCA5A5',
                  borderWidth: 1,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 16,
                  marginBottom: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="alert-circle" size={20} color="#DC2626" style={{ marginRight: 8 }} />
                <Text style={{ color: '#DC2626', fontSize: 13.5, fontWeight: '500', flex: 1 }}>
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Mobile Number Input */}
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E8ECF2',
                borderWidth: 1.5,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.02,
                shadowRadius: 3,
                elevation: 1,
              }}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={24}
                color="#475569"
                style={{ marginRight: 14 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#334155',
                    marginBottom: 2,
                  }}
                >
                  Mobile Number
                </Text>
                <TextInput
                  style={{
                    color: '#0F172A',
                    fontSize: 14.5,
                    fontWeight: '500',
                    padding: 0,
                  }}
                  placeholder="Enter your mobile number"
                  placeholderTextColor="#94A3B8"
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

            {/* Password Input */}
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E8ECF2',
                borderWidth: 1.5,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.02,
                shadowRadius: 3,
                elevation: 1,
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color="#475569"
                style={{ marginRight: 14 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#334155',
                    marginBottom: 2,
                  }}
                >
                  Password
                </Text>
                <TextInput
                  style={{
                    color: '#0F172A',
                    fontSize: 14.5,
                    fontWeight: '500',
                    padding: 0,
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
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
                style={{ paddingLeft: 8 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={22}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>

            {/* Remember Me & Forgot Password Row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 2,
                marginBottom: 24,
              }}
            >
              {/* Remember Me Checkbox */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setRememberMe(!rememberMe)}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <View
                  style={{
                    width: 21,
                    height: 21,
                    borderRadius: 5,
                    backgroundColor: rememberMe ? '#F97316' : '#FFFFFF',
                    borderWidth: rememberMe ? 0 : 1.5,
                    borderColor: '#CBD5E1',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                  }}
                >
                  {rememberMe && <Ionicons name="checkmark" size={15} color="#FFFFFF" />}
                </View>
                <Text style={{ fontSize: 13.5, fontWeight: '500', color: '#475569' }}>
                  Remember me
                </Text>
              </TouchableOpacity>

              {/* Forgot Password Link */}
              <TouchableOpacity
                onPress={onNavigateChangePassword}
                disabled={loading}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={{ fontSize: 13.5, fontWeight: '600', color: '#F97316' }}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Primary Login Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleLogin}
              disabled={loading}
              style={{
                borderRadius: 28,
                overflow: 'hidden',
                shadowColor: '#F97316',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.38,
                shadowRadius: 16,
                elevation: 6,
                opacity: loading ? 0.75 : 1,
              }}
            >
              <LinearGradient
                colors={['#FB923C', '#F97316', '#EA580C']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 15,
                  paddingHorizontal: 24,
                  width: '100%',
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontWeight: '700',
                        fontSize: 17,
                        marginRight: 8,
                        letterSpacing: 0.2,
                      }}
                    >
                      Login
                    </Text>
                    <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* OR Divider */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 26,
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
              <Text
                style={{
                  marginHorizontal: 16,
                  fontSize: 12,
                  fontWeight: '600',
                  color: '#94A3B8',
                  letterSpacing: 0.8,
                }}
              >
                OR
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
            </View>

            {/* Register Link */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#64748B', fontSize: 14, fontWeight: '500' }}>
                Don{"'"}t have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={onNavigateRegister}
                disabled={loading}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={{ color: '#F97316', fontWeight: '700', fontSize: 14 }}>
                  Register
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
