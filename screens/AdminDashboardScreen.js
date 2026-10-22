import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Image,
  Modal,
  TextInput,
  Animated,
  Easing,
  useWindowDimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  HeroGradientCard,
  StatCard,
  ActionRowCard,
  StatusTag,
  ScreenHeader,
} from '../src/components';

const TAB_ORDER = ['dashboard', 'payments', 'rooms', 'profile'];

export default function AdminDashboardScreen({
  navigation,
  user,
  onLogout,
  onChangePassword,
  onNavigateResident,
}) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Horizontal pager animation for smooth, 100% flicker-free sliding between tabs
  const pagerAnim = useRef(new Animated.Value(0)).current;

  // Separate scroll view refs for each tab
  const dashboardScrollRef = useRef(null);
  const paymentsScrollRef = useRef(null);
  const roomsScrollRef = useRef(null);
  const profileScrollRef = useRef(null);

  // Scale animations for individual bottom tab buttons
  const tabScaleAnims = useRef({
    dashboard: new Animated.Value(1),
    payments: new Animated.Value(1),
    rooms: new Animated.Value(1),
    profile: new Animated.Value(1),
  }).current;

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigation?.reset?.({
        index: 0,
        routes: [{ name: user ? 'Dashboard' : 'Welcome' }],
      });
    }
  }, [user, navigation]);

  // Keep pager aligned if screen orientation or dimensions change
  useEffect(() => {
    const idx = TAB_ORDER.indexOf(activeTab);
    pagerAnim.setValue(-idx * screenWidth);
  }, [screenWidth, activeTab, pagerAnim]);

  const handleTabPress = useCallback(
    (nextTab) => {
      if (nextTab === activeTab) {
        if (nextTab === 'dashboard') dashboardScrollRef.current?.scrollTo({ y: 0, animated: true });
        else if (nextTab === 'payments') paymentsScrollRef.current?.scrollTo({ y: 0, animated: true });
        else if (nextTab === 'rooms') roomsScrollRef.current?.scrollTo({ y: 0, animated: true });
        else if (nextTab === 'profile') profileScrollRef.current?.scrollTo({ y: 0, animated: true });
        return;
      }

      const nextIndex = TAB_ORDER.indexOf(nextTab);

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

      Animated.timing(pagerAnim, {
        toValue: -nextIndex * screenWidth,
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }).start();
    },
    [activeTab, screenWidth, pagerAnim, tabScaleAnims]
  );

  if (user?.role !== 'ADMIN') {
    return null;
  }

  // Initial mock state for pending payments
  const [payments, setPayments] = useState([
    {
      id: 'p1',
      room: '102',
      resident: 'Ananya Sharma',
      amount: '₹1,500',
      type: 'online',
      method: 'UPI / GPay',
      refId: 'UPI-984728910',
      date: 'Today, 09:15 AM',
      status: 'pending',
    },
    {
      id: 'p2',
      room: '204',
      resident: 'Rajesh Patel',
      amount: '₹1,500',
      type: 'online',
      method: 'PhonePe',
      refId: 'UPI-478129041',
      date: 'Today, 08:30 AM',
      status: 'pending',
    },
    {
      id: 'p3',
      room: '301',
      resident: 'Sunita Rao',
      amount: '₹3,000',
      type: 'cash',
      method: 'Cash Payment',
      refId: 'Handed to Security',
      date: 'Today, 07:45 AM',
      status: 'pending',
    },
    {
      id: 'p4',
      room: '105',
      resident: 'Amit Verma',
      amount: '₹1,500',
      type: 'online',
      method: 'Net Banking',
      refId: 'HDFC-8823190',
      date: 'Yesterday',
      status: 'pending',
    },
    {
      id: 'p5',
      room: '203',
      resident: 'Pooja Hegde',
      amount: '₹1,500',
      type: 'cash',
      method: 'Cash Payment',
      refId: 'Direct to Admin office',
      date: 'Yesterday',
      status: 'pending',
    },
    {
      id: 'p6',
      room: '402',
      resident: 'Vikram Seth',
      amount: '₹1,500',
      type: 'online',
      method: 'Paytm UPI',
      refId: 'UPI-11928301',
      date: 'Yesterday',
      status: 'pending',
    },
    {
      id: 'p7',
      room: '306',
      resident: 'Kavita Nair',
      amount: '₹1,500',
      type: 'online',
      method: 'Google Pay',
      refId: 'UPI-77492019',
      date: '12 Oct, 2026',
      status: 'pending',
    },
    {
      id: 'p8',
      room: '108',
      resident: 'Deepak Joshi',
      amount: '₹1,500',
      type: 'cash',
      method: 'Cash Payment',
      refId: 'Cash collected by guard',
      date: '11 Oct, 2026',
      status: 'pending',
    },
  ]);

  // Mock rooms as dynamic state
  const [rooms, setRooms] = useState([
    { room: '101', resident: 'Aarav Gupta', phone: '+91 98765 43210', status: 'paid', dues: '₹0' },
    { room: '102', resident: 'Ananya Sharma', phone: '+91 98234 56789', status: 'pending', dues: '₹1,500' },
    { room: '103', resident: 'Rohit Kulkarni', phone: '+91 97123 45678', status: 'paid', dues: '₹0' },
    { room: '104', resident: 'Pravin Kumar', phone: '+91 96543 21098', status: 'paid', dues: '₹0' },
    { room: '105', resident: 'Amit Verma', phone: '+91 95432 10987', status: 'overdue', dues: '₹3,000' },
    { room: '201', resident: 'Suresh Menon', phone: '+91 94321 09876', status: 'paid', dues: '₹0' },
    { room: '202', resident: 'Neha Chawla', phone: '+91 93210 98765', status: 'paid', dues: '₹0' },
    { room: '203', resident: 'Pooja Hegde', phone: '+91 92109 87654', status: 'pending', dues: '₹1,500' },
    { room: '204', resident: 'Rajesh Patel', phone: '+91 91098 76543', status: 'pending', dues: '₹1,500' },
    { room: '301', resident: 'Sunita Rao', phone: '+91 90987 65432', status: 'overdue', dues: '₹3,000' },
  ]);

  // Verification & Custom Amount modal state
  const [verifyModalItem, setVerifyModalItem] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');

  const onlinePendingCount = payments.filter((p) => p.type === 'online' && p.status === 'pending').length;
  const cashPendingCount = payments.filter((p) => p.type === 'cash' && p.status === 'pending').length;
  const verifiedCount = payments.filter((p) => p.status === 'verified').length;

  const totalPendingDuesNum = rooms.reduce(
    (acc, r) => acc + parseInt(r.dues.replace(/[^0-9]/g, '') || '0', 10),
    0
  );
  const totalPendingDuesStr = `₹${totalPendingDuesNum.toLocaleString('en-IN')}`;

  const handleLogoutConfirm = () => {
    Alert.alert('Logout', 'Are you sure you want to log out of Admin Dashboard?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: onLogout },
    ]);
  };

  const handleCopyRef = (refId) => {
    Alert.alert('Copied', `Reference ID "${refId}" copied.`);
  };

  const handleOpenVerifyModal = (paymentId) => {
    const item = payments.find((p) => p.id === paymentId);
    if (!item) return;
    const numericStr = item.amount.replace(/[^0-9]/g, '');
    setVerifyModalItem(item);
    setCustomAmount(numericStr);
    setAdminRemarks(item.type === 'cash' ? 'Cash verified and received' : 'UPI transaction verified');
  };

  const handleConfirmVerification = () => {
    if (!verifyModalItem) return;
    const cleanNum = customAmount.replace(/[^0-9]/g, '');
    if (!cleanNum || parseInt(cleanNum, 10) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than ₹0.');
      return;
    }

    const formattedAmount = `₹${parseInt(cleanNum, 10).toLocaleString('en-IN')}`;
    const origAmount = verifyModalItem.amount;
    const isCustom = formattedAmount !== origAmount;

    setPayments((prev) =>
      prev.map((p) =>
        p.id === verifyModalItem.id
          ? {
              ...p,
              status: 'verified',
              verifiedAmount: formattedAmount,
              originalAmount: origAmount,
              adminRemark:
                adminRemarks.trim() ||
                (isCustom
                  ? `Approved custom amount of ${formattedAmount}`
                  : 'Payment verified by Admin'),
              verifiedDate: 'Today, Just now',
            }
          : p
      )
    );

    // Update dues for matching room
    setRooms((prev) =>
      prev.map((r) => {
        if (r.room === verifyModalItem.room) {
          const currentDuesNum = parseInt(r.dues.replace(/[^0-9]/g, '') || '0', 10);
          const approvedNum = parseInt(cleanNum, 10);
          const nextDuesNum = Math.max(0, currentDuesNum - approvedNum);
          return {
            ...r,
            dues: `₹${nextDuesNum.toLocaleString('en-IN')}`,
            status: nextDuesNum === 0 ? 'paid' : 'pending',
          };
        }
        return r;
      })
    );

    const targetRoom = verifyModalItem.room;
    setVerifyModalItem(null);
    setCustomAmount('');
    setAdminRemarks('');

    Alert.alert(
      'Payment Verified',
      `Successfully approved ${formattedAmount} for Room ${targetRoom}.${
        isCustom ? ` (Original declared: ${origAmount})` : ''
      }`
    );
  };

  const handleRejectPayment = (paymentId) => {
    const item = payments.find((p) => p.id === paymentId);
    Alert.alert('Reject Request', `Reject payment request from Room ${item?.room}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          setPayments((prev) => prev.filter((p) => p.id !== paymentId));
          Alert.alert('Declined', `Payment request from Room ${item?.room} was rejected.`);
        },
      },
    ]);
  };

  const filteredPayments = payments.filter((p) => {
    if (paymentFilter === 'online') return p.type === 'online' && p.status === 'pending';
    if (paymentFilter === 'cash') return p.type === 'cash' && p.status === 'pending';
    if (paymentFilter === 'verified') return p.status === 'verified';
    return p.status === 'pending';
  });

  const filteredRooms = rooms.filter(
    (r) =>
      r.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.resident.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9F6' }}>
      <StatusBar style="dark" />

      {/* Persistent Reusable Screen Header: stays mounted, smoothly updates text/data */}
      <ScreenHeader
        user={user}
        activeTab={activeTab}
        brandTitle="Residency Admin"
        unreadCount={onlinePendingCount + cashPendingCount}
        onPressNotifications={() => setNotificationsVisible(true)}
        onPressAvatar={() => handleTabPress('profile')}
        onPressLogo={() => handleTabPress('dashboard')}
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
          {/* TAB 0: DASHBOARD */}
          <View style={{ width: screenWidth, flex: 1 }}>
            <ScrollView
              ref={dashboardScrollRef}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 8,
                paddingBottom: 28,
              }}
              showsVerticalScrollIndicator={false}
            >
              {/* Reusable Hero Monthly Collection Card */}
              <HeroGradientCard
                variant="collection"
                title="October Collection"
                collected="₹18,000"
                remaining="₹22,000"
                progress={45}
                progressLabel="45% collected"
                onPress={() => {
                  handleTabPress('payments');
                  setPaymentFilter('all');
                }}
                onPressChevron={() => {
                  handleTabPress('payments');
                  setPaymentFilter('all');
                }}
              />

              {/* 3 Metric / Stat Cards Row */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: 10,
                  marginBottom: 24,
                }}
              >
                {/* Card 1: Total Pending Dues */}
                <StatCard
                  renderIcon={() => (
                    <MaterialCommunityIcons name="database-outline" size={20} color="#EA580C" />
                  )}
                  iconBgColor="#FFEDD5"
                  title="Total Pending Dues"
                  value={totalPendingDuesStr}
                  subtitle="Total unpaid amount across residents"
                  onPress={() => {
                    handleTabPress('rooms');
                  }}
                />

                {/* Card 2: Online Reviews */}
                <StatCard
                  iconName="card"
                  iconFamily="Ionicons"
                  iconColor="#D97706"
                  iconBgColor="#FEF3C7"
                  title="Online Reviews"
                  value={onlinePendingCount.toString()}
                  subtitle="Payments awaiting verification"
                  onPress={() => {
                    handleTabPress('payments');
                    setPaymentFilter('online');
                  }}
                />

                {/* Card 3: Cash Reviews */}
                <StatCard
                  iconName="cash"
                  iconFamily="Ionicons"
                  iconColor="#EA580C"
                  iconBgColor="#FFEDD5"
                  title="Cash Reviews"
                  value={cashPendingCount.toString()}
                  subtitle="Cash requests awaiting verification"
                  onPress={() => {
                    handleTabPress('payments');
                    setPaymentFilter('cash');
                  }}
                />
              </View>

              {/* Pending Verification Section */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: '#0F172A',
                    letterSpacing: -0.3,
                    marginBottom: 12,
                  }}
                >
                  Pending Verification
                </Text>

                {/* Unified White Card Container with 2 Action Rows */}
                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    paddingHorizontal: 16,
                    paddingVertical: 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.03,
                    shadowRadius: 6,
                    elevation: 1.5,
                    borderWidth: 1,
                    borderColor: '#F1F5F9',
                  }}
                >
                  {/* Row 1: Online Payments */}
                  <ActionRowCard
                    iconName="card"
                    iconFamily="Ionicons"
                    iconColor="#EA580C"
                    iconBgColor="#FFEDD5"
                    title="Online Payments"
                    subtitle="Submitted by residents"
                    tagLabel={`${onlinePendingCount} pending`}
                    tagVariant="orange"
                    showAction={true}
                    actionText="Review"
                    showDivider={true}
                    onPress={() => {
                      handleTabPress('payments');
                      setPaymentFilter('online');
                    }}
                    onActionPress={() => {
                      handleTabPress('payments');
                      setPaymentFilter('online');
                    }}
                  />

                  {/* Row 2: Cash Requests */}
                  <ActionRowCard
                    iconName="cash"
                    iconFamily="Ionicons"
                    iconColor="#D97706"
                    iconBgColor="#FEF3C7"
                    title="Cash Requests"
                    subtitle="Declared by residents"
                    tagLabel={`${cashPendingCount} pending`}
                    tagVariant="amber"
                    showAction={true}
                    actionText="Review"
                    showDivider={false}
                    onPress={() => {
                      handleTabPress('payments');
                      setPaymentFilter('cash');
                    }}
                    onActionPress={() => {
                      handleTabPress('payments');
                      setPaymentFilter('cash');
                    }}
                  />
                </View>
              </View>

              {/* Recent Activity Section */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: '#0F172A',
                    letterSpacing: -0.3,
                    marginBottom: 12,
                  }}
                >
                  Recent Activity
                </Text>

                {/* Verified Activity Card */}
                <ActionRowCard
                  asCard={true}
                  iconName="checkmark-circle"
                  iconFamily="Ionicons"
                  iconColor="#16A34A"
                  iconBgColor="#DCFCE7"
                  title="Room 104 • Payment verified"
                  subtitle="₹1,500"
                  showChevron={true}
                  chevronColor="#94A3B8"
                  onPress={() => {
                    setSelectedActivity({
                      room: '104',
                      resident: 'Pravin Kumar',
                      amount: '₹1,500',
                      date: 'Today, 08:15 AM',
                      status: 'Verified by Admin',
                      mode: 'UPI (GPay)',
                    });
                  }}
                />
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
              {/* Filter Pills */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, marginBottom: 18 }}
              >
                {[
                  { key: 'all', label: `Pending (${payments.filter((p) => p.status === 'pending').length})` },
                  { key: 'online', label: `Online (${onlinePendingCount})` },
                  { key: 'cash', label: `Cash (${cashPendingCount})` },
                  { key: 'verified', label: `Verified (${verifiedCount})` },
                ].map((filter) => {
                  const isActive = paymentFilter === filter.key;
                  return (
                    <TouchableOpacity
                      key={filter.key}
                      onPress={() => setPaymentFilter(filter.key)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 9,
                        borderRadius: 20,
                        backgroundColor: isActive ? '#F57C00' : '#FFFFFF',
                        borderWidth: 1,
                        borderColor: isActive ? '#F57C00' : '#E2E8F0',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '700',
                          color: isActive ? '#FFFFFF' : '#475569',
                        }}
                      >
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Payment Items List */}
              {filteredPayments.length === 0 ? (
                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    padding: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#F1F5F9',
                  }}
                >
                  <Ionicons name="checkmark-done-circle-outline" size={54} color="#10B981" />
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: '700',
                      color: '#1E293B',
                      marginTop: 12,
                      marginBottom: 4,
                    }}
                  >
                    All caught up!
                  </Text>
                  <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center' }}>
                    No payments in this category.
                  </Text>
                </View>
              ) : (
                filteredPayments.map((p) => {
                  const isOnline = p.type === 'online';
                  const isPending = p.status === 'pending';

                  return (
                    <View
                      key={p.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 22,
                        padding: 16,
                        marginBottom: 14,
                        borderWidth: 1,
                        borderColor: isOnline ? '#E0E7FF' : '#FEF3C7',
                        borderLeftWidth: 5,
                        borderLeftColor: isOnline ? '#3B82F6' : '#F59E0B',
                        shadowColor: '#0F172A',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.04,
                        shadowRadius: 8,
                        elevation: 2,
                      }}
                    >
                      {/* Top Header Row: Room & Type Badges (Left) + Amount Stack (Right) */}
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 12,
                        }}
                      >
                        {/* Left: Badges */}
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            flex: 1,
                            marginRight: 12,
                            flexWrap: 'wrap',
                          }}
                        >
                          {/* Room Badge */}
                          <View
                            style={{
                              backgroundColor: '#FFF7ED',
                              paddingHorizontal: 9,
                              paddingVertical: 4,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: '#FED7AA',
                            }}
                          >
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#EA580C' }}>
                              Room {p.room}
                            </Text>
                          </View>

                          {/* Type Badge */}
                          {isOnline ? (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#EFF6FF',
                                paddingHorizontal: 9,
                                paddingVertical: 4,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: '#DBEAFE',
                                gap: 4,
                              }}
                            >
                              <Ionicons name="card" size={12} color="#2563EB" />
                              <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#1D4ED8' }}>
                                Online UPI
                              </Text>
                            </View>
                          ) : (
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#FEF3C7',
                                paddingHorizontal: 9,
                                paddingVertical: 4,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: '#FDE68A',
                                gap: 4,
                              }}
                            >
                              <Ionicons name="cash" size={12} color="#D97706" />
                              <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#B45309' }}>
                                Cash Handover
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Right: Amount Display (No collision) */}
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text
                            style={{
                              fontSize: 10,
                              fontWeight: '700',
                              color: '#94A3B8',
                              letterSpacing: 0.5,
                              textTransform: 'uppercase',
                              marginBottom: 1,
                            }}
                          >
                            {!isPending ? 'APPROVED' : isOnline ? 'REQUESTED' : 'DECLARED'}
                          </Text>
                          <Text
                            style={{
                              fontSize: 20,
                              fontWeight: '900',
                              color: !isPending ? '#16A34A' : '#0F172A',
                              letterSpacing: -0.4,
                            }}
                          >
                            {p.verifiedAmount || p.amount}
                          </Text>
                        </View>
                      </View>

                      {/* Resident Info Row */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 12,
                        }}
                      >
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: isOnline ? '#EFF6FF' : '#FEF3C7',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 10,
                            borderWidth: 1,
                            borderColor: isOnline ? '#DBEAFE' : '#FDE68A',
                          }}
                        >
                          <Ionicons
                            name={isOnline ? 'phone-portrait-outline' : 'wallet-outline'}
                            size={18}
                            color={isOnline ? '#2563EB' : '#D97706'}
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 15.5,
                              fontWeight: '700',
                              color: '#0F172A',
                            }}
                            numberOfLines={1}
                          >
                            {p.resident}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 5 }}>
                            <Text style={{ fontSize: 12, color: '#64748B' }}>
                              {p.method}
                            </Text>
                            <Text style={{ fontSize: 11, color: '#CBD5E1' }}>•</Text>
                            <Ionicons name="time-outline" size={12} color="#94A3B8" />
                            <Text style={{ fontSize: 12, color: '#64748B' }}>
                              {p.date}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Detail / Reference Box (Differentiated for Online vs Cash) */}
                      {isOnline ? (
                        <View
                          style={{
                            backgroundColor: '#F8FAFC',
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            marginBottom: 14,
                            borderWidth: 1,
                            borderColor: '#E2E8F0',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                            <Ionicons name="receipt-outline" size={15} color="#64748B" style={{ marginRight: 6 }} />
                            <Text style={{ fontSize: 12, color: '#64748B' }} numberOfLines={1}>
                              Ref / UTR: <Text style={{ fontWeight: '700', color: '#1E293B' }}>{p.refId}</Text>
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleCopyRef(p.refId)}
                            activeOpacity={0.7}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingHorizontal: 7,
                              paddingVertical: 3.5,
                              borderRadius: 6,
                              backgroundColor: '#FFFFFF',
                              borderWidth: 1,
                              borderColor: '#CBD5E1',
                              gap: 3,
                            }}
                          >
                            <Ionicons name="copy-outline" size={11} color="#475569" />
                            <Text style={{ fontSize: 10.5, fontWeight: '600', color: '#475569' }}>Copy</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View
                          style={{
                            backgroundColor: '#FFFBEB',
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            marginBottom: 14,
                            borderWidth: 1,
                            borderColor: '#FEF3C7',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                            <Ionicons name="location-outline" size={15} color="#D97706" style={{ marginRight: 6 }} />
                            <Text style={{ fontSize: 12, color: '#92400E' }} numberOfLines={1}>
                              Handover: <Text style={{ fontWeight: '700', color: '#78350F' }}>{p.refId}</Text>
                            </Text>
                          </View>
                          <View
                            style={{
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                              borderRadius: 6,
                              backgroundColor: '#FEF3C7',
                            }}
                          >
                            <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#B45309' }}>
                              Security Desk
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Card Bottom: Pending Actions or Verified Banner */}
                      {isPending ? (
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          <TouchableOpacity
                            onPress={() => handleRejectPayment(p.id)}
                            activeOpacity={0.7}
                            style={{
                              flex: 1,
                              paddingVertical: 11,
                              borderRadius: 12,
                              backgroundColor: '#FEF2F2',
                              borderWidth: 1,
                              borderColor: '#FEE2E2',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                            }}
                          >
                            <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                            <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#DC2626' }}>
                              Reject
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleOpenVerifyModal(p.id)}
                            activeOpacity={0.8}
                            style={{
                              flex: 2,
                              paddingVertical: 11,
                              borderRadius: 12,
                              backgroundColor: '#F57C00',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              shadowColor: '#F57C00',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.25,
                              shadowRadius: 4,
                              elevation: 2,
                            }}
                          >
                            <Ionicons name="checkmark-circle" size={17} color="#FFFFFF" />
                            <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#FFFFFF' }}>
                              Verify & Approve
                            </Text>
                            <Ionicons name="create-outline" size={14} color="#FFEDD5" style={{ marginLeft: 2 }} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View
                          style={{
                            backgroundColor: '#F0FDF4',
                            borderRadius: 12,
                            padding: 12,
                            borderWidth: 1,
                            borderColor: '#DCFCE7',
                          }}
                        >
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                              <Text style={{ fontSize: 13, fontWeight: '700', color: '#15803D' }}>
                                Verified & Approved
                              </Text>
                            </View>
                            <Text style={{ fontSize: 14, fontWeight: '800', color: '#16A34A' }}>
                              {p.verifiedAmount || p.amount}
                            </Text>
                          </View>
                          {p.originalAmount && p.originalAmount !== (p.verifiedAmount || p.amount) ? (
                            <Text style={{ fontSize: 11.5, color: '#15803D', marginTop: 3 }}>
                              Declared: {p.originalAmount} • Approved: {p.verifiedAmount || p.amount}
                            </Text>
                          ) : null}
                          {p.adminRemark ? (
                            <Text style={{ fontSize: 11.5, color: '#166534', marginTop: 2 }}>
                              Note: {p.adminRemark}
                            </Text>
                          ) : null}
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>

          {/* TAB 2: ROOMS */}
          <View style={{ width: screenWidth, flex: 1 }}>
            <ScrollView
              ref={roomsScrollRef}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 8,
                paddingBottom: 28,
              }}
              showsVerticalScrollIndicator={false}
            >
              {/* Search Bar */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 16,
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                }}
              >
                <Ionicons name="search" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Search room number or resident name..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{ flex: 1, fontSize: 14, color: '#0F172A' }}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Rooms List */}
              {filteredRooms.map((r) => (
                <View
                  key={r.room}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 18,
                    padding: 16,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: '#F1F5F9',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        backgroundColor: '#FFF7ED',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                        borderWidth: 1,
                        borderColor: '#FED7AA',
                      }}
                    >
                      <Text style={{ fontSize: 15, fontWeight: '800', color: '#F57C00' }}>
                        {r.room}
                      </Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A' }}>
                        {r.resident}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#64748B' }}>{r.phone}</Text>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <StatusTag
                      label={r.status === 'paid' ? 'Paid' : r.status === 'pending' ? 'Pending' : 'Overdue'}
                      variant={r.status === 'paid' ? 'green' : r.status === 'pending' ? 'orange' : 'red'}
                    />
                    {r.dues !== '₹0' && (
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626', marginTop: 4 }}>
                        Dues: {r.dues}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
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
              {/* Profile Card */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 22,
                  padding: 20,
                  alignItems: 'center',
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: '#F1F5F9',
                }}
              >
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    overflow: 'hidden',
                    borderWidth: 2,
                    borderColor: '#F57C00',
                    marginBottom: 12,
                  }}
                >
                  <Image
                    source={require('../assets/admin-avatar.jpg')}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A' }}>
                  Residency Administrator
                </Text>
                <Text style={{ fontSize: 13.5, color: '#64748B', marginTop: 2, marginBottom: 10 }}>
                  {user?.mobileNumber ? `+91 ${user.mobileNumber}` : 'admin@radhika-residency.com'}
                </Text>
                <StatusTag label="Super Admin" variant="orange" />
              </View>

              {/* Action Items */}
              <View
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: '#F1F5F9',
                }}
              >
                <TouchableOpacity
                  onPress={onChangePassword}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F1F5F9',
                  }}
                >
                  <Ionicons name="key-outline" size={20} color="#F57C00" style={{ marginRight: 12 }} />
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: '#1E293B' }}>
                    Change Password
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setNotificationsVisible(true)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F1F5F9',
                  }}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color="#F57C00"
                    style={{ marginRight: 12 }}
                  />
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: '#1E293B' }}>
                    Notifications & Alerts
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </TouchableOpacity>

                {onNavigateResident ? (
                  <TouchableOpacity
                    onPress={onNavigateResident}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: '#F1F5F9',
                    }}
                  >
                    <Ionicons
                      name="home-outline"
                      size={20}
                      color="#F57C00"
                      style={{ marginRight: 12 }}
                    />
                    <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: '#1E293B' }}>
                      Switch to Resident Dashboard
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  onPress={handleLogoutConfirm}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                  }}
                >
                  <Ionicons name="log-out-outline" size={20} color="#DC2626" style={{ marginRight: 12 }} />
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: '#DC2626' }}>
                    Log Out
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </View>

      {/* Notifications Modal */}
      <Modal
        visible={notificationsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              maxHeight: '75%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 18,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A' }}>
                Admin Notifications
              </Text>
              <TouchableOpacity onPress={() => setNotificationsVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ gap: 12, marginBottom: 20 }}>
                <View
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: '#FFF7ED',
                    borderLeftWidth: 4,
                    borderLeftColor: '#F57C00',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#9A3412' }}>
                    {onlinePendingCount} Online Payments Pending Review
                  </Text>
                  <Text style={{ fontSize: 12.5, color: '#C2410C', marginTop: 2 }}>
                    Residents submitted UPI receipts for October maintenance.
                  </Text>
                </View>

                <View
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: '#FEF3C7',
                    borderLeftWidth: 4,
                    borderLeftColor: '#D97706',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#92400E' }}>
                    {cashPendingCount} Cash Payment Requests
                  </Text>
                  <Text style={{ fontSize: 12.5, color: '#B45309', marginTop: 2 }}>
                    Cash handed over at security booth awaiting verification.
                  </Text>
                </View>

                <View
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: '#DCFCE7',
                    borderLeftWidth: 4,
                    borderLeftColor: '#16A34A',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#166534' }}>
                    October Collection Milestone
                  </Text>
                  <Text style={{ fontSize: 12.5, color: '#15803D', marginTop: 2 }}>
                    45% target reached (₹18,000 collected so far).
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Activity Detail Modal */}
      <Modal
        visible={Boolean(selectedActivity)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedActivity(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: 24,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: '#DCFCE7',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                <Ionicons name="checkmark-circle" size={34} color="#16A34A" />
              </View>
              <Text style={{ fontSize: 19, fontWeight: '800', color: '#0F172A' }}>
                Payment Verified
              </Text>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#16A34A', marginTop: 4 }}>
                {selectedActivity?.amount}
              </Text>
            </View>

            <View style={{ backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, gap: 10, marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#64748B' }}>Room</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                  {selectedActivity?.room}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#64748B' }}>Resident</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                  {selectedActivity?.resident}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#64748B' }}>Method</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                  {selectedActivity?.mode}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#64748B' }}>Date & Time</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                  {selectedActivity?.date}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setSelectedActivity(null)}
              style={{
                backgroundColor: '#F57C00',
                borderRadius: 14,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Verify & Custom Amount Modal */}
      <Modal
        visible={Boolean(verifyModalItem)}
        transparent
        animationType="slide"
        onRequestClose={() => setVerifyModalItem(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{
            flex: 1,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              maxHeight: '90%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: verifyModalItem?.type === 'online' ? '#EFF6FF' : '#FEF3C7',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name={verifyModalItem?.type === 'online' ? 'card' : 'cash'}
                    size={22}
                    color={verifyModalItem?.type === 'online' ? '#2563EB' : '#D97706'}
                  />
                </View>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>
                    Verify Payment
                  </Text>
                  <Text style={{ fontSize: 12.5, color: '#64748B' }}>
                    Room {verifyModalItem?.room} • {verifyModalItem?.resident}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setVerifyModalItem(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: '#F1F5F9',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Payment Details Summary Card */}
              <View
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 18,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  gap: 8,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12.5, color: '#64748B' }}>Payment Mode</Text>
                  <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#0F172A' }}>
                    {verifyModalItem?.method}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12.5, color: '#64748B' }}>
                    {verifyModalItem?.type === 'online' ? 'Ref / UTR' : 'Handover Note'}
                  </Text>
                  <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#0F172A' }}>
                    {verifyModalItem?.refId}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12.5, color: '#64748B' }}>Declared / Requested</Text>
                  <Text style={{ fontSize: 13.5, fontWeight: '800', color: '#EA580C' }}>
                    {verifyModalItem?.amount}
                  </Text>
                </View>
              </View>

              {/* Custom Approved Amount Input */}
              <View style={{ marginBottom: 18 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#1E293B' }}>
                    Approved Amount (₹)
                  </Text>
                  <View style={{ backgroundColor: '#FFF7ED', paddingHorizontal: 8, paddingVertical: 2.5, borderRadius: 6 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#F57C00' }}>
                      Customizable
                    </Text>
                  </View>
                </View>

                {/* Big Input Box */}
                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: '#F57C00',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#F57C00',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 6,
                    elevation: 1,
                  }}
                >
                  <Text style={{ fontSize: 26, fontWeight: '800', color: '#F57C00', marginRight: 8 }}>
                    ₹
                  </Text>
                  <TextInput
                    value={customAmount}
                    onChangeText={setCustomAmount}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#94A3B8"
                    style={{
                      flex: 1,
                      fontSize: 26,
                      fontWeight: '800',
                      color: '#0F172A',
                      padding: 0,
                    }}
                  />
                  {customAmount.length > 0 && (
                    <TouchableOpacity onPress={() => setCustomAmount('')}>
                      <Ionicons name="close-circle" size={20} color="#94A3B8" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Quick Presets */}
                {(() => {
                  const origNum = parseInt(verifyModalItem?.amount?.replace(/[^0-9]/g, '') || '1500', 10);
                  const halfNum = Math.floor(origNum / 2);
                  const presets = [
                    { label: `Full (₹${origNum.toLocaleString('en-IN')})`, val: String(origNum) },
                    ...(halfNum > 0 && halfNum !== origNum ? [{ label: `Half (₹${halfNum.toLocaleString('en-IN')})`, val: String(halfNum) }] : []),
                    { label: '₹500', val: '500' },
                    { label: '₹1,000', val: '1000' },
                  ];

                  return (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                      {presets.map((pr) => {
                        const isSelected = customAmount === pr.val;
                        return (
                          <TouchableOpacity
                            key={pr.val}
                            onPress={() => setCustomAmount(pr.val)}
                            style={{
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: 14,
                              backgroundColor: isSelected ? '#F57C00' : '#F1F5F9',
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: '700',
                                color: isSelected ? '#FFFFFF' : '#475569',
                              }}
                            >
                              {pr.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  );
                })()}

                {/* Helper notice */}
                {(() => {
                  const origNum = parseInt(verifyModalItem?.amount?.replace(/[^0-9]/g, '') || '0', 10);
                  const curNum = parseInt(customAmount.replace(/[^0-9]/g, '') || '0', 10);

                  if (curNum > 0 && curNum < origNum) {
                    return (
                      <View
                        style={{
                          backgroundColor: '#FFFBEB',
                          borderRadius: 10,
                          padding: 10,
                          marginTop: 10,
                          borderWidth: 1,
                          borderColor: '#FEF3C7',
                        }}
                      >
                        <Text style={{ fontSize: 12, color: '#B45309', fontWeight: '600' }}>
                          ⚠️ Partial verification: ₹{(origNum - curNum).toLocaleString('en-IN')} will remain as pending dues for Room {verifyModalItem?.room}.
                        </Text>
                      </View>
                    );
                  }
                  if (curNum > 0 && curNum > origNum) {
                    return (
                      <View
                        style={{
                          backgroundColor: '#EFF6FF',
                          borderRadius: 10,
                          padding: 10,
                          marginTop: 10,
                          borderWidth: 1,
                          borderColor: '#DBEAFE',
                        }}
                      >
                        <Text style={{ fontSize: 12, color: '#1D4ED8', fontWeight: '600' }}>
                          ✓ Extra amount of ₹{(curNum - origNum).toLocaleString('en-IN')} will be recorded as advance maintenance credit.
                        </Text>
                      </View>
                    );
                  }
                  if (curNum === origNum && origNum > 0) {
                    return (
                      <View
                        style={{
                          backgroundColor: '#F0FDF4',
                          borderRadius: 10,
                          padding: 10,
                          marginTop: 10,
                          borderWidth: 1,
                          borderColor: '#DCFCE7',
                        }}
                      >
                        <Text style={{ fontSize: 12, color: '#15803D', fontWeight: '600' }}>
                          ✓ Exact full amount will be approved and credited to maintenance balance.
                        </Text>
                      </View>
                    );
                  }
                  return null;
                })()}
              </View>

              {/* Admin Remarks */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#1E293B', marginBottom: 8 }}>
                  Verification Note / Remarks
                </Text>
                <TextInput
                  placeholder="e.g., Verified in bank statement / Cash received at security"
                  placeholderTextColor="#94A3B8"
                  value={adminRemarks}
                  onChangeText={setAdminRemarks}
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingVertical: 11,
                    fontSize: 13.5,
                    color: '#0F172A',
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                  }}
                />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {['Full payment verified', 'Partial cash received', 'Verified in bank statement'].map((rem) => (
                    <TouchableOpacity
                      key={rem}
                      onPress={() => setAdminRemarks(rem)}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 12,
                        backgroundColor: '#F8FAFC',
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                      }}
                    >
                      <Text style={{ fontSize: 11, color: '#64748B' }}>{rem}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Modal Buttons */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <TouchableOpacity
                  onPress={() => setVerifyModalItem(null)}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 16,
                    backgroundColor: '#F1F5F9',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#64748B' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirmVerification}
                  style={{
                    flex: 2,
                    paddingVertical: 14,
                    borderRadius: 16,
                    backgroundColor: '#F57C00',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#F57C00',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 3,
                  }}
                >
                  <Text style={{ fontSize: 14.5, fontWeight: '800', color: '#FFFFFF' }}>
                    Approve ₹{customAmount || '0'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
        {/* Tab 1: Dashboard */}
        <TouchableOpacity
          onPress={() => handleTabPress('dashboard')}
          activeOpacity={0.7}
          style={{ alignItems: 'center', minWidth: 68 }}
        >
          <Animated.View
            style={{
              alignItems: 'center',
              transform: [{ scale: tabScaleAnims.dashboard }],
              paddingVertical: 4,
              paddingHorizontal: 12,
              borderRadius: 16,
              backgroundColor: activeTab === 'dashboard' ? '#FFF7ED' : 'transparent',
            }}
          >
            <Ionicons
              name={activeTab === 'dashboard' ? 'home' : 'home-outline'}
              size={22}
              color={activeTab === 'dashboard' ? '#F57C00' : '#94A3B8'}
            />
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: activeTab === 'dashboard' ? '700' : '500',
                color: activeTab === 'dashboard' ? '#F57C00' : '#94A3B8',
                marginTop: 2,
              }}
            >
              Dashboard
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
              name={activeTab === 'payments' ? 'receipt' : 'receipt-outline'}
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

        {/* Tab 3: Rooms */}
        <TouchableOpacity
          onPress={() => handleTabPress('rooms')}
          activeOpacity={0.7}
          style={{ alignItems: 'center', minWidth: 68 }}
        >
          <Animated.View
            style={{
              alignItems: 'center',
              transform: [{ scale: tabScaleAnims.rooms }],
              paddingVertical: 4,
              paddingHorizontal: 12,
              borderRadius: 16,
              backgroundColor: activeTab === 'rooms' ? '#FFF7ED' : 'transparent',
            }}
          >
            <MaterialCommunityIcons
              name={activeTab === 'rooms' ? 'door-open' : 'door-closed'}
              size={22}
              color={activeTab === 'rooms' ? '#F57C00' : '#94A3B8'}
            />
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: activeTab === 'rooms' ? '700' : '500',
                color: activeTab === 'rooms' ? '#F57C00' : '#94A3B8',
                marginTop: 2,
              }}
            >
              Rooms
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
