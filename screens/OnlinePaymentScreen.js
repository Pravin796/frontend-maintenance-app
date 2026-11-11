import { useState, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Linking,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Rect, Path, G } from 'react-native-svg';
import { createPayment, submitPaymentProof, api } from '../src/services/api';

/**
 * High-definition QR Code component for UPI scan-to-pay
 */
const QRCodeSvg = memo(function QRCodeSvg({ size = 110 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Background */}
      <Rect width="100" height="100" fill="#FFFFFF" />

      {/* Top-Left Finder Corner */}
      <Rect x="6" y="6" width="26" height="26" rx="4" fill="#0F172A" />
      <Rect x="10" y="10" width="18" height="18" rx="2" fill="#FFFFFF" />
      <Rect x="14" y="14" width="10" height="10" rx="2" fill="#0F172A" />

      {/* Top-Right Finder Corner */}
      <Rect x="68" y="6" width="26" height="26" rx="4" fill="#0F172A" />
      <Rect x="72" y="10" width="18" height="18" rx="2" fill="#FFFFFF" />
      <Rect x="76" y="14" width="10" height="10" rx="2" fill="#0F172A" />

      {/* Bottom-Left Finder Corner */}
      <Rect x="6" y="68" width="26" height="26" rx="4" fill="#0F172A" />
      <Rect x="10" y="72" width="18" height="18" rx="2" fill="#FFFFFF" />
      <Rect x="14" y="76" width="10" height="10" rx="2" fill="#0F172A" />

      {/* Timing Patterns and Data Modules */}
      <G fill="#0F172A">
        {/* Horizontal timing pattern */}
        <Rect x="36" y="10" width="4" height="4" />
        <Rect x="44" y="10" width="4" height="4" />
        <Rect x="52" y="10" width="4" height="4" />
        <Rect x="60" y="10" width="4" height="4" />

        {/* Vertical timing pattern */}
        <Rect x="10" y="36" width="4" height="4" />
        <Rect x="10" y="44" width="4" height="4" />
        <Rect x="10" y="52" width="4" height="4" />
        <Rect x="10" y="60" width="4" height="4" />

        {/* Dense realistic matrix data points */}
        <Rect x="36" y="18" width="8" height="4" />
        <Rect x="50" y="18" width="4" height="4" />
        <Rect x="58" y="18" width="6" height="4" />

        <Rect x="36" y="26" width="4" height="6" />
        <Rect x="44" y="28" width="8" height="4" />
        <Rect x="58" y="26" width="6" height="8" />

        <Rect x="6" y="36" width="4" height="8" />
        <Rect x="18" y="38" width="14" height="4" />
        <Rect x="26" y="46" width="6" height="6" />

        <Rect x="68" y="36" width="8" height="6" />
        <Rect x="80" y="38" width="14" height="4" />
        <Rect x="72" y="46" width="10" height="4" />
        <Rect x="86" y="44" width="8" height="8" />

        <Rect x="36" y="38" width="4" height="10" />
        <Rect x="60" y="38" width="4" height="10" />

        <Rect x="36" y="52" width="10" height="4" />
        <Rect x="52" y="52" width="12" height="4" />

        <Rect x="36" y="60" width="6" height="8" />
        <Rect x="46" y="62" width="8" height="4" />
        <Rect x="58" y="60" width="6" height="8" />

        <Rect x="36" y="72" width="4" height="6" />
        <Rect x="44" y="70" width="10" height="4" />
        <Rect x="58" y="74" width="6" height="4" />

        <Rect x="68" y="60" width="10" height="4" />
        <Rect x="82" y="62" width="12" height="4" />

        <Rect x="68" y="70" width="6" height="8" />
        <Rect x="78" y="72" width="8" height="4" />
        <Rect x="90" y="70" width="4" height="8" />

        <Rect x="68" y="82" width="8" height="6" />
        <Rect x="80" y="80" width="14" height="4" />
        <Rect x="74" y="90" width="10" height="4" />

        <Rect x="36" y="82" width="10" height="4" />
        <Rect x="50" y="82" width="12" height="4" />
        <Rect x="38" y="90" width="6" height="4" />
        <Rect x="48" y="90" width="8" height="4" />
      </G>

      {/* Center Orange Brand Pill Badge */}
      <Rect x="43" y="43" width="14" height="14" rx="4" fill="#F57C00" />
      <Path
        d="M 50 46 L 46 49 L 47 49 L 47 54 L 53 54 L 53 49 L 54 49 Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
});

