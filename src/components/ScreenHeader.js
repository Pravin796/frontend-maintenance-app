import React, { memo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

/**
 * Reusable Screen & App Header Component
 *
 * Keeps the header structure persistent and lightweight so switching tabs
 * only updates dynamic data (greetings, title, indicators) without re-mounting
 * the entire header component or causing layout flicker.
 *
 * Props:
 * - user: object with fullName, roomNumber, role, etc.
 * - activeTab: 'home' | 'payments' | 'history' | 'profile'
 * - title: optional title override
 * - subtitle: optional subtitle/greeting override
 * - showLogo: boolean (default true)
 * - showAvatar: boolean (default true)
 * - showNotifications: boolean (default true)
 * - unreadCount: number (default 2)
 * - showBack: boolean (default false, for modal/stack screens)
 * - onBack: func
 * - onPressNotifications: func
 * - onPressAvatar: func
 * - onPressLogo: func
 */
const ScreenHeader = memo(function ScreenHeader({
  user,
  activeTab = 'home',
  title,
  subtitle,
  showLogo = true,
  showAvatar = true,
  showNotifications = true,
  unreadCount = 2,
  showBack = false,
  onBack,
  onPressNotifications,
  onPressAvatar,
  onPressLogo,
  style,
}) {
  const userName = user?.fullName || 'Pravin Kumar';
  const roomNumber = user?.roomNumber || '104';

  // Animated values for smooth title crossfade on tab switch
  const textAnim = useRef(new Animated.Value(1)).current;

  // Determine dynamic title and subtitle based on activeTab
  let dynamicSubtitle = subtitle;
  let dynamicTitle = title;

  if (!dynamicTitle || !dynamicSubtitle) {
    switch (activeTab) {
      case 'payments':
        dynamicSubtitle = dynamicSubtitle || `Good morning, ${userName}`;
        dynamicTitle = dynamicTitle || 'Payments';
        break;
      case 'history':
        dynamicSubtitle = dynamicSubtitle || 'Records & Statements';
        dynamicTitle = dynamicTitle || 'Payment History';
        break;
      case 'profile':
        dynamicSubtitle = dynamicSubtitle || 'Settings & Details';
        dynamicTitle = dynamicTitle || 'Account & Profile';
        break;
      case 'home':
      default:
        dynamicSubtitle = dynamicSubtitle || 'Good morning,';
        dynamicTitle = dynamicTitle || `${userName} 👋`;
        break;
    }
  }

  const insets = useSafeAreaInsets();
  const statusBarHeight = RNStatusBar.currentHeight || 0;

  // Notch & status bar safe insets:
  // - Realme 2 Pro and other notched devices have status bar heights of 38-44px.
  // - Samsung A56 has a punch hole camera with insets.top ~36-40px.
  // - We take Math.max(insets.top, statusBarHeight, 40) + 8 so the header is never obscured.
  const computedTopPadding = Platform.OS === 'android'
    ? Math.max(insets.top, statusBarHeight, 40) + 8
    : Math.max(insets.top, 14) + 6;

  // Animate text smoothly when dynamicTitle or dynamicSubtitle changes
  useEffect(() => {
    textAnim.setValue(0.7);
    Animated.timing(textAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [dynamicTitle, dynamicSubtitle, textAnim]);

  return (
    <View
      style={[
        {
          paddingHorizontal: 20,
          paddingTop: computedTopPadding,
          paddingBottom: 14,
          backgroundColor: '#FAF9F6',
        },
        style,
      ]}
    >
      {/* Top Utility Bar: Logo / Back + Bell + Avatar */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        {/* Left: Back button OR App Brand Logo */}
        {showBack ? (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.7}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 6,
              elevation: 1,
              borderWidth: 1,
              borderColor: '#F1F5F9',
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#1E293B" />
          </TouchableOpacity>
        ) : showLogo ? (
          <TouchableOpacity
            onPress={onPressLogo}
            activeOpacity={onPressLogo ? 0.7 : 1}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            {/* Orange Home Icon Badge */}
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: '#F57C00',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
                shadowColor: '#F57C00',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Ionicons name="home" size={20} color="#FFFFFF" />
            </View>

            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '800',
                  color: '#0F172A',
                  letterSpacing: -0.4,
                  lineHeight: 24,
                }}
              >
                Residency
              </Text>
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: '600',
                  color: '#94A3B8',
                  marginTop: -1,
                }}
              >
                Room {roomNumber}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View />
        )}

        {/* Right Actions: Notifications Bell + User Avatar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {/* Notification Bell */}
          {showNotifications && (
            <TouchableOpacity
              onPress={onPressNotifications}
              activeOpacity={0.7}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 1,
                borderWidth: 1,
                borderColor: '#F1F5F9',
                position: 'relative',
              }}
            >
              <Ionicons name="notifications-outline" size={22} color="#1E293B" />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: 9,
                    right: 10,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#F97316',
                    borderWidth: 1.5,
                    borderColor: '#FFFFFF',
                  }}
                />
              )}
            </TouchableOpacity>
          )}

          {/* User Avatar */}
          {showAvatar && (
            <TouchableOpacity
              onPress={onPressAvatar}
              activeOpacity={0.8}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: activeTab === 'profile' ? '#F57C00' : '#FED7AA',
                backgroundColor: '#FFF7ED',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 6,
                elevation: 1,
              }}
            >
              <Image
                source={require('../../assets/user-avatar.jpg')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Dynamic Subtitle/Greeting & Screen Title */}
      <Animated.View
        style={{
          opacity: textAnim,
          transform: [
            {
              translateY: textAnim.interpolate({
                inputRange: [0.7, 1],
                outputRange: [4, 0],
              }),
            },
          ],
        }}
      >
        <Text
          style={{
            fontSize: 14.5,
            fontWeight: '500',
            color: '#64748B',
            marginBottom: 3,
            letterSpacing: 0.1,
          }}
        >
          {dynamicSubtitle}
        </Text>
        <Text
          style={{
            fontSize: activeTab === 'home' ? 24 : 30,
            fontWeight: '800',
            color: '#0F172A',
            letterSpacing: -0.5,
          }}
        >
          {dynamicTitle}
        </Text>
      </Animated.View>
    </View>
  );
});

export default ScreenHeader;
