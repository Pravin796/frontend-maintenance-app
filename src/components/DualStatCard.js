import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Reusable Dual Stat Summary Card
 * Used for Payments summary showing "Last Payment" and "Outstanding Balance" side-by-side.
 */
const DualStatCard = memo(function DualStatCard({
  leftIcon = 'calendar-outline',
  leftIconColor = '#F97316',
  leftIconBg = '#FFF3E8',
  leftLabel = 'Last Payment',
  leftValue = '₹500',
  leftSubtext = 'September 2026 • Verified',
  leftVerified = true,
  onLeftPress,

  rightIcon = 'document-text-outline',
  rightIconColor = '#F97316',
  rightIconBg = '#FFF3E8',
  rightLabel = 'Outstanding Balance',
  rightValue = '₹1,500',
  rightSubtext = 'Includes pending months',
  onRightPress,

  style,
}) {
  return (
    <View
      style={[
        {
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'stretch',
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#F1F5F9',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.03,
          shadowRadius: 6,
          elevation: 1.5,
        },
        style,
      ]}
    >
      {/* Left Column: Last Payment */}
      <TouchableOpacity
        activeOpacity={onLeftPress ? 0.7 : 1}
        onPress={onLeftPress}
        disabled={!onLeftPress}
        style={{ flex: 1, paddingRight: 8 }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: leftIconBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
          }}
        >
          <Ionicons name={leftIcon} size={18} color={leftIconColor} />
        </View>

        <Text
          style={{
            fontSize: 12.5,
            fontWeight: '500',
            color: '#64748B',
            marginBottom: 3,
          }}
        >
          {leftLabel}
        </Text>

        <Text
          style={{
            fontSize: 22,
            fontWeight: '800',
            color: '#0F172A',
            letterSpacing: -0.4,
            marginBottom: 4,
          }}
        >
          {leftValue}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 11.5,
              fontWeight: '400',
              color: '#64748B',
              marginRight: 4,
            }}
          >
            {leftSubtext}
          </Text>
          {leftVerified && (
            <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
          )}
        </View>
      </TouchableOpacity>

      {/* Vertical Divider */}
      <View
        style={{
          width: 1,
          backgroundColor: '#F1F5F9',
          marginHorizontal: 8,
        }}
      />

      {/* Right Column: Outstanding Balance */}
      <TouchableOpacity
        activeOpacity={onRightPress ? 0.7 : 1}
        onPress={onRightPress}
        disabled={!onRightPress}
        style={{ flex: 1, paddingLeft: 8 }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: rightIconBg,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
          }}
        >
          <Ionicons name={rightIcon} size={18} color={rightIconColor} />
        </View>

        <Text
          style={{
            fontSize: 12.5,
            fontWeight: '500',
            color: '#64748B',
            marginBottom: 3,
          }}
        >
          {rightLabel}
        </Text>

        <Text
          style={{
            fontSize: 22,
            fontWeight: '800',
            color: '#0F172A',
            letterSpacing: -0.4,
            marginBottom: 4,
          }}
        >
          {rightValue}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            fontSize: 11.5,
            fontWeight: '400',
            color: '#64748B',
          }}
        >
          {rightSubtext}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

export default DualStatCard;
