import React, { useState, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Default notification items matching the user's design screenshot
 */
const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Payment Verified',
    message: 'Your payment of ₹500 for September 2026 has been verified by the admin.',
    time: 'Oct 5, 2025 • 10:24 AM',
    unread: true,
    icon: 'card-outline',
    iconColor: '#EA580C',
    iconBg: '#FFF3E8',
  },
  {
    id: 'notif-2',
    title: 'Monthly Maintenance Due',
    message: 'Your October 2026 maintenance bill is due. Amount: ₹500.',
    time: 'Oct 3, 2025 • 04:12 PM',
    unread: true,
    icon: 'calendar-outline',
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
  },
  {
    id: 'notif-3',
    title: 'Payment Request',
    message: 'You have submitted a payment request for October 2025. It is under review.',
    time: 'Oct 2, 2025 • 11:45 AM',
    unread: true,
    icon: 'document-text-outline',
    iconColor: '#0284C7',
    iconBg: '#E0F2FE',
  },
  {
    id: 'notif-4',
    title: 'Admin Announcement',
    message: 'Water supply will be temporarily closed on Oct 8, 2025 from 10 AM to 2 PM.',
    time: 'Oct 1, 2025 • 06:20 PM',
    unread: false,
    icon: 'megaphone-outline',
    iconColor: '#9333EA',
    iconBg: '#F3E8FF',
  },
  {
    id: 'notif-5',
    title: 'Payment Allocated',
    message: 'Your payment has been allocated towards October 2025 maintenance.',
    time: 'Sep 28, 2025 • 09:15 AM',
    unread: false,
    icon: 'checkmark-circle',
    iconColor: '#16A34A',
    iconBg: '#DCFCE7',
  },
  {
    id: 'notif-6',
    title: 'Cash Payment Request',
    message: 'Your cash payment request for ₹1000 is under verification.',
    time: 'Sep 27, 2025 • 03:32 PM',
    unread: false,
    icon: 'time-outline',
    iconColor: '#D97706',
    iconBg: '#FEF3C7',
  },
];

/**
 * NotificationsModal
 * Matches the user's provided design:
 * - Rounded bottom sheet with grab handle
 * - Header with orange squircle bell icon and '• X Unread' pill badge
 * - Segmented tabs: All (count), Unread (count), Read (count)
 * - Themed notification cards with icon squircles, status badges, and timestamp
 * - Informational notice banner at the bottom
 */
