import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import {
  HeroGradientCard,
  DualStatCard,
  QuickActionTile,
  ActionRowCard,
  NoticeBanner,
  PrimaryButton,
  StatusTag,
  ScreenHeader,
  NotificationsModal,
} from '../src/components';

export default function PaymentScreen({
  user,
  onNavigateHome,
  onNavigateHistory,
  onNavigateProfile,
  onNavigateOnlinePayment,
  onLogout,
  isTab = false,
  showHeader = !isTab,
  onOpenNotifications,
}) {
  const userName = user?.fullName || 'Pravin Kumar';
  const roomNumber = user?.roomNumber || '104';

  // Modals state
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [payTab, setPayTab] = useState('online'); // 'online' | 'cash'
  const [upiRefNumber, setUpiRefNumber] = useState('');
  const [cashNotes, setCashNotes] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  // Recent payments state
  const [recentPayments, setRecentPayments] = useState([
    {
      id: 'rec-1',
      room: roomNumber,
      month: 'September 2026',
      amount: '₹500',
      status: 'verified',
      method: 'UPI (Google Pay)',
      refId: 'UPI-9928104820',
      date: '04 Sep, 2026',
      verifiedBy: 'Society Admin',
    },
    {
      id: 'rec-2',
      room: roomNumber,
      month: 'October 2026',
      amount: '₹500',
      status: 'pending',
      method: 'UPI (PhonePe)',
      refId: 'UPI-1192830192',
      date: 'Today, 08:30 AM',
      verifiedBy: 'Pending Admin Review',
    },
  ]);

  const handleCopyUPI = () => {
    Alert.alert('UPI ID Copied', 'radhika.residency@icici has been copied to your clipboard.');
  };

  const handleOnlineSubmit = () => {
    const trimmed = upiRefNumber.trim();
    if (!trimmed) {
      Alert.alert('Missing Details', 'Please enter your UPI Transaction Reference or UTR Number.');
      return;
    }

    const newPayment = {
      id: `rec-${Date.now()}`,
      room: roomNumber,
      month: 'October 2026',
      amount: '₹500',
      status: 'pending',
      method: 'Online UPI',
      refId: trimmed,
      date: 'Just now',
      verifiedBy: 'Pending Admin Review',
    };

    setRecentPayments((prev) => [newPayment, ...prev]);
    setPayModalVisible(false);
    setUpiRefNumber('');
    Alert.alert('Payment Submitted', 'Your payment reference has been submitted. The admin will verify and update your status.');
  };

  const handleCashSubmit = () => {
    const trimmed = cashNotes.trim();
    if (!trimmed) {
      Alert.alert('Missing Details', 'Please enter whom the cash was handed over to (e.g. Guard Ramesh or Admin Office).');
      return;
    }

    const newPayment = {
      id: `rec-${Date.now()}`,
      room: roomNumber,
      month: 'October 2026',
      amount: '₹500',
      status: 'pending',
      method: 'Cash Declaration',
      refId: trimmed,
      date: 'Just now',
      verifiedBy: 'Pending Cash Verification',
    };

    setRecentPayments((prev) => [newPayment, ...prev]);
    setPayModalVisible(false);
    setCashNotes('');
    Alert.alert('Cash Request Submitted', 'Your cash payment declaration was recorded and is awaiting admin verification.');
  };

  const content = (
    <>
      {/* Reusable Header (only shown when standalone, not when inside Dashboard tab) */}
      {showHeader && (
        <ScreenHeader
          user={user}
          activeTab="payments"
          showBack={!isTab}
          onBack={onNavigateHome}
          onPressNotifications={onOpenNotifications || (() => setNotificationsVisible(true))}
          onPressAvatar={onNavigateProfile}
          onPressLogo={onNavigateHome}
        />
      )}

      {/* Hero Current Maintenance Due Card */}
      <HeroGradientCard
        variant="due"
        title="Current Maintenance Due"
        amount="₹500"
        dueText="Due for October 2026"
        buttonText="Pay Now"
        onPayPress={() => {
          if (onNavigateOnlinePayment) {
            onNavigateOnlinePayment();
          } else {
            setPayTab('online');
            setPayModalVisible(true);
          }
        }}
      />

      {/* Dual Stats Summary Card: Last Payment & Outstanding Balance */}
      <DualStatCard
        leftLabel="Last Payment"
        leftValue="₹500"
        leftSubtext="September 2026 • Verified"
        leftVerified={true}
        onLeftPress={() => {
          setSelectedPayment(recentPayments[0]);
        }}
        rightLabel="Outstanding Balance"
        rightValue="₹1,500"
        rightSubtext="Includes pending months"
        onRightPress={() => {
          setHistoryModalVisible(true);
        }}
      />

      {/* Quick Actions Header */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: '800',
          color: '#0F172A',
          letterSpacing: -0.3,
          marginBottom: 14,
        }}
      >
        Quick Actions
      </Text>

      {/* 3 Quick Action Tiles in a Row */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <QuickActionTile
          title={'Online\nPayment'}
          iconName="qr-code-outline"
          iconColor="#D97706"
          iconBgColor="#FEF3C7"
          arrowColor="#D97706"
          onPress={() => {
            if (onNavigateOnlinePayment) {
              onNavigateOnlinePayment();
            } else {
              setPayTab('online');
              setPayModalVisible(true);
            }
          }}
        />

        <QuickActionTile
          title={'Cash\nPayment'}
          iconName="cash-outline"
          iconColor="#EA580C"
          iconBgColor="#FFF3E8"
          arrowColor="#EA580C"
          onPress={() => {
            setPayTab('cash');
            setPayModalVisible(true);
          }}
        />

        <QuickActionTile
          title={'Payment\nHistory'}
          iconName="time-outline"
          iconColor="#0284C7"
          iconBgColor="#E0F2FE"
          arrowColor="#0284C7"
          onPress={() => {
            if (onNavigateHistory) {
              onNavigateHistory();
            } else {
              setHistoryModalVisible(true);
            }
          }}
        />
      </View>

      {/* Recent Payments Section */}
      <View style={{ marginBottom: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '800',
              color: '#0F172A',
              letterSpacing: -0.3,
            }}
          >
            Recent Payments
          </Text>

          <TouchableOpacity
            onPress={() => setHistoryModalVisible(true)}
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Text
              style={{
                fontSize: 13.5,
                fontWeight: '700',
                color: '#F57C00',
                marginRight: 2,
              }}
            >
              View All
            </Text>
            <Ionicons name="chevron-forward" size={15} color="#F57C00" />
          </TouchableOpacity>
        </View>

        {/* White Card Container for Recent Payments */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 2,
            borderWidth: 1,
            borderColor: '#F1F5F9',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.03,
            shadowRadius: 6,
            elevation: 1.5,
          }}
        >
          {recentPayments.map((item, index) => {
            const isVerified = item.status === 'verified';
            return (
              <ActionRowCard
                key={item.id}
                iconName={isVerified ? 'checkmark-circle' : 'time'}
                iconColor={isVerified ? '#16A34A' : '#D97706'}
                iconBgColor={isVerified ? '#DCFCE7' : '#FEF3C7'}
                title={`Room ${item.room} • ${item.month}`}
                subtitle={`${item.amount} • ${isVerified ? 'Verified' : 'Pending verification'}`}
                tagLabel={isVerified ? 'Verified' : 'Pending'}
                tagVariant={isVerified ? 'green' : 'amber'}
                showChevron={true}
                chevronColor="#94A3B8"
                showDivider={index < recentPayments.length - 1}
                onPress={() => setSelectedPayment(item)}
              />
            );
          })}
        </View>
      </View>

      {/* Info Notice Banner */}
      <NoticeBanner text="Your payment will be verified by the admin. You will be notified once it is approved." />
    </>
  );

  return (
    <>
      {isTab ? (
        content
      ) : (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF9F6' }}>
          <StatusBar style="dark" />
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: Platform.OS === 'android' ? 36 : 14,
              paddingBottom: 28,
            }}
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>

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
            {/* Tab 1: Home */}
            <TouchableOpacity
              onPress={onNavigateHome}
              activeOpacity={0.7}
              style={{ alignItems: 'center', minWidth: 64 }}
            >
              <Ionicons name="home-outline" size={22} color="#94A3B8" />
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: '500',
                  color: '#94A3B8',
                  marginTop: 3,
                }}
              >
                Home
              </Text>
            </TouchableOpacity>

            {/* Tab 2: Payments */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={{ alignItems: 'center', minWidth: 64 }}
            >
              <Ionicons name="card" size={22} color="#F57C00" />
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: '700',
                  color: '#F57C00',
                  marginTop: 3,
                }}
              >
                Payments
              </Text>
            </TouchableOpacity>

            {/* Tab 3: History */}
            <TouchableOpacity
              onPress={onNavigateHistory || (() => setHistoryModalVisible(true))}
              activeOpacity={0.7}
              style={{ alignItems: 'center', minWidth: 64 }}
            >
              <Ionicons name="time-outline" size={22} color="#94A3B8" />
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: '500',
                  color: '#94A3B8',
                  marginTop: 3,
                }}
              >
                History
              </Text>
            </TouchableOpacity>

            {/* Tab 4: Profile */}
            <TouchableOpacity
              onPress={onNavigateProfile}
              activeOpacity={0.7}
              style={{ alignItems: 'center', minWidth: 64 }}
            >
              <Ionicons name="person-outline" size={22} color="#94A3B8" />
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: '500',
                  color: '#94A3B8',
                  marginTop: 3,
                }}
              >
                Profile
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}

      {/* Pay Now / Make Payment Modal */}
      <Modal
        visible={payModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPayModalVisible(false)}
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
              maxHeight: '85%',
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <View>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A' }}>
                  Pay Maintenance
                </Text>
                <Text style={{ fontSize: 13, color: '#64748B' }}>
                  Room {roomNumber} • October 2026
                </Text>
              </View>
              <TouchableOpacity onPress={() => setPayModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Amount Banner */}
            <View
              style={{
                backgroundColor: '#FFF7ED',
                borderRadius: 16,
                padding: 16,
                alignItems: 'center',
                marginBottom: 18,
                borderWidth: 1,
                borderColor: '#FED7AA',
              }}
            >
              <Text style={{ fontSize: 13, color: '#C2410C', fontWeight: '600' }}>
                Total Payable Amount
              </Text>
              <Text style={{ fontSize: 32, fontWeight: '800', color: '#EA580C', marginTop: 2 }}>
                ₹500
              </Text>
            </View>

            {/* Segmented Mode Selector */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#F1F5F9',
                borderRadius: 12,
                padding: 4,
                marginBottom: 18,
              }}
            >
              <TouchableOpacity
                onPress={() => setPayTab('online')}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  alignItems: 'center',
                  borderRadius: 10,
                  backgroundColor: payTab === 'online' ? '#FFFFFF' : 'transparent',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: payTab === 'online' ? 0.08 : 0,
                  shadowRadius: 2,
                  elevation: payTab === 'online' ? 1 : 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 13.5,
                    fontWeight: '700',
                    color: payTab === 'online' ? '#F57C00' : '#64748B',
                  }}
                >
                  UPI / Online
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPayTab('cash')}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  alignItems: 'center',
                  borderRadius: 10,
                  backgroundColor: payTab === 'cash' ? '#FFFFFF' : 'transparent',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: payTab === 'cash' ? 0.08 : 0,
                  shadowRadius: 2,
                  elevation: payTab === 'cash' ? 1 : 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 13.5,
                    fontWeight: '700',
                    color: payTab === 'cash' ? '#F57C00' : '#64748B',
                  }}
                >
                  Cash Declaration
                </Text>
              </TouchableOpacity>
            </View>

            {payTab === 'online' ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* UPI Box */}
                <View
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: 16,
                    padding: 16,
                    alignItems: 'center',
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                  }}
                >
                  <View
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 16,
                      backgroundColor: '#FFFFFF',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: '#CBD5E1',
                    }}
                  >
                    <Ionicons name="qr-code" size={72} color="#1E293B" />
                  </View>

                  <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>
                    Society UPI ID
                  </Text>
                  <TouchableOpacity
                    onPress={handleCopyUPI}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#FFFFFF',
                      paddingHorizontal: 14,
                      paddingVertical: 6,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: '#CBD5E1',
                    }}
                  >
                    <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#0F172A', marginRight: 6 }}>
                      radhika.residency@icici
                    </Text>
                    <Ionicons name="copy-outline" size={15} color="#F57C00" />
                  </TouchableOpacity>
                </View>

                {/* Input for UTR */}
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 6 }}>
                  Transaction Reference / UTR Number *
                </Text>
                <TextInput
                  placeholder="e.g. UPI-49201948201 or Bank UTR"
                  placeholderTextColor="#94A3B8"
                  value={upiRefNumber}
                  onChangeText={setUpiRefNumber}
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: '#0F172A',
                    marginBottom: 18,
                  }}
                />

                <PrimaryButton
                  title="Submit Payment for Verification"
                  onPress={handleOnlineSubmit}
                  iconName="arrow-forward"
                />
              </ScrollView>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View
                  style={{
                    backgroundColor: '#FFFBEB',
                    borderRadius: 16,
                    padding: 14,
                    marginBottom: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: '#F59E0B',
                  }}
                >
                  <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#92400E' }}>
                    Cash Handover Policy
                  </Text>
                  <Text style={{ fontSize: 12.5, color: '#B45309', marginTop: 4 }}>
                    Please hand over ₹500 in cash to the Security Desk or the Society Management Office. Provide details below for quick verification.
                  </Text>
                </View>

                <Text style={{ fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 6 }}>
                  Handover Details / Note *
                </Text>
                <TextInput
                  placeholder="e.g. Handed to Guard Ramesh at gate / Paid to office"
                  placeholderTextColor="#94A3B8"
                  value={cashNotes}
                  onChangeText={setCashNotes}
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    fontSize: 14,
                    color: '#0F172A',
                    marginBottom: 18,
                  }}
                />

                <PrimaryButton
                  title="Submit Cash Declaration"
                  onPress={handleCashSubmit}
                  iconName="arrow-forward"
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Payment Details / Receipt Modal */}
      <Modal
        visible={Boolean(selectedPayment)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPayment(null)}
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
                  backgroundColor:
                    selectedPayment?.status === 'verified' ? '#DCFCE7' : '#FEF3C7',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                <Ionicons
                  name={selectedPayment?.status === 'verified' ? 'checkmark-circle' : 'time'}
                  size={32}
                  color={selectedPayment?.status === 'verified' ? '#16A34A' : '#D97706'}
                />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>
                Maintenance Receipt
              </Text>
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: '800',
                  color: selectedPayment?.status === 'verified' ? '#16A34A' : '#D97706',
                  marginTop: 4,
                }}
              >
                {selectedPayment?.amount}
              </Text>
            </View>

            <View style={{ backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, gap: 10, marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#64748B' }}>Room Number</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                  Room {selectedPayment?.room}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#64748B' }}>Billing Month</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                  {selectedPayment?.month}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#64748B' }}>Payment Method</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                  {selectedPayment?.method}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#64748B' }}>Reference</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                  {selectedPayment?.refId}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#64748B' }}>Status</Text>
                <StatusTag
                  label={selectedPayment?.status === 'verified' ? 'Verified' : 'Pending'}
                  variant={selectedPayment?.status === 'verified' ? 'green' : 'amber'}
                  size="sm"
                />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: '#64748B' }}>Date</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#0F172A' }}>
                  {selectedPayment?.date}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setSelectedPayment(null)}
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

      {/* History Modal */}
      <Modal
        visible={historyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setHistoryModalVisible(false)}
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
                Payment History
              </Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { month: 'October 2026', amount: '₹500', status: 'pending', date: 'Today' },
                { month: 'September 2026', amount: '₹500', status: 'verified', date: '04 Sep, 2026' },
                { month: 'August 2026', amount: '₹500', status: 'verified', date: '05 Aug, 2026' },
                { month: 'July 2026', amount: '₹500', status: 'verified', date: '03 Jul, 2026' },
                { month: 'June 2026', amount: '₹500', status: 'verified', date: '05 Jun, 2026' },
              ].map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 14,
                    borderBottomWidth: idx < 4 ? 1 : 0,
                    borderBottomColor: '#F1F5F9',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: item.status === 'verified' ? '#DCFCE7' : '#FEF3C7',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Ionicons
                        name={item.status === 'verified' ? 'checkmark' : 'time'}
                        size={18}
                        color={item.status === 'verified' ? '#16A34A' : '#D97706'}
                      />
                    </View>
                    <View>
                      <Text style={{ fontSize: 14.5, fontWeight: '700', color: '#0F172A' }}>
                        {item.month}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#64748B' }}>
                        {item.date}
                      </Text>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: '#0F172A' }}>
                      {item.amount}
                    </Text>
                    <StatusTag
                      label={item.status === 'verified' ? 'Verified' : 'Pending'}
                      variant={item.status === 'verified' ? 'green' : 'amber'}
                      size="sm"
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
                Notifications
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
                    Maintenance Bill for October
                  </Text>
                  <Text style={{ fontSize: 12.5, color: '#C2410C', marginTop: 2 }}>
                    Monthly maintenance of ₹500 is due on 05 October 2026.
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
                    September Payment Verified
                  </Text>
                  <Text style={{ fontSize: 12.5, color: '#15803D', marginTop: 2 }}>
                    Your payment of ₹500 was verified and approved by the admin.
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
