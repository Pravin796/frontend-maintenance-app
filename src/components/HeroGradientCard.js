import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

/**
 * Reusable Hero Gradient Card
 * Used for both Admin Monthly Collection Card and Resident Balance Hero Card.
 * 
 * Props:
 * - variant: 'collection' | 'balance' | 'custom'
 * - variant === 'collection':
 *     month: string (e.g. 'October')
 *     title: string (e.g. 'October Collection')
 *     collected: string | number (e.g. '₹18,000')
 *     remaining: string | number (e.g. '₹22,000')
 *     progress: number (e.g. 45 for 45%)
 *     progressLabel: string (e.g. '45% collected')
 *     onPressChevron: func
 * - variant === 'balance':
 *     title: string (e.g. 'Outstanding Balance')
 *     amount: string | number (e.g. '₹1,500')
 *     onActionPress: func
 * - onPress: general card press handler
 * - children: custom content if variant === 'custom' or passed as children
 * - style: custom container style
 */
const HeroGradientCard = memo(function HeroGradientCard({
  variant = 'collection',
  // Collection props
  title,
  month = 'October',
  collected = '₹18,000',
  remaining = '₹22,000',
  progress = 45,
  progressLabel,
  onPressChevron,
  // Balance & Due props
  amount = '₹1,500',
  dueText = 'Due for October 2026',
  subtitle,
  buttonText = 'Pay Now',
  onActionPress,
  onPayPress,
  // General props
  onPress,
  children,
  style,
  colors = ['#FF6F00', '#FF8500', '#F57C00', '#E65100'],
}) {
  const displayTitle = title || (
    variant === 'collection'
      ? `${month} Collection`
      : variant === 'due'
      ? 'Current Maintenance Due'
      : 'Outstanding Balance'
  );
  const displayProgressLabel = progressLabel || `${Math.round(progress)}% collected`;

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      activeOpacity={onPress ? 0.9 : 1}
      onPress={onPress}
      style={[
        {
          borderRadius: 24,
          overflow: 'hidden',
          marginBottom: 16,
          shadowColor: '#F57C00',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.28,
          shadowRadius: 16,
          elevation: 5,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.95 }}
        style={{
          paddingVertical: 22,
          paddingHorizontal: 20,
          position: 'relative',
          minHeight: 140,
          justifyContent: 'center',
        }}
      >
        {/* Subtle Fluid Wave Watermark Background */}
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 340 140"
          preserveAspectRatio="none"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <Defs>
            <SvgLinearGradient id="heroCardWaveShared" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.04" />
            </SvgLinearGradient>
          </Defs>
          <Path
            d="M 120,0 C 180,60 250,20 360,90 L 360,140 L 0,140 C 40,80 80,120 120,0 Z"
            fill="url(#heroCardWaveShared)"
          />
          <Path
            d="M 200,-20 C 240,40 290,60 360,80"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1.8"
            fill="none"
          />
        </Svg>

        {/* Content Area */}
        <View style={{ zIndex: 2 }}>
          {variant === 'collection' && (
            <>
              {/* Header: Calendar Icon + Title + Chevron Right */}
              <TouchableOpacity
                activeOpacity={onPressChevron ? 0.7 : 1}
                onPress={onPressChevron || onPress}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 16,
                      fontWeight: '700',
                      letterSpacing: 0.1,
                    }}
                  >
                    {displayTitle}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={19} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Two-Column Stats Row with Divider */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                {/* Column 1: Collected */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: 'rgba(255, 255, 255, 0.88)',
                      fontSize: 13,
                      fontWeight: '500',
                      marginBottom: 5,
                      letterSpacing: 0.1,
                    }}
                  >
                    Collected
                  </Text>
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={{
                      color: '#FFFFFF',
                      fontSize: 28,
                      fontWeight: '800',
                      letterSpacing: -0.5,
                    }}
                  >
                    {collected}
                  </Text>
                </View>

                {/* Vertical Divider Line */}
                <View
                  style={{
                    width: 1,
                    height: 44,
                    backgroundColor: 'rgba(255, 255, 255, 0.28)',
                    marginHorizontal: 16,
                  }}
                />

                {/* Column 2: Remaining to Collect */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: 'rgba(255, 255, 255, 0.88)',
                      fontSize: 13,
                      fontWeight: '500',
                      marginBottom: 5,
                      letterSpacing: 0.1,
                    }}
                  >
                    Remaining to Collect
                  </Text>
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={{
                      color: '#FFFFFF',
                      fontSize: 28,
                      fontWeight: '800',
                      letterSpacing: -0.5,
                    }}
                  >
                    {remaining}
                  </Text>
                </View>
              </View>

              {/* Progress Bar Track & Indicator */}
              <View
                style={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  overflow: 'hidden',
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    width: `${Math.min(Math.max(progress, 0), 100)}%`,
                    height: '100%',
                    backgroundColor: '#FACC15',
                    borderRadius: 4,
                  }}
                />
              </View>

              {/* Progress Percentage Text */}
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: 12.5,
                  fontWeight: '500',
                }}
              >
                {displayProgressLabel}
              </Text>
            </>
          )}

          {variant === 'balance' && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View>
                <Text
                  style={{
                    color: 'rgba(255, 255, 255, 0.92)',
                    fontSize: 14.5,
                    fontWeight: '500',
                    marginBottom: 6,
                    letterSpacing: 0.1,
                  }}
                >
                  {displayTitle}
                </Text>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 38,
                    fontWeight: '800',
                    letterSpacing: -0.5,
                  }}
                >
                  {amount}
                </Text>
              </View>

              {/* Translucent Action Circle Arrow Button */}
              <TouchableOpacity
                onPress={onActionPress || onPress}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: 'rgba(255, 255, 255, 0.26)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.35)',
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {variant === 'due' && (
            <View>
              {/* Top row: Credit card icon + Title */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                  }}
                >
                  <Ionicons name="card" size={17} color="#F57C00" />
                </View>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 15,
                    fontWeight: '600',
                    letterSpacing: 0.1,
                  }}
                >
                  {displayTitle}
                </Text>
              </View>

              {/* Bottom Row: Amount & Subtitle on left, Pay Now button on right */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}
              >
                <View>
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 38,
                      fontWeight: '800',
                      letterSpacing: -0.6,
                      lineHeight: 44,
                    }}
                  >
                    {amount}
                  </Text>
                  <Text
                    style={{
                      color: 'rgba(255, 255, 255, 0.92)',
                      fontSize: 13,
                      fontWeight: '500',
                      marginTop: 2,
                    }}
                  >
                    {subtitle || dueText}
                  </Text>
                </View>

                {/* White Pill Button: Pay Now → */}
                <TouchableOpacity
                  onPress={onActionPress || onPayPress || onPress}
                  activeOpacity={0.88}
                  style={{
                    backgroundColor: '#FFFFFF',
                    paddingVertical: 10,
                    paddingHorizontal: 18,
                    borderRadius: 24,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.12,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Text
                    style={{
                      color: '#EA580C',
                      fontSize: 14.5,
                      fontWeight: '700',
                      marginRight: 6,
                    }}
                  >
                    {buttonText}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#EA580C" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {variant === 'custom' && children}
        </View>
      </LinearGradient>
    </CardWrapper>
  );
});

export default HeroGradientCard;