const NotificationsModal = memo(function NotificationsModal({
  visible,
  onClose,
  initialNotifications = DEFAULT_NOTIFICATIONS,
  onNotificationPress,
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const readCount = notifications.filter((n) => !n.unread).length;
  const allCount = notifications.length;

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'unread') return item.unread;
    if (filter === 'read') return !item.unread;
    return true;
  });

  const handleCardPress = (item) => {
    if (item.unread) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
      );
    }
    if (onNotificationPress) {
      onNotificationPress(item);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                maxHeight: '88%',
                paddingTop: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
                elevation: 10,
              }}
            >
              {/* Top Handle Bar */}
              <View
                style={{
                  width: 44,
                  height: 4.5,
                  borderRadius: 3,
                  backgroundColor: '#CBD5E1',
                  alignSelf: 'center',
                  marginBottom: 14,
                }}
              />

              {/* Header Section */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 20,
                  marginBottom: 16,
                }}
              >
                {/* Left: Orange Bell Squircle + Title & Subtitle */}
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 16,
                      backgroundColor: '#F57C00',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                      shadowColor: '#F57C00',
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.28,
                      shadowRadius: 6,
                      elevation: 2.5,
                    }}
                  >
                    <Ionicons name="notifications" size={23} color="#FFFFFF" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: '800',
                        color: '#0F172A',
                        letterSpacing: -0.3,
                      }}
                    >
                      Notifications
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#64748B',
                        marginTop: 2,
                        fontWeight: '500',
                      }}
                    >
                      Stay updated with the latest information
                    </Text>
                  </View>
                </View>

                {/* Right: Unread Count Badge */}
                <View
                  style={{
                    backgroundColor: '#FFF3E8',
                    borderRadius: 20,
                    paddingHorizontal: 11,
                    paddingVertical: 5.5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginLeft: 8,
                  }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#EA580C',
                      marginRight: 6,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: '#EA580C',
                    }}
                  >
                    {unreadCount} Unread
                  </Text>
                </View>
              </View>

              {/* Segmented Filter Tabs: All, Unread, Read */}
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#F1F5F9',
                  borderRadius: 26,
                  padding: 4,
                  marginHorizontal: 20,
                  marginBottom: 16,
                }}
              >
                {/* Tab: All */}
                <TouchableOpacity
                  onPress={() => setFilter('all')}
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    backgroundColor: filter === 'all' ? '#F57C00' : 'transparent',
                    borderRadius: 22,
                    paddingVertical: 7.5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: filter === 'all' ? '700' : '600',
                      color: filter === 'all' ? '#FFFFFF' : '#475569',
                      marginRight: 6,
                    }}
                  >
                    All
                  </Text>
                  <View
                    style={{
                      minWidth: 20,
                      height: 20,
                      paddingHorizontal: 5,
                      borderRadius: 10,
                      backgroundColor: filter === 'all' ? '#FFFFFF' : '#E2E8F0',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '800',
                        color: filter === 'all' ? '#EA580C' : '#334155',
                      }}
                    >
                      {allCount}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Tab: Unread */}
                <TouchableOpacity
                  onPress={() => setFilter('unread')}
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    backgroundColor: filter === 'unread' ? '#F57C00' : 'transparent',
                    borderRadius: 22,
                    paddingVertical: 7.5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: filter === 'unread' ? '700' : '600',
                      color: filter === 'unread' ? '#FFFFFF' : '#475569',
                      marginRight: 6,
                    }}
                  >
                    Unread
                  </Text>
                  <View
                    style={{
                      minWidth: 20,
                      height: 20,
                      paddingHorizontal: 5,
                      borderRadius: 10,
                      backgroundColor: filter === 'unread' ? '#FFFFFF' : '#E2E8F0',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '800',
                        color: filter === 'unread' ? '#EA580C' : '#334155',
                      }}
                    >
                      {unreadCount}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Tab: Read */}
                <TouchableOpacity
                  onPress={() => setFilter('read')}
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    backgroundColor: filter === 'read' ? '#F57C00' : 'transparent',
                    borderRadius: 22,
                    paddingVertical: 7.5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: filter === 'read' ? '700' : '600',
                      color: filter === 'read' ? '#FFFFFF' : '#475569',
                      marginRight: 6,
                    }}
                  >
                    Read
                  </Text>
                  <View
                    style={{
                      minWidth: 20,
                      height: 20,
                      paddingHorizontal: 5,
                      borderRadius: 10,
                      backgroundColor: filter === 'read' ? '#FFFFFF' : '#E2E8F0',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '800',
                        color: filter === 'read' ? '#EA580C' : '#334155',
                      }}
                    >
                      {readCount}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Notifications List */}
              <ScrollView
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingBottom: 24,
                }}
                showsVerticalScrollIndicator={false}
              >
                {filteredNotifications.length === 0 ? (
                  <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                    <Ionicons name="notifications-off-outline" size={42} color="#CBD5E1" />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: '#64748B',
                        marginTop: 10,
                      }}
                    >
                      No {filter} notifications
                    </Text>
                  </View>
                ) : (
                  filteredNotifications.map((item) => {
                    const isUnread = item.unread;

                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => handleCardPress(item)}
                        activeOpacity={0.75}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: 18,
                          padding: 14,
                          marginBottom: 12,
                          borderWidth: 1,
                          borderColor: isUnread ? '#FED7AA' : '#F1F5F9',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: isUnread ? 0.04 : 0.02,
                          shadowRadius: 4,
                          elevation: 1.5,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        {/* Themed Icon Squircle */}
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 14,
                            backgroundColor: item.iconBg,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                          }}
                        >
                          <Ionicons name={item.icon} size={22} color={item.iconColor} />
                        </View>

                        {/* Content: Title, Description, Timestamp */}
                        <View style={{ flex: 1, marginRight: 8 }}>
                          {/* Top Row: Title + Status Badge */}
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: 3,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 14.5,
                                fontWeight: '700',
                                color: '#0F172A',
                                flex: 1,
                                marginRight: 6,
                              }}
                            >
                              {item.title}
                            </Text>

                            {/* Pill Badge */}
                            <View
                              style={{
                                backgroundColor: isUnread ? '#FFF3E8' : '#F1F5F9',
                                paddingHorizontal: 8,
                                paddingVertical: 2.5,
                                borderRadius: 10,
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            >
                              <View
                                style={{
                                  width: 5,
                                  height: 5,
                                  borderRadius: 2.5,
                                  backgroundColor: isUnread ? '#EA580C' : '#64748B',
                                  marginRight: 5,
                                }}
                              />
                              <Text
                                style={{
                                  fontSize: 10.5,
                                  fontWeight: '700',
                                  color: isUnread ? '#EA580C' : '#64748B',
                                }}
                              >
                                {isUnread ? 'Unread' : 'Read'}
                              </Text>
                            </View>
                          </View>

                          {/* Description */}
                          <Text
                            style={{
                              fontSize: 12,
                              color: '#64748B',
                              lineHeight: 16.5,
                              marginBottom: 6,
                            }}
                          >
                            {item.message}
                          </Text>

                          {/* Timestamp with Clock Icon */}
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="time-outline" size={13} color="#94A3B8" />
                            <Text
                              style={{
                                fontSize: 11,
                                color: '#94A3B8',
                                marginLeft: 4,
                                fontWeight: '500',
                              }}
                            >
                              {item.time}
                            </Text>
                          </View>
                        </View>

                        {/* Right Chevron */}
                        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                      </TouchableOpacity>
                    );
                  })
                )}

                {/* Bottom Notice Banner */}
                <View
                  style={{
                    backgroundColor: '#FFF7ED',
                    borderRadius: 14,
                    padding: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 4,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: '#FED7AA',
                  }}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color="#EA580C"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      fontSize: 11.5,
                      color: '#9A3412',
                      lineHeight: 16,
                      flex: 1,
                      fontWeight: '400',
                    }}
                  >
                    Notifications are automatically marked as read when you view them.
                  </Text>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
});

export default NotificationsModal;
