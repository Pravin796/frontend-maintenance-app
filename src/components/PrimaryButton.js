import React, { memo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const PrimaryButton = memo(function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  iconName,
  iconPosition = 'right',
  colors = ['#FF8A00', '#F57C00', '#E65100'],
  style,
  textStyle,
  activeOpacity = 0.88,
}) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        {
          borderRadius: 28,
          overflow: 'hidden',
          shadowColor: '#F57C00',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.38,
          shadowRadius: 16,
          elevation: 6,
          opacity: isDisabled ? 0.75 : 1,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 15,
          paddingHorizontal: 24,
          width: '100%',
        }}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {iconName && iconPosition === 'left' && (
              <Ionicons name={iconName} size={19} color="#FFFFFF" style={{ marginRight: 8 }} />
            )}
            <Text
              style={[
                {
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: 17,
                  letterSpacing: 0.2,
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
            {iconName && iconPosition === 'right' && (
              <Ionicons name={iconName} size={19} color="#FFFFFF" style={{ marginLeft: 8 }} />
            )}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
});

export default PrimaryButton;
