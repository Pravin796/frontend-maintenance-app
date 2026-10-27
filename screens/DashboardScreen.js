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
  RefreshControl,
  ActivityIndicator,
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
import OnlinePaymentScreen from './OnlinePaymentScreen';
import CashPaymentScreen from './CashPaymentScreen';
import { getUserDashboard, getMyPayments, getMyMaintenance } from '../src/services/api';

const TAB_ORDER = ['home', 'payments', 'history', 'profile'];

export default function DashboardScreen({ user, onLogout, onChangePassword, onNavigateAdmin }) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState('home');
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  // Horizontal pager animation for smooth, 100% flicker-free sliding between tabs
  const pagerAnim = useRef(new Animated.Value(0)).current;

  // Sub-page pager animation for Payments <-> Online Payment <-> Cash Payment transition
  const [paymentSubView, setPaymentSubView] = useState('main'); // 'main' | 'online' | 'cash'
  const paymentSubPagerAnim = useRef(new Animated.Value(0)).current;

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

  // Live dashboard API state
  const [dashboardData, setDashboardData] = useState(null);
  const [myPayments, setMyPayments] = useState([]);
  const [myMaintenance, setMyMaintenance] = useState([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoadingDashboard(true);
    }
    setDashboardError(null);
    try {
      const [dashRes, paymentsRes, maintRes] = await Promise.allSettled([
        getUserDashboard(),
        getMyPayments(),
        getMyMaintenance(),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value) {
        setDashboardData(dashRes.value);
      }
      if (paymentsRes.status === 'fulfilled' && Array.isArray(paymentsRes.value)) {
        setMyPayments(paymentsRes.value);
      }
      if (maintRes.status === 'fulfilled' && Array.isArray(maintRes.value)) {
        setMyMaintenance(maintRes.value);
      }

      if (dashRes.status === 'rejected') {
        const err = dashRes.reason;
        console.warn('Failed to load user dashboard:', err?.message || err);
        setDashboardError(
          err?.response?.data?.message || err?.message || 'Unable to connect to dashboard server'
        );
      }
    } catch (err) {
      console.warn('Dashboard fetch exception:', err);
    } finally {
      setIsLoadingDashboard(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  // Formatters and helpers
  const formatCurrency = (val) => {
    if (val == null || isNaN(val)) return '₹0';
    return `₹${Number(val).toLocaleString('en-IN')}`;
  };

  const formatBillingMonth = (billingMonth) => {
    if (!billingMonth) return 'Current Month';
    if (typeof billingMonth === 'string') {
      const parts = billingMonth.split('-');
      if (parts.length === 2) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const d = new Date(year, month, 1);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
        }
      }
    }
    if (Array.isArray(billingMonth) && billingMonth.length >= 2) {
      const d = new Date(billingMonth[0], billingMonth[1] - 1, 1);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      }
    }
    return String(billingMonth);
  };

  const formatPaymentDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return String(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return String(dateStr);
    }
  };

  // Resolved dynamic values from API with fallbacks
  const userName = dashboardData?.residentName || user?.fullName || 'Pravin Kumar';
  const roomNumber = dashboardData?.roomNumber || user?.roomNumber || '101';
  const maintenanceRate = dashboardData?.maintenanceRate != null ? Number(dashboardData.maintenanceRate) : 500;
  const outstandingBalance = dashboardData?.outstandingBalance != null ? Number(dashboardData.outstandingBalance) : 0;
  const currentMaintenance = dashboardData?.currentMaintenance || null;
  const recentPayment = dashboardData?.recentPayment || null;

  // Keep pager aligned if screen orientation or dimensions change
  useEffect(() => {
    const idx = TAB_ORDER.indexOf(activeTab);
    pagerAnim.setValue(-idx * screenWidth);
    paymentSubPagerAnim.setValue(
      paymentSubView === 'online'
        ? -screenWidth
        : paymentSubView === 'cash'
          ? -2 * screenWidth
          : 0
    );
  }, [screenWidth, activeTab, paymentSubView, pagerAnim, paymentSubPagerAnim]);

  const handleOpenOnlinePayment = useCallback(() => {
    setPaymentSubView('online');
    Animated.timing(paymentSubPagerAnim, {
      toValue: -screenWidth,
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();
  }, [screenWidth, paymentSubPagerAnim]);

  const handleOpenCashPayment = useCallback(() => {
    setPaymentSubView('cash');
    Animated.timing(paymentSubPagerAnim, {
      toValue: -2 * screenWidth,
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();
  }, [screenWidth, paymentSubPagerAnim]);

  const handleBackToMainPayments = useCallback(() => {
    setPaymentSubView('main');
    Animated.timing(paymentSubPagerAnim, {
      toValue: 0,
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();
  }, [paymentSubPagerAnim]);

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
        user={{
          ...user,
          fullName: userName,
          roomNumber,
        }}
        activeTab={activeTab}
        title={
          activeTab === 'payments' && paymentSubView === 'online'
            ? 'Online Payment'
            : activeTab === 'payments' && paymentSubView === 'cash'
              ? 'Cash Payment'
              : undefined
        }
        subtitle={
          activeTab === 'payments' && paymentSubView === 'online'
            ? 'Pay your maintenance securely using UPI'
            : activeTab === 'payments' && paymentSubView === 'cash'
              ? 'Declare your cash payment to the admin. It will be verified and updated in your maintenance balance.'
              : undefined
        }
        showBack={activeTab === 'payments' && paymentSubView !== 'main'}
        onBack={handleBackToMainPayments}
        unreadCount={2}
        onPressNotifications={() => setNotificationsVisible(true)}
        onPressAvatar={() => handleTabPress('profile')}
        onPressLogo={() => {
          if (activeTab === 'payments' && paymentSubView !== 'main') {
            handleBackToMainPayments();
          }
          handleTabPress('home');
        }}
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
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={() => fetchDashboardData(true)}
                  tintColor="#F57C00"
                  colors={['#F57C00']}
                />
              }
            >
              {/* Optional Error / Retry Notice Banner if request failed */}
              {dashboardError && !dashboardData && (
                <View
                  style={{
                    backgroundColor: '#FEF2F2',
                    borderRadius: 16,
                    padding: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 14,
                    borderWidth: 1,
                    borderColor: '#FEE2E2',
                  }}
                >
                  <Ionicons name="alert-circle" size={22} color="#DC2626" style={{ marginRight: 10 }} />
                  <Text style={{ flex: 1, fontSize: 13, color: '#991B1B' }}>
                    {dashboardError}
                  </Text>
                  <TouchableOpacity
                    onPress={() => fetchDashboardData(false)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      backgroundColor: '#DC2626',
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF' }}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

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
                    {userName} • Primary Residence
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={19} color="#94A3B8" />
              </TouchableOpacity>

              {/* Outstanding Balance Hero Card - Reusable HeroGradientCard */}
              <HeroGradientCard
                variant="balance"
                title="Outstanding Balance"
                amount={formatCurrency(outstandingBalance)}
                onActionPress={() => {
                  handleTabPress('payments');
                  handleOpenOnlinePayment();
                }}
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
                    {formatCurrency(currentMaintenance?.amount ?? maintenanceRate)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12.5,
                      fontWeight: '400',
                      color: '#64748B',
                    }}
                  >
                    {currentMaintenance?.billingMonth
                      ? `Due for ${formatBillingMonth(currentMaintenance.billingMonth)}`
                      : 'Due on 5th of every month'}
                  </Text>
                </View>

                {currentMaintenance?.status ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <StatusTag
                      label={
                        currentMaintenance.status === 'PAID'
                          ? 'Paid'
                          : currentMaintenance.status === 'PARTIALLY_PAID'
                            ? 'Partial'
                            : 'Pending'
                      }
                      variant={
                        currentMaintenance.status === 'PAID'
                          ? 'emerald'
                          : currentMaintenance.status === 'PARTIALLY_PAID'
                            ? 'amber'
                            : 'orange'
                      }
                      style={{ marginRight: 8 }}
                    />
                    <Ionicons name="chevron-forward" size={19} color="#94A3B8" />
                  </View>
                ) : (
                  <Ionicons name="chevron-forward" size={19} color="#94A3B8" />
                )}
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
                {/* Status-tinted Circle Icon */}
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    backgroundColor:
                      !recentPayment
                        ? '#F1F5F9'
                        : recentPayment.status === 'VERIFIED'
                          ? '#ECFDF5'
                          : recentPayment.status === 'PENDING'
                            ? '#FEF3C7'
                            : '#FEE2E2',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 14,
                  }}
                >
                  <Ionicons
                    name={
                      !recentPayment
                        ? 'receipt-outline'
                        : recentPayment.status === 'VERIFIED'
                          ? 'checkmark-circle'
                          : recentPayment.status === 'PENDING'
                            ? 'time'
                            : 'alert-circle'
                    }
                    size={24}
                    color={
                      !recentPayment
                        ? '#64748B'
                        : recentPayment.status === 'VERIFIED'
                          ? '#059669'
                          : recentPayment.status === 'PENDING'
                            ? '#D97706'
                            : '#DC2626'
                    }
                  />
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
                    Recent Payment{recentPayment?.method ? ` (${recentPayment.method})` : ''}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13.5,
                      fontWeight: '500',
                      color: '#334155',
                    }}
                  >
                    {recentPayment
                      ? `${formatPaymentDate(recentPayment.createdAt)} • ${formatCurrency(recentPayment.amount)}`
                      : 'No recent payments recorded'}
                  </Text>
                </View>

                {/* Status Badge + Chevron */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <StatusTag
                    label={
                      !recentPayment
                        ? 'None'
                        : recentPayment.status === 'VERIFIED'
                          ? 'Verified'
                          : recentPayment.status === 'PENDING'
                            ? 'Pending'
                            : recentPayment.status === 'REJECTED'
                              ? 'Rejected'
                              : 'Failed'
                    }
                    variant={
                      !recentPayment
                        ? 'gray'
                        : recentPayment.status === 'VERIFIED'
                          ? 'emerald'
                          : recentPayment.status === 'PENDING'
                            ? 'amber'
                            : 'red'
                    }
                    style={{ marginRight: 8 }}
                  />
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
                  onPress={() => {
                    handleTabPress('payments');
                    handleOpenOnlinePayment();
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

          {/* TAB 1: PAYMENTS (with horizontal slide to Online Payment & Cash Payment) */}
          <View style={{ width: screenWidth, flex: 1, overflow: 'hidden' }}>
            <Animated.View
              style={{
                flex: 1,
                flexDirection: 'row',
                width: screenWidth * 3,
                transform: [{ translateX: paymentSubPagerAnim }],
              }}
            >
              {/* SUB-VIEW 0: Main Payments Screen */}
              <View style={{ width: screenWidth, flex: 1 }}>
                <ScrollView
                  ref={paymentsScrollRef}
                  contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 8,
                    paddingBottom: 28,
                  }}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefreshing}
                      onRefresh={() => fetchDashboardData(true)}
                      tintColor="#F57C00"
                      colors={['#F57C00']}
                    />
                  }
                >
                  <PaymentScreen
                    user={{
                      ...user,
                      fullName: userName,
                      roomNumber,
                    }}
                    dashboardData={dashboardData}
                    isTab={true}
                    showHeader={false}
                    onNavigateOnlinePayment={handleOpenOnlinePayment}
                    onNavigateCashPayment={handleOpenCashPayment}
                    onNavigateHome={() => handleTabPress('home')}
                    onNavigateHistory={() => handleTabPress('history')}
                    onNavigateProfile={() => handleTabPress('profile')}
                    onOpenNotifications={() => setNotificationsVisible(true)}
                    onLogout={onLogout}
                    onRefresh={() => fetchDashboardData(true)}
                  />
                </ScrollView>
              </View>

              {/* SUB-VIEW 1: Online Payment Screen (from screenshot) */}
              <View style={{ width: screenWidth, flex: 1 }}>
                <OnlinePaymentScreen
                  user={{
                    ...user,
                    fullName: userName,
                    roomNumber,
                  }}
                  outstandingAmount={formatCurrency(outstandingBalance)}
                  billingMonth={
                    currentMaintenance?.billingMonth
                      ? formatBillingMonth(currentMaintenance.billingMonth)
                      : 'October 2026'
                  }
                  upiId="pravin@example@okaxis"
                  recipientName="Residency Maintenance"
                  onBack={handleBackToMainPayments}
                  onSubmitVerification={() => {
                    handleBackToMainPayments();
                    fetchDashboardData(true);
                  }}
                />
              </View>

              {/* SUB-VIEW 2: Cash Payment Screen (from screenshot) */}
              <View style={{ width: screenWidth, flex: 1 }}>
                <CashPaymentScreen
                  user={{
                    ...user,
                    fullName: userName,
                    roomNumber,
                  }}
                  outstandingAmount={formatCurrency(outstandingBalance)}
                  defaultAmount={String(outstandingBalance > 0 ? outstandingBalance : maintenanceRate)}
                  onBack={handleBackToMainPayments}
                  onSubmitCashPayment={() => {
                    handleBackToMainPayments();
                    fetchDashboardData(true);
                  }}
                />
              </View>
            </Animated.View>
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
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={() => fetchDashboardData(true)}
                  tintColor="#F57C00"
                  colors={['#F57C00']}
                />
              }
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
                {(() => {
                  const historyList = [];

                  if (Array.isArray(myPayments) && myPayments.length > 0) {
                    myPayments.forEach((p) => {
                      const isVerified = p.status === 'VERIFIED';
                      const isPending = p.status === 'PENDING';
                      historyList.push({
                        id: `pay-${p.id}`,
                        iconName: isVerified ? 'checkmark-circle' : isPending ? 'time' : 'close-circle',
                        iconColor: isVerified ? '#16A34A' : isPending ? '#D97706' : '#DC2626',
                        iconBgColor: isVerified ? '#DCFCE7' : isPending ? '#FEF3C7' : '#FEE2E2',
                        title: `Room ${roomNumber} • ${p.method || 'Payment'}`,
                        subtitle: `${formatCurrency(p.amount)} • ${formatPaymentDate(p.createdAt)}`,
                        tagLabel: isVerified ? 'Verified' : isPending ? 'Pending' : p.status,
                        tagVariant: isVerified ? 'green' : isPending ? 'amber' : 'red',
                      });
                    });
                  } else if (recentPayment) {
                    const isVerified = recentPayment.status === 'VERIFIED';
                    const isPending = recentPayment.status === 'PENDING';
                    historyList.push({
                      id: `recent-pay-${recentPayment.paymentId || 'latest'}`,
                      iconName: isVerified ? 'checkmark-circle' : isPending ? 'time' : 'alert-circle',
                      iconColor: isVerified ? '#16A34A' : isPending ? '#D97706' : '#DC2626',
                      iconBgColor: isVerified ? '#DCFCE7' : isPending ? '#FEF3C7' : '#FEE2E2',
                      title: `Room ${roomNumber} • ${recentPayment.method || 'Payment'}`,
                      subtitle: `${formatCurrency(recentPayment.amount)} • ${formatPaymentDate(recentPayment.createdAt)}`,
                      tagLabel: isVerified ? 'Verified' : isPending ? 'Pending' : recentPayment.status,
                      tagVariant: isVerified ? 'green' : isPending ? 'amber' : 'red',
                    });
                  }

                  if (historyList.length === 0) {
                    return (
                      <View style={{ paddingVertical: 36, alignItems: 'center' }}>
                        <Ionicons name="receipt-outline" size={38} color="#94A3B8" />
                        <Text style={{ fontSize: 15, fontWeight: '700', color: '#334155', marginTop: 10 }}>
                          No Payment History
                        </Text>
                        <Text style={{ fontSize: 12.5, color: '#64748B', marginTop: 4, textAlign: 'center', lineHeight: 18 }}>
                          Payments submitted for Room {roomNumber} will appear here along with verification receipts.
                        </Text>
                      </View>
                    );
                  }

                  return historyList.map((item, idx) => (
                    <ActionRowCard
                      key={item.id || idx}
                      iconName={item.iconName}
                      iconColor={item.iconColor}
                      iconBgColor={item.iconBgColor}
                      title={item.title}
                      subtitle={item.subtitle}
                      tagLabel={item.tagLabel}
                      tagVariant={item.tagVariant}
                      showChevron={true}
                      chevronColor="#94A3B8"
                      showDivider={idx < historyList.length - 1}
                    />
                  ));
                })()}
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
