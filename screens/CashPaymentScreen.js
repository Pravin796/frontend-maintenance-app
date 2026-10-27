import React, { useState, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Circle, Path, G } from 'react-native-svg';
import { createCashPaymentRequest } from '../src/services/api';

/**
 * CashIllustrationSvg
 * Stylized vector art representing cash payment handoff
 */
const CashIllustrationSvg = memo(function CashIllustrationSvg({ width = 85, height = 55 }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 100 65" fill="none">
      {/* Background warm glow */}
      <Circle cx="68" cy="32" r="28" fill="#FEF3C7" opacity={0.6} />
      <Circle cx="82" cy="18" r="6" fill="#FDE68A" opacity={0.5} />

      {/* Sparkles / Sunburst rays */}
      <Path d="M68 6 L68 11" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <Path d="M84 10 L80 14" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
      <Path d="M52 12 L56 16" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />

      {/* Top hand receiving/holding (right side cuff) */}
      <Rect x="82" y="24" width="18" height="18" rx="3" fill="#1E3A8A" />
      <Rect x="80" y="27" width="4" height="12" rx="1" fill="#FFFFFF" />
      {/* Hand skin tone */}
      <Path
        d="M80 27 C75 27 70 30 66 31 L58 31 C56 31 55 29 57 28 L66 26 C68 25 73 24 80 25 Z"
        fill="#FDBA74"
      />

      {/* Banknote 1 (back tilted) */}
      <G transform="rotate(-6 55 30)">
        <Rect x="30" y="22" width="36" height="20" rx="3" fill="#10B981" />
        <Rect x="32" y="24" width="32" height="16" rx="2" fill="#34D399" />
        <Circle cx="48" cy="32" r="4.5" fill="#059669" />
      </G>

      {/* Banknote 2 (front main) */}
      <G transform="rotate(4 55 32)">
        <Rect x="36" y="22" width="38" height="21" rx="3" fill="#059669" />
        <Rect x="38" y="24" width="34" height="17" rx="2" fill="#10B981" />
        <Circle cx="55" cy="32.5" r="5" fill="#047857" />
        <Circle cx="55" cy="32.5" r="2.5" fill="#A7F3D0" />
      </G>

      {/* Bottom hand supporting / offering (left/bottom side) */}
      <Path
        d="M38 48 C44 48 50 47 58 43 C64 40 68 40 73 43 C74 44 73 46 71 47 C65 50 58 53 50 53 C44 53 40 51 38 48 Z"
        fill="#FED7AA"
      />
    </Svg>
  );
});

/**
 * CashPaymentScreen
 * Matches the user's design:
 * - Card 1: Declare Cash Payment (Banner, Amount Input, Info Notice, Submit Button)
 * - Card 2: How It Works (4 numbered steps with status badges, info alert)
 */