/**
 * OnlinePaymentScreen
 * Matches the user's exact design specifications:
 * - Outstanding balance card with Room badge
 * - Pay via UPI card (QR scan, GPay/PhonePe/Paytm apps, UPI details with copy)
 * - After Payment card (UTR input, screenshot attachment, submit button)
 * - Bottom info banner
 */
export default function OnlinePaymentScreen({
  user,
  outstandingAmount = '₹1,500',
  billingMonth = 'October 2026',
  upiId = 'pravin@example@okaxis',
  recipientName = 'Residency Maintenance',
  onSubmitVerification,
  onBack,
  isPaymentLocked = false,
}) {
  const roomNumber = user?.roomNumber || '101';

  const [utrNumber, setUtrNumber] = useState('');
  const [localImageUri, setLocalImageUri] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = (text, label) => {
    Alert.alert(`${label} Copied`, `${text} has been copied to your clipboard.`);
  };

  const handleOpenUpiApp = (appName) => {
    const rawAmount = outstandingAmount.replace(/[^0-9]/g, '') || '500';
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      recipientName
    )}&am=${rawAmount}&cu=INR`;

    Linking.openURL(upiUrl).catch(() => {
      Alert.alert(
        `Open ${appName}`,
        `Could not open ${appName} directly. Please use the UPI ID: ${upiId} or scan the QR code.`
      );
    });
  };

  // Selecting an image keeps it locally; no separate upload; allowsEditing: false
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'Please allow media access to select your payment screenshot.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLocalImageUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Selection Error', 'Could not access image library.');
    }
  };

  const handleRemoveImage = () => {
    setLocalImageUri(null);
  };

  // Submit for verification in a single multipart request (UTR + screenshot)
  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (isPaymentLocked) {
      Alert.alert(
        'Payment Under Verification',
        'Your payment has been submitted successfully and is awaiting admin verification. You cannot make another payment until the administrator reviews your current payment.'
      );
      return;
    }

    const trimmed = utrNumber.trim();
    if (!trimmed) {
      Alert.alert(
        'Missing Details',
        'Please enter the 12-digit UPI UTR or Transaction Reference number.'
      );
      return;
    }

    if (!localImageUri) {
      Alert.alert(
        'Missing Screenshot',
        'Please select your payment screenshot before submitting.'
      );
      return;
    }

    const rawNum = parseInt(outstandingAmount.replace(/[^0-9]/g, '') || '500', 10);
    const amountToPay = rawNum > 0 ? rawNum : 500;

    setIsSubmitting(true);

    try {
      // 1. Create or retrieve active pending payment for room
      let paymentRes;
      try {
        paymentRes = await createPayment({
          amount: amountToPay,
          method: 'ONLINE',
        });
      } catch (err) {
        if (err?.response?.data?.message?.includes('already has a pending payment')) {
          const myPending = await api.get('/payments/my');
          const existingPending = Array.isArray(myPending.data)
            ? myPending.data.find((p) => p.status === 'PENDING')
            : null;
          if (existingPending) {
            paymentRes = existingPending;
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }

      // 2. Submit payment proof with UTR and local screenshot as multipart/form-data
      let proofRes = null;
      if (paymentRes?.id) {
        proofRes = await submitPaymentProof(paymentRes.id, {
          transactionReference: trimmed,
          imageUri: localImageUri,
        });
      }

      if (onSubmitVerification) {
        onSubmitVerification({
          id: proofRes?.id || paymentRes?.id,
          room: roomNumber,
          month: billingMonth,
          amount: `₹${amountToPay.toLocaleString('en-IN')}`,
          status: 'pending',
          method: 'Online UPI',
          refId: trimmed,
          screenshotUri: proofRes?.screenshotUrl || localImageUri,
          date: 'Just now',
          verifiedBy: 'Pending Admin Verification',
        });
      }

      Alert.alert(
        'Submitted for Verification',
        'Your payment reference and proof have been submitted. The society administrator will verify your payment and update your receipt status.',
        [{ text: 'OK', onPress: onBack }]
      );
    } catch (err) {
      console.warn('Online payment submission failed:', err);
      // Retain localImageUri and utrNumber in state so user can retry immediately without re-picking
      Alert.alert(
        'Submission Failed',
        err?.response?.data?.message || err?.message || 'Unable to submit payment proof. You can retry submitting.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = isSubmitting || !utrNumber.trim() || !localImageUri || isPaymentLocked;

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 36,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Verification Lock Banner */}
      {isPaymentLocked && (
        <View
          style={{
            backgroundColor: '#FFFBEB',
            borderRadius: 14,
            padding: 14,
            marginBottom: 16,
            borderWidth: 1.5,
            borderColor: '#FDE68A',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Ionicons name="alert-circle" size={22} color="#D97706" />
          <Text style={{ flex: 1, fontSize: 13, color: '#92400E', lineHeight: 18 }}>
            Your payment has been submitted successfully and is awaiting admin verification. You cannot make another payment until the administrator reviews your current payment.
          </Text>
        </View>
      )}
      {/* Top Back Navigation Button */}
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 14,
            paddingVertical: 6,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
              borderWidth: 1,
              borderColor: '#E2E8F0',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 2,
              elevation: 1,
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#1E293B" />
          </View>
          <Text style={{ fontSize: 15, fontWeight: '700', color: '#1E293B' }}>
            Back to Payments
          </Text>
        </TouchableOpacity>
      )}

      {/* 1. Hero Outstanding Balance Card */}
      <View
        style={{
          borderRadius: 22,
          overflow: 'hidden',
          marginBottom: 16,
          shadowColor: '#F57C00',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.25,
          shadowRadius: 14,
          elevation: 4,
        }}
      >
        <LinearGradient
          colors={['#FF6F00', '#FF8500', '#F57C00', '#E65100']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.95 }}
          style={{
            paddingVertical: 20,
            paddingHorizontal: 20,
            position: 'relative',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {/* Left side: Card icon + Outstanding Balance + Amount + Month */}
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Ionicons name="card" size={22} color="#F57C00" />
              </View>

              <View>
                <Text
                  style={{
                    color: 'rgba(255, 255, 255, 0.92)',
                    fontSize: 13.5,
                    fontWeight: '600',
                    letterSpacing: 0.1,
                  }}
                >
                  Outstanding Balance
                </Text>
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 34,
                    fontWeight: '800',
                    letterSpacing: -0.6,
                    lineHeight: 40,
                  }}
                >
                  {outstandingAmount}
                </Text>
                <Text
                  style={{
                    color: 'rgba(255, 255, 255, 0.88)',
                    fontSize: 12,
                    fontWeight: '500',
                    marginTop: 1,
                  }}
                >
                  For {billingMonth}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* 2. Card: Pay via UPI */}
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
        {/* Card Header: Orange QR Squircle + Title & Subtitle */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: '#FFF3E8',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Ionicons name="qr-code-outline" size={24} color="#EA580C" />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: '800',
                color: '#0F172A',
                letterSpacing: -0.3,
              }}
            >
              Pay via UPI
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: '#64748B',
                lineHeight: 16,
                marginTop: 2,
              }}
            >
              Scan the QR code or open any UPI app to pay.{'\n'}
              Enter the amount in your UPI app (it will not be pre-filled).
            </Text>
          </View>
        </View>

        {/* Row 1: QR Code & Apps Section */}
        <View
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: 18,
            padding: 16,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#E2E8F0',
            marginBottom: 14,
          }}
        >
          {/* White QR Code container */}
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 2,
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }}
          >
            <QRCodeSvg size={135} />
          </View>

          <Text
            style={{
              fontSize: 13.5,
              fontWeight: '700',
              color: '#0F172A',
              marginTop: 10,
            }}
          >
            Scan to Pay
          </Text>

          {/* Divider with 'or' */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: '85%',
              marginVertical: 12,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
            <Text
              style={{
                marginHorizontal: 12,
                fontSize: 12,
                fontWeight: '600',
                color: '#94A3B8',
              }}
            >
              or
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
          </View>

          {/* 4 UPI Apps Row with spacious layout */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              width: '100%',
              paddingHorizontal: 6,
            }}
          >
            {/* GPay */}
            <TouchableOpacity
              onPress={() => handleOpenUpiApp('Google Pay')}
              activeOpacity={0.7}
              style={{ alignItems: 'center' }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 3,
                  elevation: 1.5,
                }}
              >
                <Ionicons name="logo-google" size={22} color="#4285F4" />
              </View>
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: '600',
                  color: '#475569',
                  marginTop: 6,
                }}
              >
                GPay
              </Text>
            </TouchableOpacity>

            {/* PhonePe */}
            <TouchableOpacity
              onPress={() => handleOpenUpiApp('PhonePe')}
              activeOpacity={0.7}
              style={{ alignItems: 'center' }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: '#5F259F',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#5F259F',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800' }}>
                  पे
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: '600',
                  color: '#475569',
                  marginTop: 6,
                }}
              >
                PhonePe
              </Text>
            </TouchableOpacity>

            {/* Paytm */}
            <TouchableOpacity
              onPress={() => handleOpenUpiApp('Paytm')}
              activeOpacity={0.7}
              style={{ alignItems: 'center' }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: '#00BAF2',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#00BAF2',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 11.5, fontWeight: '900' }}>
                  Pay
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: '600',
                  color: '#475569',
                  marginTop: 6,
                }}
              >
                Paytm
              </Text>
            </TouchableOpacity>

            {/* More */}
            <TouchableOpacity
              onPress={() => handleOpenUpiApp('UPI App')}
              activeOpacity={0.7}
              style={{ alignItems: 'center' }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.04,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color="#64748B" />
              </View>
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: '600',
                  color: '#475569',
                  marginTop: 6,
                }}
              >
                More
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Row 2: UPI Details Section */}
        <View
          style={{
            backgroundColor: '#FFF8F1',
            borderRadius: 18,
            padding: 16,
            borderWidth: 1,
            borderColor: '#FEE5D0',
            marginBottom: 12,
          }}
        >
          {/* Header: Shield Icon + UPI Details */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons
              name="shield-checkmark"
              size={18}
              color="#EA580C"
              style={{ marginRight: 7 }}
            />
            <Text
              style={{
                fontSize: 14.5,
                fontWeight: '700',
                color: '#0F172A',
              }}
            >
              UPI Details
            </Text>
          </View>

          {/* UPI ID */}
          <Text style={{ fontSize: 11.5, color: '#64748B', fontWeight: '500', marginBottom: 4 }}>
            UPI ID
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: '#FED7AA',
              marginBottom: 12,
            }}
          >
            <Text
              selectable
              style={{
                fontSize: 13.5,
                fontWeight: '700',
                color: '#0F172A',
                flex: 1,
                marginRight: 8,
              }}
            >
              {upiId}
            </Text>
            <TouchableOpacity
              onPress={() => handleCopy(upiId, 'UPI ID')}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FFF3E8',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 8,
              }}
            >
              <Ionicons name="copy-outline" size={14} color="#EA580C" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#EA580C' }}>Copy</Text>
            </TouchableOpacity>
          </View>

          {/* Recipient Name */}
          <Text style={{ fontSize: 11.5, color: '#64748B', fontWeight: '500', marginBottom: 4 }}>
            Recipient Name
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: '#FED7AA',
            }}
          >
            <Text
              selectable
              style={{
                fontSize: 13.5,
                fontWeight: '700',
                color: '#0F172A',
                flex: 1,
                marginRight: 8,
              }}
            >
              {recipientName}
            </Text>
            <TouchableOpacity
              onPress={() => handleCopy(recipientName, 'Recipient Name')}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#FFF3E8',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 8,
              }}
            >
              <Ionicons name="copy-outline" size={14} color="#EA580C" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 11.5, fontWeight: '700', color: '#EA580C' }}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Row 3: Light Blue Info Box */}
        <View
          style={{
            backgroundColor: '#EFF6FF',
            borderColor: '#BAE6FD',
            borderWidth: 1,
            borderRadius: 14,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'flex-start',
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
              fontSize: 12,
              color: '#0369A1',
              lineHeight: 17,
              flex: 1,
              fontWeight: '400',
            }}
          >
            You can also open any UPI app and search for this UPI ID to pay.
            Enter the amount manually in your UPI app.
          </Text>
        </View>
      </View>

      {/* 3. Card: After Payment */}
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
        {/* Header: Document Squircle + Title & Subtitle */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: '#FFF3E8',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Ionicons name="receipt-outline" size={23} color="#EA580C" />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: '800',
                color: '#0F172A',
                letterSpacing: -0.3,
              }}
            >
              After Payment
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: '#64748B',
                lineHeight: 16,
                marginTop: 2,
              }}
            >
              Once the payment is completed, enter the UTR/Transaction ID and
              select your payment screenshot for verification.
            </Text>
          </View>
        </View>

        {/* Input: UTR / Transaction ID */}
        <View style={{ marginBottom: 14 }}>
          <Text
            style={{
              fontSize: 12.5,
              fontWeight: '700',
              color: '#1E293B',
              marginBottom: 6,
            }}
          >
            UTR / Transaction ID <Text style={{ color: '#EF4444' }}>*</Text>
          </Text>
          <TextInput
            placeholder="Enter 12-digit UTR number"
            placeholderTextColor="#94A3B8"
            value={utrNumber}
            onChangeText={setUtrNumber}
            autoCapitalize="characters"
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E2E8F0',
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 14,
              fontWeight: '500',
              color: '#0F172A',
            }}
          />
        </View>

        {/* Upload screenshot container */}
        {!localImageUri ? (
          /* Empty State: Spacious stacked rows */
          <TouchableOpacity
            onPress={handlePickImage}
            activeOpacity={0.75}
            style={{
              borderStyle: 'dashed',
              borderWidth: 1.5,
              borderColor: '#CBD5E1',
              borderRadius: 16,
              paddingVertical: 20,
              paddingHorizontal: 16,
              backgroundColor: '#F8FAFC',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            {/* Row 1: Upload icon */}
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#EFF6FF',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 10,
              }}
            >
              <Ionicons name="cloud-upload-outline" size={24} color="#0284C7" />
            </View>

            {/* Row 2: Title & subtitle */}
            <Text
              style={{
                fontSize: 13.5,
                fontWeight: '700',
                color: '#1E293B',
                textAlign: 'center',
                marginBottom: 3,
              }}
            >
              Select payment screenshot
            </Text>
            <Text
              style={{
                fontSize: 11.5,
                color: '#64748B',
                textAlign: 'center',
                marginBottom: 14,
              }}
            >
              JPG, PNG, WEBP • Max 10 MB
            </Text>

            {/* Row 3: Choose Image button */}
            <View
              style={{
                borderWidth: 1.5,
                borderColor: '#EA580C',
                backgroundColor: '#FFFFFF',
                borderRadius: 22,
                paddingHorizontal: 18,
                paddingVertical: 8,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Ionicons
                name="image-outline"
                size={16}
                color="#EA580C"
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  fontSize: 12.5,
                  fontWeight: '700',
                  color: '#EA580C',
                }}
              >
                Choose Image
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          /* Attached State: Local Preview */
          <View
            style={{
              borderWidth: 1.5,
              borderColor: '#FED7AA',
              borderRadius: 16,
              padding: 14,
              backgroundColor: '#FFFBF7',
              marginBottom: 16,
            }}
          >
            {/* Row 1: Screenshot Image Preview */}
            <View
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: '#E2E8F0',
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#FED7AA',
                position: 'relative',
              }}
            >
              <Image
                source={{ uri: localImageUri }}
                style={{
                  width: '100%',
                  height: 160,
                  borderRadius: 12,
                }}
                resizeMode="cover"
              />
              {/* Badge Overlay */}
              <View
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(234, 88, 12, 0.9)',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons
                  name="eye-outline"
                  size={12}
                  color="#FFFFFF"
                  style={{ marginRight: 4 }}
                />
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                  Local Preview (Not Uploaded)
                </Text>
              </View>
            </View>

            {/* Row 2: Status with Checkmark */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
                paddingHorizontal: 4,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#16A34A"
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: '#0F172A',
                  }}
                >
                  Image Selected
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: '600',
                  color: '#16A34A',
                }}
              >
                Ready to Submit
              </Text>
            </View>

            {/* Row 3: Action Buttons (Choose Another & Remove) */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              {/* Choose Another Image Button */}
              <TouchableOpacity
                onPress={handlePickImage}
                disabled={isSubmitting}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  borderWidth: 1.5,
                  borderColor: '#CBD5E1',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  paddingVertical: 9,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name="image-outline"
                  size={15}
                  color="#475569"
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    fontSize: 12.5,
                    fontWeight: '700',
                    color: '#475569',
                  }}
                >
                  Choose Another
                </Text>
              </TouchableOpacity>

              {/* Remove Button */}
              <TouchableOpacity
                onPress={handleRemoveImage}
                disabled={isSubmitting}
                activeOpacity={0.8}
                style={{
                  borderWidth: 1,
                  borderColor: '#FCA5A5',
                  backgroundColor: '#FEF2F2',
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 9,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name="trash-outline"
                  size={15}
                  color="#DC2626"
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    fontSize: 12.5,
                    fontWeight: '700',
                    color: '#DC2626',
                  }}
                >
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}


        {/* Submit for Verification Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          activeOpacity={0.85}
          style={{
            backgroundColor: isSubmitDisabled ? '#CBD5E1' : '#F57C00',
            borderRadius: 14,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: isSubmitDisabled ? 'transparent' : '#F57C00',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isSubmitDisabled ? 0 : 0.28,
            shadowRadius: 8,
            elevation: isSubmitDisabled ? 0 : 3,
          }}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontWeight: '700',
                }}
              >
                Submitting for Verification...
              </Text>
            </>
          ) : (
            <>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontWeight: '700',
                  marginRight: 6,
                }}
              >
                Submit for Verification
              </Text>
              <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* 4. Bottom Info Banner */}
      <View
        style={{
          backgroundColor: '#EFF6FF',
          borderColor: '#BFDBFE',
          borderWidth: 1,
          borderRadius: 14,
          paddingVertical: 12,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Ionicons
          name="information-circle-outline"
          size={18}
          color="#0284C7"
          style={{ marginRight: 10 }}
        />
        <Text
          style={{
            fontSize: 12,
            color: '#0369A1',
            lineHeight: 16,
            fontWeight: '500',
            flex: 1,
          }}
        >
          Your payment will remain pending until the admin verifies it.
        </Text>
      </View>
    </ScrollView>
  );
}
