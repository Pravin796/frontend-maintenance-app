import React, { memo } from 'react';
import { View, Text } from 'react-native';

const VARIANT_STYLES = {
  orange: {
    bg: '#FFEDD5',
    text: '#EA580C',
  },
  amber: {
    bg: '#FEF3C7',
    text: '#D97706',
  },
  green: {
    bg: '#DCFCE7',
    text: '#16A34A',
  },
  emerald: {
    bg: '#ECFDF5',
    text: '#059669',
  },
  red: {
    bg: '#FEE2E2',
    text: '#DC2626',
  },
  blue: {
    bg: '#E0F2FE',
    text: '#0284C7',
  },
  gray: {
    bg: '#F1F5F9',
    text: '#64748B',
  },
  purple: {
    bg: '#F3E8FF',
    text: '#9333EA',
  },
};

/**
 * Reusable Status Tag / Badge Component
 * Used for "5 pending", "3 pending", "Paid", "Verified", etc.
 */
const StatusTag = memo(function StatusTag({
  label,
  variant = 'orange',
  bgColor,
  textColor,
  size = 'md',
  style,
  textStyle,
}) {
  const currentVariant = VARIANT_STYLES[variant] || VARIANT_STYLES.orange;
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        {
          backgroundColor: bgColor || currentVariant.bg,
          paddingHorizontal: isSmall ? 8 : 11,
          paddingVertical: isSmall ? 3 : 5,
          borderRadius: 20,
          alignSelf: 'flex-start',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            color: textColor || currentVariant.text,
            fontSize: isSmall ? 11 : 12.5,
            fontWeight: '700',
            letterSpacing: 0.1,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
});

export default StatusTag;
