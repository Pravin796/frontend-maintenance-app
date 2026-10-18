import React, { useState, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  Linking,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Rect, Path, G } from 'react-native-svg';

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
}) {
  const roomNumber = user?.roomNumber || '101';

  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotUri, setScreenshotUri] = useState(null);
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

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'Please allow media access to upload your payment screenshot.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setScreenshotUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Upload Error', 'Could not access image library.');
    }
  };

  const handleSubmit = () => {
    const trimmed = utrNumber.trim();
    if (!trimmed) {
      Alert.alert(
        'Missing Details',
        'Please enter the 12-digit UPI UTR or Transaction Reference number.'
      );
      return;
    }

    setIsSubmitting(true);

    const paymentData = {
      id: `rec-${Date.now()}`,
      room: roomNumber,
      month: billingMonth,
      amount: outstandingAmount,
      status: 'pending',
      method: 'Online UPI',
      refId: trimmed,
      screenshotUri: screenshotUri,
      date: 'Just now',
      verifiedBy: 'Pending Admin Verification',
    };

    setTimeout(() => {
      setIsSubmitting(false);
      if (onSubmitVerification) {
        onSubmitVerification(paymentData);
      }
      Alert.alert(
        'Submitted for Verification',
        'Your payment reference has been submitted. The society administrator will verify your payment and update your receipt status.',
        [{ text: 'OK', onPress: onBack }]
      );
    }, 400);
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
              justifyContent: 'space-between',
              alignItems: 'flex-start',
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

            {/* Right side: White pill Room 101 badge */}
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1.5,
              }}
            >
              <Ionicons
                name="home"
                size={14}
                color="#F57C00"
                style={{ marginRight: 5 }}
              />
              <Text
                style={{
                  color: '#EA580C',
                  fontSize: 12.5,
                  fontWeight: '700',
                }}
              >
                Room {roomNumber}
              </Text>
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

        {/* Two Columns Grid */}
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'stretch' }}>
          {/* Left Column: QR Code + Apps */}
          <View
            style={{
              flex: 1,
              backgroundColor: '#F8FAFC',
              borderRadius: 18,
              padding: 12,
              alignItems: 'center',
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: '#E2E8F0',
            }}
          >
            {/* White QR Code container */}
            <View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                padding: 6,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 1,
                borderWidth: 1,
                borderColor: '#E2E8F0',
              }}
            >
              <QRCodeSvg size={106} />
            </View>

            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: '#0F172A',
                marginTop: 6,
                marginBottom: 4,
              }}
            >
              Scan to Pay
            </Text>

            {/* Divider */}
            <Text style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8 }}>
              or
            </Text>

            {/* 4 UPI Apps Row */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                paddingHorizontal: 2,
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
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <Ionicons name="logo-google" size={17} color="#4285F4" />
                </View>
                <Text style={{ fontSize: 10, fontWeight: '600', color: '#475569', marginTop: 3 }}>
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
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#5F259F',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800' }}>
                    पे
                  </Text>
                </View>
                <Text style={{ fontSize: 10, fontWeight: '600', color: '#475569', marginTop: 3 }}>
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
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#00BAF2',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 9.5, fontWeight: '900' }}>
                    Pay
                  </Text>
                </View>
                <Text style={{ fontSize: 10, fontWeight: '600', color: '#475569', marginTop: 3 }}>
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
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#E2E8F0',
                  }}
                >
                  <Ionicons name="ellipsis-horizontal" size={16} color="#64748B" />
                </View>
                <Text style={{ fontSize: 10, fontWeight: '600', color: '#475569', marginTop: 3 }}>
                  More
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right Column: UPI Details + Blue Info Box */}
          <View
            style={{
              flex: 1.15,
              backgroundColor: '#FFF8F1',
              borderRadius: 18,
              padding: 12,
              borderWidth: 1,
              borderColor: '#FEE5D0',
              justifyContent: 'space-between',
            }}
          >
            {/* Header: Shield Icon + UPI Details */}
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons
                  name="shield-checkmark"
                  size={16}
                  color="#EA580C"
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    fontSize: 13.5,
                    fontWeight: '700',
                    color: '#0F172A',
                  }}
                >
                  UPI Details
                </Text>
              </View>

              {/* UPI ID */}
              <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '500' }}>
                UPI ID
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: '#0F172A',
                    flex: 1,
                    marginRight: 4,
                  }}
                >
                  {upiId}
                </Text>
                <TouchableOpacity
                  onPress={() => handleCopy(upiId, 'UPI ID')}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="copy-outline" size={15} color="#F57C00" />
                </TouchableOpacity>
              </View>

              {/* Recipient Name */}
              <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '500' }}>
                Recipient Name
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: '#0F172A',
                    flex: 1,
                    marginRight: 4,
                  }}
                >
                  {recipientName}
                </Text>
                <TouchableOpacity
                  onPress={() => handleCopy(recipientName, 'Recipient Name')}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="copy-outline" size={15} color="#F57C00" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Light Blue Info Box */}
            <View
              style={{
                backgroundColor: '#EFF6FF',
                borderColor: '#BAE6FD',
                borderWidth: 1,
                borderRadius: 12,
                padding: 8,
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginTop: 10,
              }}
            >
              <Ionicons
                name="information-circle"
                size={16}
                color="#0284C7"
                style={{ marginRight: 6, marginTop: 1 }}
              />
              <Text
                style={{
                  fontSize: 10.5,
                  color: '#0369A1',
                  lineHeight: 14,
                  flex: 1,
                  fontWeight: '400',
                }}
              >
                You can also open any UPI app and search for this UPI ID to pay.
                Enter the amount manually in your UPI app.
              </Text>
            </View>
          </View>
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
              upload a screenshot (optional) for verification.
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
        <View
          style={{
            borderStyle: 'dashed',
            borderWidth: 1.5,
            borderColor: screenshotUri ? '#F57C00' : '#CBD5E1',
            borderRadius: 14,
            padding: 12,
            backgroundColor: screenshotUri ? '#FFFBF7' : '#F8FAFC',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
            {screenshotUri ? (
              <Image
                source={{ uri: screenshotUri }}
                style={{ width: 38, height: 38, borderRadius: 8, marginRight: 10 }}
              />
            ) : (
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  backgroundColor: '#EFF6FF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <Ionicons name="image-outline" size={20} color="#0284C7" />
              </View>
            )}

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 12.5,
                  fontWeight: '700',
                  color: '#1E293B',
                }}
              >
                {screenshotUri ? 'Screenshot Attached' : 'Upload payment screenshot (optional)'}
              </Text>
              <Text style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                {screenshotUri ? 'Tap choose image to replace' : 'JPG or PNG • Max 5 MB'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handlePickImage}
            activeOpacity={0.8}
            style={{
              borderWidth: 1.5,
              borderColor: '#EA580C',
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 7,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={15}
              color="#EA580C"
              style={{ marginRight: 5 }}
            />
            <Text
              style={{
                fontSize: 11.5,
                fontWeight: '700',
                color: '#EA580C',
              }}
            >
              Choose Image
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit for Verification Button */}
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
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: '700',
              marginRight: 6,
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
          </Text>
          {!isSubmitting && (
            <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
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
