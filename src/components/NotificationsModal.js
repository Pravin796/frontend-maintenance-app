import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Reusable Notifications Modal
 * Displays resident society alerts, bills, and payment verification notices.
 */
const NotificationsModal = memo(function NotificationsModal({
  visible,
  onClose,
  notifications = [
    {
      id: 'notif-1',
      title: 'Maintenance Bill for October 2026',
      message: 'Monthly maintenance of ₹500 is due on 05 October 2026. Please pay on time.',
      time: 'Today, 08:00 AM',
      type: 'warning',
    },
    {
      id: 'notif-2',
      title: 'September Payment Verified',
      message: 'Your payment of ₹500 was verified and approved by society administration.',
      time: '04 Sep, 2026',
      type: 'success',
    },
    {
      id: 'notif-3',
      title: 'Society Lift Maintenance Notice',
      message: 'Routine maintenance of Elevator B will take place this Saturday between 2 PM to 5 PM.',
      time: '02 Sep, 2026',
      type: 'info',
    },
  ],
}) {
  const getBadgeColors = (type) => {
    switch (type) {
      case 'warning':
        return {
          bg: '#FFF7ED',
          border: '#F57C00',
          title: '#9A3412',
          text: '#C2410C',
          icon: 'alert-circle',
          iconColor: '#EA580C',
        };
      case 'success':
        return {
          bg: '#DCFCE7',
          border: '#16A34A',
          title: '#166534',
          text: '#15803D',
          icon: 'checkmark-circle',
          iconColor: '#16A34A',
        };
      default:
        return {
          bg: '#EFF6FF',
          border: '#2563EB',
          title: '#1E40AF',
          text: '#1D4ED8',
          icon: 'information-circle',
          iconColor: '#2563EB',
        };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: '#FFF3E8',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <Ionicons name="notifications" size={20} color="#F57C00" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A' }}>
                Notifications
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#F1F5F9',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ gap: 12, marginBottom: 20 }}>
              {notifications.map((item) => {
                const colors = getBadgeColors(item.type);
                return (
                  <View
                    key={item.id}
                    style={{
                      padding: 14,
                      borderRadius: 16,
                      backgroundColor: colors.bg,
                      borderLeftWidth: 4,
                      borderLeftColor: colors.border,
                      borderWidth: 1,
                      borderColor: 'rgba(0,0,0,0.03)',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Ionicons
                          name={colors.icon}
                          size={16}
                          color={colors.iconColor}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '700',
                            color: colors.title,
                            flex: 1,
                          }}
                        >
                          {item.title}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 11, color: '#64748B', marginLeft: 6 }}>
                        {item.time}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 12.5,
                        color: colors.text,
                        lineHeight: 18,
                        marginTop: 2,
                      }}
                    >
                      {item.message}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

export default NotificationsModal;
