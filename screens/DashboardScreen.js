import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

export default function DashboardScreen({ user, onLogout, onChangePassword }) {
  const [activeTab, setActiveTab] = useState('home');

  const userName = user?.fullName || 'Pravin Kumar';
  const roomNumber = user?.roomNumber || '104';

  const handleLogoutConfirm = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: onLogout },
    ]);
  };

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
        {activeTab === 'home' ? (
          <>
            {/* Header: Greeting + Name & Notification Bell */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 18,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 14.5,
                    fontWeight: '500',
                    color: '#64748B',
                    marginBottom: 3,
                  }}
                >
                  Good morning,
                </Text>
                <Text
                  style={{
                    fontSize: 23,
                    fontWeight: '800',
                    color: '#111827',
                    letterSpacing: -0.3,
                  }}
                >
                  {userName} 👋
                </Text>
              </View>

              {/* Notification Bell with Red Badge */}
              <TouchableOpacity
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
                <Ionicons name="notifications-outline" size={24} color="#334155" />
                {/* Red dot badge */}
                <View
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 11,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#EF4444',
                    borderWidth: 1.5,
                    borderColor: '#FFFFFF',
                  }}
                />
              </TouchableOpacity>
            </View>

            {/* Room Card */}
            <TouchableOpacity
              activeOpacity={0.8}
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

              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#1E293B',
                  flex: 1,
                }}
              >
                Room {roomNumber}
              </Text>

              <Ionicons name="chevron-forward" size={19} color="#94A3B8" />
            </TouchableOpacity>

            {/* Outstanding Balance Hero Card */}
            <View
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                marginBottom: 16,
                shadowColor: '#F57C00',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.28,
                shadowRadius: 16,
                elevation: 5,
              }}
            >
              <LinearGradient
                colors={['#FF6F00', '#FF8500', '#F57C00', '#E65100']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.95 }}
                style={{
                  paddingVertical: 24,
                  paddingHorizontal: 22,
                  position: 'relative',
                  minHeight: 140,
                  justifyContent: 'center',
                }}
              >
                {/* Subtle Fluid Wave Watermark */}
                <Svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 340 140"
                  preserveAspectRatio="none"
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                >
                  <Defs>
                    <SvgLinearGradient id="heroCardWave" x1="0" y1="0" x2="1" y2="1">
                      <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
                      <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.04" />
                    </SvgLinearGradient>
                  </Defs>
                  <Path
                    d="M 120,0 C 180,60 250,20 360,90 L 360,140 L 0,140 C 40,80 80,120 120,0 Z"
                    fill="url(#heroCardWave)"
                  />
                  <Path
                    d="M 200,-20 C 240,40 290,60 360,80"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="1.8"
                    fill="none"
                  />
                </Svg>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 2,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: 'rgba(255, 255, 255, 0.92)',
                        fontSize: 14.5,
                        fontWeight: '500',
                        marginBottom: 6,
                        letterSpacing: 0.1,
                      }}
                    >
                      Outstanding Balance
                    </Text>
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 38,
                        fontWeight: '800',
                        letterSpacing: -0.5,
                      }}
                    >
                      ₹1,500
                    </Text>
                  </View>

                  {/* Translucent Action Circle Arrow Button */}
                  <TouchableOpacity
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: 'rgba(255, 255, 255, 0.26)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.35)',
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>

            {/* Monthly Maintenance Card */}
            <TouchableOpacity
              activeOpacity={0.8}
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
                <View
                  style={{
                    backgroundColor: '#DCFCE7',
                    paddingHorizontal: 12,
                    paddingVertical: 4.5,
                    borderRadius: 12,
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{
                      color: '#059669',
                      fontSize: 12.5,
                      fontWeight: '700',
                    }}
                  >
                    Paid
                  </Text>
                </View>
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
                onPress={() => setActiveTab('history')}
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
          </>
        ) : activeTab === 'profile' ? (
          /* Profile Tab View */
          <View style={{ paddingTop: 8 }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: '800',
                color: '#111827',
                marginBottom: 20,
              }}
            >
              Account & Profile
            </Text>

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
          </View>
        ) : (
          /* Placeholder View for Payments / History Tabs */
          <View style={{ paddingTop: 8, alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#FFF2E8',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Ionicons
                name={activeTab === 'payments' ? 'card-outline' : 'time-outline'}
                size={30}
                color="#F57C00"
              />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 6 }}>
              {activeTab === 'payments' ? 'Payments Section' : 'Payment History'}
            </Text>
            <Text style={{ fontSize: 13.5, color: '#64748B', textAlign: 'center', paddingHorizontal: 32 }}>
              Detailed records and payment flows will be connected with backend APIs soon.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
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
          onPress={() => setActiveTab('home')}
          activeOpacity={0.7}
          style={{ alignItems: 'center', minWidth: 64 }}
        >
          <Ionicons
            name="home"
            size={22}
            color={activeTab === 'home' ? '#F57C00' : '#94A3B8'}
          />
          <Text
            style={{
              fontSize: 11.5,
              fontWeight: activeTab === 'home' ? '700' : '500',
              color: activeTab === 'home' ? '#F57C00' : '#94A3B8',
              marginTop: 3,
            }}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Payments */}
        <TouchableOpacity
          onPress={() => setActiveTab('payments')}
          activeOpacity={0.7}
          style={{ alignItems: 'center', minWidth: 64 }}
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
              marginTop: 3,
            }}
          >
            Payments
          </Text>
        </TouchableOpacity>

        {/* Tab 3: History */}
        <TouchableOpacity
          onPress={() => setActiveTab('history')}
          activeOpacity={0.7}
          style={{ alignItems: 'center', minWidth: 64 }}
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
              marginTop: 3,
            }}
          >
            History
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
