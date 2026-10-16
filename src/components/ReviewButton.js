import React, { memo } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Reusable Review / Text Action Button
 * Example: "Review >" in orange
 */
const ReviewButton = memo(function ReviewButton({
  title = 'Review',
  color = '#F57C00',
  iconName = 'chevron-forward',
  iconSize = 16,
  onPress,
  style,
  textStyle,
  activeOpacity = 0.7,
  disabled = false,
}) {
  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 4,
          paddingHorizontal: 4,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            color,
            fontSize: 14,
            fontWeight: '600',
            marginRight: 2,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
      {iconName && (
        <Ionicons name={iconName} size={iconSize} color={color} />
      )}
    </TouchableOpacity>
  );
});

export default ReviewButton;
