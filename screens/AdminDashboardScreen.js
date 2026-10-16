import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  Alert,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  HeroGradientCard,
  StatCard,
  ActionRowCard,
  StatusTag,
} from '../src/components';

export default function AdminDashboardScreen({
  navigation,
  user,
  onLogout,
  onChangePassword,
  onNavigateResident,
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigation?.reset?.({
        index: 0,
        routes: [{ name: user ? 'Dashboard' : 'Welcome' }],
      });
    }
  }, [user, navigation]);

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

  // Initial mock rooms
  const rooms = [
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
  ];

  const onlinePendingCount = payments.filter((p) => p.type === 'online' && p.status === 'pending').length;
  const cashPendingCount = payments.filter((p) => p.type === 'cash' && p.status === 'pending').length;

  const handleLogoutConfirm = () => {
    Alert.alert('Logout', 'Are you sure you want to log out of Admin Dashboard?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: onLogout },
    ]);
  };

  const handleVerifyPayment = (paymentId) => {
    const item = payments.find((p) => p.id === paymentId);
    Alert.alert(
      'Verify Payment',
      `Approve payment of ${item?.amount} from Room ${item?.room} (${item?.resident})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: () => {
            setPayments((prev) =>
              prev.map((p) => (p.id === paymentId ? { ...p, status: 'verified' } : p))
            );
            Alert.alert('Success', `Payment from Room ${item?.room} has been verified.`);
          },
        },
      ]
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF9F6' }}>
      <StatusBar style="dark" />

      {/* Main Content Area */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: Platform.OS === 'android' ? 36 : 14,
          paddingBottom: 28,
        }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'dashboard' && (
          <>
            {/* Top Navigation Row: Residency Admin + Bell + Avatar */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              {/* Left: App Logo Badge + Title */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: '#0F172A',
                    letterSpacing: -0.4,
                  }}
                >
                  Residency Admin
                </Text>
              </View>

              {/* Right: Notification Bell + Circular Profile Avatar */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {/* Notification Bell with Orange Dot */}
                <TouchableOpacity
                  onPress={() => setNotificationsVisible(true)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
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
                  activeOpacity={0.7}
                >
                  <Ionicons name="notifications-outline" size={23} color="#1E293B" />
                  {/* Active orange dot */}
                  <View
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 11,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#F97316',
                      borderWidth: 1.5,
                      borderColor: '#FFFFFF',
                    }}
                  />
                </TouchableOpacity>

                {/* Admin Avatar */}
                <TouchableOpacity
                  onPress={() => setActiveTab('profile')}
                  activeOpacity={0.8}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    overflow: 'hidden',
                    borderWidth: 1.5,
                    borderColor: '#FED7AA',
                    backgroundColor: '#FFF7ED',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image
                    source={require('../assets/admin-avatar.jpg')}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Greeting & Screen Title */}
            <View style={{ marginBottom: 18 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '500',
                  color: '#64748B',
                  marginBottom: 3,
                }}
              >
                Good morning, Admin
              </Text>
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: '800',
                  color: '#0F172A',
                  letterSpacing: -0.6,
                }}
              >
                Dashboard
              </Text>
            </View>

            {/* Reusable Hero Monthly Collection Card */}
            <HeroGradientCard
              variant="collection"
              title="October Collection"
              collected="₹18,000"
              remaining="₹22,000"
              progress={45}
              progressLabel="45% collected"
              onPress={() => {
                setActiveTab('payments');
                setPaymentFilter('all');
              }}
              onPressChevron={() => {
                setActiveTab('payments');
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
                value="₹24,000"
                subtitle="Total unpaid amount across residents"
                onPress={() => {
                  setActiveTab('rooms');
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
                  setActiveTab('payments');
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
                  setActiveTab('payments');
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
                    setActiveTab('payments');
                    setPaymentFilter('online');
                  }}
                  onActionPress={() => {
                    setActiveTab('payments');
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
                    setActiveTab('payments');
                    setPaymentFilter('cash');
                  }}
                  onActionPress={() => {
                    setActiveTab('payments');
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
          </>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <View>
            <View style={{ marginBottom: 18 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#64748B',
                  marginBottom: 3,
                }}
              >
                Management
              </Text>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '800',
                  color: '#0F172A',
                  letterSpacing: -0.5,
                }}
              >
                Payment Reviews
              </Text>
            </View>

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
                { key: 'verified', label: 'Verified' },
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
                  No pending payments in this category.
                </Text>
              </View>
            ) : (
              filteredPayments.map((p) => (
                <View
                  key={p.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    padding: 16,
                    marginBottom: 12,
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
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: p.type === 'online' ? '#FFEDD5' : '#FEF3C7',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 10,
                        }}
                      >
                        <Ionicons
                          name={p.type === 'online' ? 'card' : 'cash'}
                          size={18}
                          color={p.type === 'online' ? '#EA580C' : '#D97706'}
                        />
                      </View>
                      <View>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>
                          Room {p.room} • {p.resident}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#64748B' }}>
                          {p.method} • {p.date}
                        </Text>
                      </View>
                    </View>

                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>
                      {p.amount}
                    </Text>
                  </View>

                  <View
                    style={{
                      backgroundColor: '#F8FAFC',
                      padding: 10,
                      borderRadius: 12,
                      marginBottom: 12,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: '#475569' }}>
                      <Text style={{ fontWeight: '700' }}>Reference: </Text>
                      {p.refId}
                    </Text>
                  </View>

                  {p.status === 'pending' ? (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity
                        onPress={() => handleRejectPayment(p.id)}
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          borderRadius: 12,
                          backgroundColor: '#FEE2E2',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#DC2626' }}>
                          Reject
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleVerifyPayment(p.id)}
                        style={{
                          flex: 2,
                          paddingVertical: 10,
                          borderRadius: 12,
                          backgroundColor: '#F57C00',
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#FFFFFF' }}>
                          Verify & Approve
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <StatusTag label="Verified" variant="green" />
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* ROOMS TAB */}
        {activeTab === 'rooms' && (
          <View>
            <View style={{ marginBottom: 18 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#64748B',
                  marginBottom: 3,
                }}
              >
                Directory
              </Text>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '800',
                  color: '#0F172A',
                  letterSpacing: -0.5,
                }}
              >
                Residency Rooms
              </Text>
            </View>

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
          </View>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <View>
            <View style={{ marginBottom: 18 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: '#64748B',
                  marginBottom: 3,
                }}
              >
                Account
              </Text>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: '800',
                  color: '#0F172A',
                  letterSpacing: -0.5,
                }}
              >
                Admin Profile
              </Text>
            </View>

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
          </View>
        )}
      </ScrollView>

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

      {/* Bottom Navigation Bar */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.03,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        {/* Tab 1: Dashboard */}
        <TouchableOpacity
          onPress={() => setActiveTab('dashboard')}
          activeOpacity={0.7}
          style={{ alignItems: 'center', minWidth: 64 }}
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
              marginTop: 3,
            }}
          >
            Dashboard
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Payments */}
        <TouchableOpacity
          onPress={() => setActiveTab('payments')}
          activeOpacity={0.7}
          style={{ alignItems: 'center', minWidth: 64 }}
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
              marginTop: 3,
            }}
          >
            Payments
          </Text>
        </TouchableOpacity>

        {/* Tab 3: Rooms */}
        <TouchableOpacity
          onPress={() => setActiveTab('rooms')}
          activeOpacity={0.7}
          style={{ alignItems: 'center', minWidth: 64 }}
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
              marginTop: 3,
            }}
          >
            Rooms
          </Text>
        </TouchableOpacity>

        {/* Tab 4: Profile */}
        <TouchableOpacity
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.7}
          style={{ alignItems: 'center', minWidth: 64 }}
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
              marginTop: 3,
            }}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
