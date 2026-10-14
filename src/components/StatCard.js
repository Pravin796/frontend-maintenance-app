import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

/**
 * Reusable Metric / Stat Card Component
 * Used for the 3 horizontal metric cards:
 * 1. Total Pending Dues (₹24,000)
 * 2. Online Reviews (5)
 * 3. Cash Reviews (3)
 */
const StatCard = memo(function StatCard({
  iconName,
  iconFamily = 'Ionicons',
  iconColor = '#F57C00',
  iconBgColor = '#FFF3E8',
  iconSize = 20,
  renderIcon,
  title,
  value,
  subtitle,
  onPress,
  style,
  flex = 1,
}) {
  const CardWrapper = onPress ? TouchableOpacity : View;

  const renderIconContent = () => {
    if (renderIcon) return renderIcon();
    if (!iconName) return null;

    if (iconFamily === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={iconName} size={iconSize} color={iconColor} />;
    }
    if (iconFamily === 'FontAwesome5') {
      return <FontAwesome5 name={iconName} size={iconSize} color={iconColor} />;
    }
    return <Ionicons name={iconName} size={iconSize} color={iconColor} />;
  };

  return (
    <CardWrapper
      activeOpacity={onPress ? 0.75 : 1}
      onPress={onPress}
      style={[
        {
          flex,
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: 13,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.03,
          shadowRadius: 6,
          elevation: 1.5,
          borderWidth: 1,
          borderColor: '#F1F5F9',
          justifyContent: 'space-between',
        },
        style,
      ]}
    >
      {/* Top Rounded Squircle Icon */}
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 13,
          backgroundColor: iconBgColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
        }}
      >
        {renderIconContent()}
      </View>

      {/* Main Content */}
      <View>
        <Text
          numberOfLines={2}
          style={{
            fontSize: 12.5,
            fontWeight: '700',
            color: '#1E293B',
            lineHeight: 16,
            marginBottom: 4,
          }}
        >
          {title}
        </Text>

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            fontSize: 21,
            fontWeight: '800',
            color: '#0F172A',
            letterSpacing: -0.4,
            marginBottom: 4,
          }}
        >
          {value}
        </Text>

        {subtitle ? (
          <Text
            numberOfLines={2}
            style={{
              fontSize: 11,
              fontWeight: '400',
              color: '#64748B',
              lineHeight: 14,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </CardWrapper>
  );
});

export default StatCard;
