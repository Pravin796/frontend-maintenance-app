import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Reusable Quick Action Tile Component
 * Used for the 4 action tiles:
 * 1. Pay Maintenance
 * 2. Online Payment
 * 3. Cash Payment
 * 4. Payment History
 */
const QuickActionTile = memo(function QuickActionTile({
  title,
  iconName = 'card',
  iconFamily = 'Ionicons',
  iconColor = '#EA580C',
  iconBgColor = '#FFF3E8',
  iconSize = 20,
  arrowColor = '#EA580C',
  renderIcon,
  onPress,
  style,
}) {
  const renderIconContent = () => {
    if (renderIcon) return renderIcon();
    if (!iconName) return null;

    if (iconFamily === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={iconName} size={iconSize} color={iconColor} />;
    }
    return <Ionicons name={iconName} size={iconSize} color={iconColor} />;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      style={[
        {
          flex: 1,
          backgroundColor: '#FFFFFF',
          borderRadius: 18,
          paddingVertical: 14,
          paddingHorizontal: 4,
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 112,
          borderWidth: 1,
          borderColor: '#F1F5F9',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.03,
          shadowRadius: 5,
          elevation: 1.5,
        },
        style,
      ]}
    >
      {/* Icon Squircle */}
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 13,
          backgroundColor: iconBgColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 6,
        }}
      >
        {renderIconContent()}
      </View>

      {/* 2-Line Title */}
      <Text
        numberOfLines={2}
        style={{
          fontSize: 11.5,
          fontWeight: '700',
          color: '#1E293B',
          textAlign: 'center',
          lineHeight: 15,
          marginBottom: 6,
        }}
      >
        {title}
      </Text>

      {/* Bottom Forward Arrow */}
      <Ionicons name="arrow-forward" size={13} color={arrowColor} />
    </TouchableOpacity>
  );
});

export default QuickActionTile;
