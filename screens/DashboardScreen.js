import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
  HeroGradientCard,
  StatusTag,
  ActionRowCard,
  ScreenHeader,
  NotificationsModal,
} from '../src/components';
import PaymentScreen from './PaymentScreen';

const TAB_ORDER = ['home', 'payments', 'history', 'profile'];

export default function DashboardScreen({ user, onLogout, onChangePassword, onNavigateAdmin }) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState('home');
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  // Horizontal pager animation for smooth, 100% flicker-free sliding
  const pagerAnim = useRef(new Animated.Value(0)).current;

  // Separate scroll view refs for each tab
  const homeScrollRef = useRef(null);
  const paymentsScrollRef = useRef(null);
  const historyScrollRef = useRef(null);
  const profileScrollRef = useRef(null);

  // Scale animations for individual bottom tab buttons
  const tabScaleAnims = useRef({
    home: new Animated.Value(1),
    payments: new Animated.Value(1),
    history: new Animated.Value(1),
    profile: new Animated.Value(1),
  }).current;

  const userName = user?.fullName || 'Pravin Kumar';
  const roomNumber = user?.roomNumber || '104';

  // Keep pager aligned if screen orientation or dimensions change
  useEffect(() => {
    const idx = TAB_ORDER.indexOf(activeTab);
    pagerAnim.setValue(-idx * screenWidth);
  }, [screenWidth, activeTab, pagerAnim]);

  const handleLogoutConfirm = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: onLogout },
    ]);
  };

  /**
   * Continuous, hardware-accelerated slide between tabs with zero flicker
   */
  const handleTabPress = useCallback(
    (nextTab) => {
      if (nextTab === activeTab) {
        // Scroll active tab to top
        if (nextTab === 'home') homeScrollRef.current?.scrollTo({ y: 0, animated: true });
        else if (nextTab === 'payments') paymentsScrollRef.current?.scrollTo({ y: 0, animated: true });
        else if (nextTab === 'history') historyScrollRef.current?.scrollTo({ y: 0, animated: true });
        else if (nextTab === 'profile') profileScrollRef.current?.scrollTo({ y: 0, animated: true });
        return;
      }

      const nextIndex = TAB_ORDER.indexOf(nextTab);

      // Subtle spring bounce on pressed tab icon
      if (tabScaleAnims[nextTab]) {
        tabScaleAnims[nextTab].setValue(0.85);
        Animated.spring(tabScaleAnims[nextTab], {
          toValue: 1,
          friction: 6,
          tension: 200,
          useNativeDriver: true,
        }).start();
      }

      setActiveTab(nextTab);

      // Smooth continuous glide to the selected tab with zero unmount/remount
      Animated.timing(pagerAnim, {
        toValue: -nextIndex * screenWidth,
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }).start();
    },
    [activeTab, screenWidth, pagerAnim, tabScaleAnims]
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9F6' }}>
      <StatusBar style="dark" />

      {/* Persistent Reusable Screen Header: stays mounted, smoothly updates text/data */}
      <ScreenHeader
        user={user}
        activeTab={activeTab}
        unreadCount={2}
        onPressNotifications={() => setNotificationsVisible(true)}
        onPressAvatar={() => handleTabPress('profile')}
        onPressLogo={() => handleTabPress('home')}
      />

      {/* Horizontal Sliding Pager Container (zero-flicker native translation) */}
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <Animated.View
          style={{
            flex: 1,
            flexDirection: 'row',
            width: screenWidth * 4,
            transform: [{ translateX: pagerAnim }],
          }}
        >
          {/* TAB 0: HOME */}
          <View style={{ width: screenWidth, flex: 1 }}>
            <ScrollView
              ref={homeScrollRef}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 8,
                paddingBottom: 28,
              }}
              showsVerticalScrollIndicator={false}
            >
              {/* Room Card */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleTabPress('profile')}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.03,
                  shadowRadius: 6,
                  elevation: 1.5,
                  borderWidth: 1,
                  borderColor: '#F1F5F9',
                }}
              >
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: '#F57C00',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}
                >
                  <Ionicons name="home" size={20} color="#FFFFFF" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: '#1E293B',
                    }}
                  >
                    Room {roomNumber}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>
                    Primary Residence • Block A
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={19} color="#94A3B8" />
              </TouchableOpacity>

              {/* Outstanding Balance Hero Card - Reusable HeroGradientCard */}
              <HeroGradientCard
                variant="balance"
                title="Outstanding Balance"
                amount="₹1,500"
                onActionPress={() => handleTabPress('payments')}
              />

              {/* Monthly Maintenance Card */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleTabPress('payments')}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 14,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.03,
                  shadowRadius: 6,
                  elevation: 1.5,
                  borderWidth: 1,
                  borderColor: '#F1F5F9',
                }}
              >
                {/* Soft Peach Circle Icon */}
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    backgroundColor: '#FFF3E8',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}
                >
                  <Ionicons name="calendar-outline" size={23} color="#F57C00" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: '#334155',
                      marginBottom: 2,
                    }}
                  >
                    Monthly Maintenance
                  </Text>
                  <Text
                    style={{
                      fontSize: 21,
                      fontWeight: '800',
                      color: '#0F172A',
                      letterSpacing: -0.3,
                      marginBottom: 2,
                    }}
                  >
                    ₹500
                  </Text>
                  <Text
                    style={{
                      fontSize: 12.5,
                      fontWeight: '400',
                      color: '#64748B',
                    }}
                  >
                    Due on 5th of every month
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={19} color="#94A3B8" />
              </TouchableOpacity>

              {/* Recent Payment Card */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleTabPress('history')}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 24,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.03,
                  shadowRadius: 6,
                  elevation: 1.5,
                  borderWidth: 1,
                  borderColor: '#F1F5F9',
                }}
              >
                {/* Soft Mint Circle Icon */}
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    backgroundColor: '#ECFDF5',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#059669" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: '#334155',
                      marginBottom: 4,
                    }}
                  >
                    Recent Payment
                  </Text>
                  <Text
                    style={{
                      fontSize: 13.5,
                      fontWeight: '500',
                      color: '#334155',
                    }}
                  >
                    September 2026 • ₹500
                  </Text>
                </View>

                {/* Paid Badge + Chevron */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <StatusTag label="Paid" variant="emerald" style={{ marginRight: 8 }} />
                  <Ionicons name="chevron-forward" size={19} color="#94A3B8" />
                </View>
              </TouchableOpacity>

              {/* Quick Actions Header */}
              <Text
                style={{
                  fontSize: 16.5,
                  fontWeight: '700',
                  color: '#1E293B',
                  marginBottom: 14,
                }}
              >
                Quick Actions
              </Text>

              {/* Quick Actions 3-Column Grid */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                {/* Tile 1: Make Payment */}
                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={() => handleTabPress('payments')}
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    paddingVertical: 18,
                    paddingHorizontal: 8,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.03,
                    shadowRadius: 6,
                    elevation: 1.5,
                    borderWidth: 1,
                    borderColor: '#F1F5F9',
                  }}
                >
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      backgroundColor: '#FFF2E8',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <Ionicons name="card" size={22} color="#F57C00" />
                  </View>
                  <Text
                    style={{
                      fontSize: 12.5,
                      fontWeight: '600',
                      color: '#1E293B',
                      textAlign: 'center',
                      lineHeight: 16,
                    }}
                  >
                    {'Make\nPayment'}
                  </Text>
                </TouchableOpacity>

                {/* Tile 2: View History */}
                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={() => handleTabPress('history')}
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    paddingVertical: 18,
                    paddingHorizontal: 8,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.03,
                    shadowRadius: 6,
                    elevation: 1.5,
                    borderWidth: 1,
                    borderColor: '#F1F5F9',
                  }}
                >
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      backgroundColor: '#FEF3C7',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <Ionicons name="time" size={22} color="#D97706" />
                  </View>
                  <Text
                    style={{
                      fontSize: 12.5,
                      fontWeight: '600',
                      color: '#1E293B',
                      textAlign: 'center',
                      lineHeight: 16,
                    }}
                  >
                    {'View\nHistory'}
                  </Text>
                </TouchableOpacity>

                {/* Tile 3: Raise Complaint */}
                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={() => {
                    Alert.alert(
                      'Raise Complaint',
                      'Please contact the facility manager at +91 98765 43210 or leave a message with society reception.',
                      [{ text: 'OK' }]
                    );
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    paddingVertical: 18,
                    paddingHorizontal: 8,
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.03,
                    shadowRadius: 6,
                    elevation: 1.5,
                    borderWidth: 1,
                    borderColor: '#F1F5F9',
                  }}
                >
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      backgroundColor: '#DBEAFE',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <Ionicons name="chatbox-ellipses" size={22} color="#2563EB" />
                  </View>
                  <Text
                    style={{
                      fontSize: 12.5,
                      fontWeight: '600',
                      color: '#1E293B',
                      textAlign: 'center',
                      lineHeight: 16,
                    }}
                  >
                    {'Raise\nComplaint'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          {/* TAB 1: PAYMENTS */}
          <View style={{ width: screenWidth, flex: 1 }}>
            <ScrollView
              ref={paymentsScrollRef}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 8,
                paddingBottom: 28,
              }}
              showsVerticalScrollIndicator={false}
            >
              <PaymentScreen
                user={user}
                isTab={true}
                showHeader={false}
                onNavigateHome={() => handleTabPress('home')}
                onNavigateHistory={() => handleTabPress('history')}
                onNavigateProfile={() => handleTabPress('profile')}
                onOpenNotifications={() => setNotificationsVisible(true)}
                onLogout={onLogout}
              />
            </ScrollView>
          </View>

          {/* TAB 2: HISTORY */}
          <View style={{ width: screenWidth, flex: 1 }}>
            <ScrollView
              ref={historyScrollRef}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 8,
                paddingBottom: 28,
              }}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 4,
                  borderWidth: 1,
                  borderColor: '#F1F5F9',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.03,
                  shadowRadius: 6,
                  elevation: 1.5,
                }}
              >
                {[
                  { month: 'October 2026', amount: '₹500', status: 'pending', date: 'Today, 08:30 AM' },
                  { month: 'September 2026', amount: '₹500', status: 'verified', date: '04 Sep, 2026' },
                  { month: 'August 2026', amount: '₹500', status: 'verified', date: '05 Aug, 2026' },
                  { month: 'July 2026', amount: '₹500', status: 'verified', date: '03 Jul, 2026' },
                  { month: 'June 2026', amount: '₹500', status: 'verified', date: '05 Jun, 2026' },
                ].map((item, idx) => {
                  const isVerified = item.status === 'verified';
                  return (
                    <ActionRowCard
                      key={idx}
                      iconName={isVerified ? 'checkmark-circle' : 'time'}
                      iconColor={isVerified ? '#16A34A' : '#D97706'}
                      iconBgColor={isVerified ? '#DCFCE7' : '#FEF3C7'}
                      title={`Room ${roomNumber} • ${item.month}`}
                      subtitle={`${item.amount} • ${item.date}`}
                      tagLabel={isVerified ? 'Verified' : 'Pending'}
                      tagVariant={isVerified ? 'green' : 'amber'}
                      showChevron={true}
                      chevronColor="#94A3B8"
                      showDivider={idx < 4}
                    />
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* TAB 3: PROFILE */}
          <View style={{ width: screenWidth, flex: 1 }}>
            <ScrollView
              ref={profileScrollRef}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 8,
                paddingBottom: 28,
              }}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  padding: 20,
                  alignItems: 'center',
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: '#F1F5F9',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.03,
                  shadowRadius: 6,
                  elevation: 1.5,
                }}
              >
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: '#FFF2E8',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}
                >
                  <Ionicons name="person" size={36} color="#F57C00" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B' }}>{userName}</Text>
                <Text style={{ fontSize: 14, color: '#64748B', marginTop: 2 }}>
                  Room {roomNumber} • {user?.role || 'Resident'}
                </Text>
                {user?.mobileNumber ? (
                  <Text style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
                    +91 {user.mobileNumber}
                  </Text>
                ) : null}
              </View>

              {/* Profile Action Options */}
              {onChangePassword ? (
                <TouchableOpacity
                  onPress={onChangePassword}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#F1F5F9',
                  }}
                >
                  <Ionicons name="key-outline" size={22} color="#F57C00" style={{ marginRight: 12 }} />
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: '#1E293B' }}>
                    Change Password
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}

              {user?.role === 'ADMIN' && onNavigateAdmin ? (
                <TouchableOpacity
                  onPress={onNavigateAdmin}
                  style={{
                    backgroundColor: '#FFF7ED',
                    borderRadius: 16,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#FED7AA',
                  }}
                >
                  <Ionicons name="shield-checkmark-outline" size={22} color="#EA580C" style={{ marginRight: 12 }} />
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: '#EA580C' }}>
                    Switch to Admin Dashboard
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#EA580C" />
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                onPress={handleLogoutConfirm}
                style={{
                  backgroundColor: '#FEF2F2',
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#FEE2E2',
                  marginTop: 8,
                }}
              >
                <Ionicons name="log-out-outline" size={22} color="#DC2626" style={{ marginRight: 12 }} />
                <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: '#DC2626' }}>
                  Logout
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Animated.View>
      </View>

      {/* Notifications Modal */}
      <NotificationsModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />

      {/* Animated Bottom Navigation Bar */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10),
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 6,
        }}
      >
        {/* Tab 1: Home */}
        <TouchableOpacity
          onPress={() => handleTabPress('home')}
          activeOpacity={0.7}
          style={{ alignItems: 'center', minWidth: 68 }}
        >
          <Animated.View
            style={{
              alignItems: 'center',
              transform: [{ scale: tabScaleAnims.home }],
              paddingVertical: 4,
              paddingHorizontal: 12,
              borderRadius: 16,
              backgroundColor: activeTab === 'home' ? '#FFF7ED' : 'transparent',
            }}
          >
            <Ionicons
              name={activeTab === 'home' ? 'home' : 'home-outline'}
              size={22}
              color={activeTab === 'home' ? '#F57C00' : '#94A3B8'}
            />
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: activeTab === 'home' ? '700' : '500',
                color: activeTab === 'home' ? '#F57C00' : '#94A3B8',
                marginTop: 2,
              }}
            >
              Home
            </Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Tab 2: Payments */}
        <TouchableOpacity
          onPress={() => handleTabPress('payments')}
          activeOpacity={0.7}
          style={{ alignItems: 'center', minWidth: 68 }}
        >
          <Animated.View
            style={{
              alignItems: 'center',
              transform: [{ scale: tabScaleAnims.payments }],
              paddingVertical: 4,
              paddingHorizontal: 12,
              borderRadius: 16,
              backgroundColor: activeTab === 'payments' ? '#FFF7ED' : 'transparent',
            }}
          >
            <Ionicons
              name={activeTab === 'payments' ? 'card' : 'card-outline'}
              size={22}
              color={activeTab === 'payments' ? '#F57C00' : '#94A3B8'}
            />
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: activeTab === 'payments' ? '700' : '500',
                color: activeTab === 'payments' ? '#F57C00' : '#94A3B8',
                marginTop: 2,
              }}
            >
              Payments
            </Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Tab 3: History */}
        <TouchableOpacity
          onPress={() => handleTabPress('history')}
          activeOpacity={0.7}
          style={{ alignItems: 'center', minWidth: 68 }}
        >
          <Animated.View
            style={{
              alignItems: 'center',
              transform: [{ scale: tabScaleAnims.history }],
              paddingVertical: 4,
              paddingHorizontal: 12,
              borderRadius: 16,
              backgroundColor: activeTab === 'history' ? '#FFF7ED' : 'transparent',
            }}
          >
            <Ionicons
              name={activeTab === 'history' ? 'time' : 'time-outline'}
              size={22}
              color={activeTab === 'history' ? '#F57C00' : '#94A3B8'}
            />
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: activeTab === 'history' ? '700' : '500',
                color: activeTab === 'history' ? '#F57C00' : '#94A3B8',
                marginTop: 2,
              }}
            >
              History
            </Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Tab 4: Profile */}
        <TouchableOpacity
          onPress={() => handleTabPress('profile')}
          activeOpacity={0.7}
          style={{ alignItems: 'center', minWidth: 68 }}
        >
          <Animated.View
            style={{
              alignItems: 'center',
              transform: [{ scale: tabScaleAnims.profile }],
              paddingVertical: 4,
              paddingHorizontal: 12,
              borderRadius: 16,
              backgroundColor: activeTab === 'profile' ? '#FFF7ED' : 'transparent',
            }}
          >
            <Ionicons
              name={activeTab === 'profile' ? 'person' : 'person-outline'}
              size={22}
              color={activeTab === 'profile' ? '#F57C00' : '#94A3B8'}
            />
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: activeTab === 'profile' ? '700' : '500',
                color: activeTab === 'profile' ? '#F57C00' : '#94A3B8',
                marginTop: 2,
              }}
            >
              Profile
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
