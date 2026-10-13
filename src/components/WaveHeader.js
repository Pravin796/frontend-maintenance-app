import React, { memo } from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const WaveHeader = memo(function WaveHeader({
  height = 72,
  onBack,
  colors = ['#FF6F00', '#FF8500', '#F57C00', '#E65100'],
  fillColor = '#FAF9F6',
}) {
  return (
    <View style={{ width: '100%', height, position: 'relative', overflow: 'hidden' }}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 375 ${height}`}
        preserveAspectRatio="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <Defs>
          <SvgLinearGradient id="sharedWaveHighlight" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.04" />
          </SvgLinearGradient>
        </Defs>
        <Path
          d="M -30,22 C 80,48 200,16 420,38 L 420,-10 L -30,-10 Z"
          fill="url(#sharedWaveHighlight)"
        />
        <Path
          d="M -20,36 C 90,14 220,44 410,24"
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth="1.8"
          fill="none"
        />
        <Path
          d={`M 0,42 C 65,68 150,72 235,58 C 290,48 335,46 375,50 L 375,${height} L 0,${height} Z`}
          fill={fillColor}
        />
      </Svg>

      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          style={{
            position: 'absolute',
            top: Platform.OS === 'ios' ? 44 : 32,
            left: 20,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(255, 255, 255, 0.22)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
});

export default WaveHeader;
