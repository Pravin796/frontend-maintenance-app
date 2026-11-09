import { Alert, Platform } from 'react-native';

/**
 * Cross-platform confirmation dialog
 * Solves React Native Web ignoring Alert.alert button handlers
 */
export const confirmAction = (title, message, onConfirm, confirmText = 'OK') => {
  if (Platform.OS === 'web') {
    const text = [title, message].filter(Boolean).join('\n\n');
    const ok = typeof window !== 'undefined' && window.confirm ? window.confirm(text) : true;
    if (ok && onConfirm) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ]);
  }
};

/**
 * Cross-platform informational alert
 */
export const showAlert = (title, message, onOk) => {
  if (Platform.OS === 'web') {
    const text = [title, message].filter(Boolean).join('\n\n');
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(text);
    }
    if (onOk) onOk();
  } else {
    Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
  }
};

