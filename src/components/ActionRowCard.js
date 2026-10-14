import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import StatusTag from './StatusTag';
import ReviewButton from './ReviewButton';

/**
 * Reusable Action Row Card / List Item
 * Used for:
 * - "Pending Verification" items (Online Payments, Cash Requests with pending tag and Review button)
 * - "Recent Activity" items (Room payment verified with green check and chevron)
 */
const ActionRowCard = memo(function ActionRowCard({
  iconName,
  iconFamily = 'Ionicons',
  iconColor = '#F57C00',
  iconBgColor = '#FFF3E8',
  iconSize = 22,
  renderIcon,
  title,
  subtitle,
  // Tag / Badge props
  tagLabel,
  tagVariant = 'orange',
  tagBgColor,
  tagTextColor,
  // Action props
  actionText = 'Review',
  onActionPress,
  showAction = false,
  showChevron = true,
  chevronColor = '#F57C00',
  // Layout & Styling
  asCard = false,
  showDivider = false,
  onPress,
  style,
}) {
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

  const Content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: asCard ? 16 : 14,
        paddingHorizontal: asCard ? 16 : 0,
      }}
    >
      {/* Left Rounded Icon Squircle */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: iconBgColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        {renderIconContent()}
      </View>

      {/* Center Details: Title + Subtitle */}
      <View style={{ flex: 1, marginRight: 10 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 15,
            fontWeight: '700',
            color: '#0F172A',
            marginBottom: 3,
            letterSpacing: -0.2,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={{
              fontSize: 12.5,
              fontWeight: '400',
              color: '#64748B',
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Right Controls: Tag + Action Button or Chevron */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {tagLabel ? (
          <View style={{ marginRight: showAction ? 10 : 6 }}>
            <StatusTag
              label={tagLabel}
              variant={tagVariant}
              bgColor={tagBgColor}
              textColor={tagTextColor}
            />
          </View>
        ) : null}

        {showAction ? (
          <ReviewButton
            title={actionText}
            color={chevronColor}
            onPress={onActionPress || onPress}
          />
        ) : showChevron ? (
          <Ionicons name="chevron-forward" size={19} color={chevronColor || '#94A3B8'} />
        ) : null}
      </View>
    </View>
  );

  return (
    <View>
      {onPress ? (
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onPress}
          style={[
            asCard && {
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.03,
              shadowRadius: 6,
              elevation: 1.5,
              borderWidth: 1,
              borderColor: '#F1F5F9',
              marginBottom: 12,
            },
            style,
          ]}
        >
          {Content}
        </TouchableOpacity>
      ) : (
        <View
          style={[
            asCard && {
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.03,
              shadowRadius: 6,
              elevation: 1.5,
              borderWidth: 1,
              borderColor: '#F1F5F9',
              marginBottom: 12,
            },
            style,
          ]}
        >
          {Content}
        </View>
      )}

      {showDivider && (
        <View
          style={{
            height: 1,
            backgroundColor: '#F1F5F9',
            marginLeft: 58,
          }}
        />
      )}
    </View>
  );
});

export default ActionRowCard;
