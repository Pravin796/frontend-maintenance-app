import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Reusable Notice / Info Banner Component
 * Used for admin approval notice, status alerts, etc.
 */
const NoticeBanner = memo(function NoticeBanner({
  text = 'Your payment will be verified by the admin. You will be notified once it is approved.',
  iconName = 'information-circle-outline',
  iconColor = '#0284C7',
  iconSize = 20,
  bgColor = '#F0F9FF',
  borderColor = '#E0F2FE',
  textColor = '#475569',
  style,
}) {
  return (
    <View
      style={[
        {
          backgroundColor: bgColor,
          borderRadius: 16,
          paddingVertical: 12,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: borderColor,
          marginTop: 16,
          marginBottom: 10,
        },
        style,
      ]}
    >
      <Ionicons
        name={iconName}
        size={iconSize}
        color={iconColor}
        style={{ marginRight: 10 }}
      />
      <Text
        style={{
          flex: 1,
          fontSize: 12.5,
          color: textColor,
          lineHeight: 18,
          fontWeight: '400',
        }}
      >
        {text}
      </Text>
    </View>
  );
});

export default NoticeBanner;