export default function CashPaymentScreen({
  user,
  outstandingAmount = '₹1,500',
  defaultAmount = '1000',
  onSubmitCashPayment,
  onBack,
}) {
  const roomNumber = user?.roomNumber || '104';
  const [amount, setAmount] = useState(defaultAmount);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = amount.trim();
    if (!trimmed || isNaN(trimmed) || Number(trimmed) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid cash payment amount.');
      return;
    }

    const numAmount = Number(trimmed);
    setIsSubmitting(true);

    try {
      const res = await createCashPaymentRequest({
        amount: numAmount,
        roomId: user?.roomId,
      });

      const paymentData = {
        id: res?.id ? `cash-${res.id}` : `cash-${Date.now()}`,
        backendId: res?.id,
        room: roomNumber,
        amount: `₹${numAmount.toLocaleString('en-IN')}`,
        status: 'pending',
        method: 'Cash Payment',
        date: 'Just now',
        verifiedBy: 'Pending Admin Verification',
      };

      if (onSubmitCashPayment) {
        onSubmitCashPayment(paymentData);
      }

      Alert.alert(
        'Cash Payment Declared',
        `Your declaration of ₹${numAmount.toLocaleString(
          'en-IN'
        )} has been submitted. The admin will verify it once received.`,
        [{ text: 'OK', onPress: onBack }]
      );
    } catch (err) {
      console.warn('Cash payment declaration failed:', err);
      Alert.alert(
        'Declaration Failed',
        err?.response?.data?.message || err?.message || 'Unable to submit cash payment declaration.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 36,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Card: Declare Cash Payment */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 22,
          padding: 18,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#F1F5F9',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        {/* Top Banner: Warm tint with title, subtext & illustration */}
        <View
          style={{
            backgroundColor: '#FFF9F3',
            borderRadius: 18,
            padding: 14,
            borderWidth: 1,
            borderColor: '#FEE5D0',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            overflow: 'hidden',
          }}
        >
          {/* Left Side: Circular Wallet Icon + Title & Subtitle */}
          <View style={{ flex: 1, paddingRight: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: '#EA580C',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                  shadowColor: '#EA580C',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Ionicons name="cash" size={22} color="#FFFFFF" />
              </View>

              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '800',
                  color: '#0F172A',
                  letterSpacing: -0.3,
                  flex: 1,
                }}
              >
                Declare Cash Payment
              </Text>
            </View>

            <Text
              style={{
                fontSize: 11.5,
                color: '#64748B',
                lineHeight: 16,
                fontWeight: '400',
              }}
            >
              Enter the amount you paid to the admin and submit the request. It will be reviewed by
              the admin.
            </Text>
          </View>

          {/* Right Side: Cash handoff vector illustration */}
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <CashIllustrationSvg width={84} height={54} />
          </View>
        </View>

        {/* Input: Amount Paid * */}
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 12.5,
              fontWeight: '700',
              color: '#1E293B',
              marginBottom: 6,
            }}
          >
            Amount Paid <Text style={{ color: '#EF4444' }}>*</Text>
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E2E8F0',
              paddingHorizontal: 14,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: '#64748B',
                marginRight: 8,
              }}
            >
              ₹
            </Text>
            <TextInput
              placeholder="Enter amount (e.g. 1000)"
              placeholderTextColor="#94A3B8"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={{
                flex: 1,
                paddingVertical: 12,
                fontSize: 14,
                fontWeight: '600',
                color: '#0F172A',
              }}
            />
          </View>
        </View>

        {/* Info Tip Box */}
        <View
          style={{
            backgroundColor: '#EFF6FF',
            borderColor: '#BAE6FD',
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 16,
          }}
        >
          <Ionicons
            name="information-circle"
            size={18}
            color="#0284C7"
            style={{ marginRight: 8, marginTop: 1 }}
          />
          <Text
            style={{
              fontSize: 11.5,
              color: '#0369A1',
              lineHeight: 16,
              flex: 1,
              fontWeight: '400',
            }}
          >
            This is a declaration of cash payment. Your maintenance balance will be updated only
            after admin verification.
          </Text>
        </View>

        {/* Submit Cash Payment Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#F57C00',
            borderRadius: 14,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#F57C00',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.28,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
          ) : null}
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: '700',
              marginRight: 6,
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Cash Payment'}
          </Text>
          {!isSubmitting && <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>

      {/* 2. Card: How It Works */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 22,
          padding: 18,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#F1F5F9',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <Text
          style={{
            fontSize: 16.5,
            fontWeight: '800',
            color: '#0F172A',
            letterSpacing: -0.3,
            marginBottom: 16,
          }}
        >
          How It Works
        </Text>

        {/* Step 1: You declare the payment */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingVertical: 10,
          }}
        >
          {/* Step Number Circle */}
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: '#FFF3E8',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
              marginTop: 4,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#EA580C' }}>1</Text>
          </View>

          {/* Icon Badge */}
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: '#FFF8F1',
              borderWidth: 1,
              borderColor: '#FED7AA',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Ionicons name="wallet-outline" size={19} color="#EA580C" />
          </View>

          {/* Text Content */}
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text
              style={{
                fontSize: 13.5,
                fontWeight: '700',
                color: '#0F172A',
              }}
            >
              You declare the payment
            </Text>
            <Text
              style={{
                fontSize: 11.5,
                color: '#64748B',
                lineHeight: 16,
                marginTop: 2,
              }}
            >
              Enter the amount you paid in cash to the admin and submit the request.
            </Text>
          </View>

          {/* Badge: PENDING */}
          <View
            style={{
              backgroundColor: '#FEF3C7',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
              marginTop: 2,
            }}
          >
            <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#D97706' }}>PENDING</Text>
          </View>
        </View>

        {/* Step 2: Admin reviews the request */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingVertical: 10,
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: '#FFF3E8',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
              marginTop: 4,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#EA580C' }}>2</Text>
          </View>

          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: '#FFF8F1',
              borderWidth: 1,
              borderColor: '#FED7AA',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Ionicons name="clipboard-outline" size={19} color="#EA580C" />
          </View>

          <View style={{ flex: 1, marginRight: 8 }}>
            <Text
              style={{
                fontSize: 13.5,
                fontWeight: '700',
                color: '#0F172A',
              }}
            >
              Admin reviews the request
            </Text>
            <Text
              style={{
                fontSize: 11.5,
                color: '#64748B',
                lineHeight: 16,
                marginTop: 2,
              }}
            >
              The admin checks and confirms if the money was actually received.
            </Text>
          </View>

          {/* Badge: IN REVIEW */}
          <View
            style={{
              backgroundColor: '#E0F2FE',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
              marginTop: 2,
            }}
          >
            <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#0284C7' }}>IN REVIEW</Text>
          </View>
        </View>

        {/* Step 3: Verified or rejected */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingVertical: 10,
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: '#FFF3E8',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
              marginTop: 4,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#EA580C' }}>3</Text>
          </View>

          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: '#FFF8F1',
              borderWidth: 1,
              borderColor: '#FED7AA',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Ionicons name="checkmark-circle-outline" size={19} color="#EA580C" />
          </View>

          <View style={{ flex: 1, marginRight: 8 }}>
            <Text
              style={{
                fontSize: 13.5,
                fontWeight: '700',
                color: '#0F172A',
              }}
            >
              Verified or rejected
            </Text>
            <Text
              style={{
                fontSize: 11.5,
                color: '#64748B',
                lineHeight: 16,
                marginTop: 2,
              }}
            >
              If verified, your maintenance balance will be updated. If rejected, the request will be
              cancelled.
            </Text>
          </View>

          {/* Badge: VERIFIED / REJECTED */}
          <View
            style={{
              backgroundColor: '#DCFCE7',
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
              marginTop: 2,
            }}
          >
            <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#16A34A' }}>
              VERIFIED / REJECTED
            </Text>
          </View>
        </View>

        {/* Step 4: Balance gets updated */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingVertical: 10,
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: '#FFF3E8',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
              marginTop: 4,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#EA580C' }}>4</Text>
          </View>

          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: '#FFF8F1',
              borderWidth: 1,
              borderColor: '#FED7AA',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Ionicons name="calendar-outline" size={19} color="#EA580C" />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 13.5,
                fontWeight: '700',
                color: '#0F172A',
              }}
            >
              Balance gets updated
            </Text>
            <Text
              style={{
                fontSize: 11.5,
                color: '#64748B',
                lineHeight: 16,
                marginTop: 2,
              }}
            >
              A verified cash payment will be allocated to your maintenance dues as per the rules.
            </Text>
          </View>
        </View>

        {/* Bottom Tip in Card 2 */}
        <View
          style={{
            backgroundColor: '#EFF6FF',
            borderColor: '#BAE6FD',
            borderWidth: 1,
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 14,
          }}
        >
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#0284C7"
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              fontSize: 11.5,
              color: '#0369A1',
              lineHeight: 16,
              flex: 1,
              fontWeight: '400',
            }}
          >
            Keep your payment receipt or screenshot for reference (optional).
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
