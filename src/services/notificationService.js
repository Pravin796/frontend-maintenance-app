import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { registerPushToken } from './api';

// Configure foreground notification behavior: alert, sound, badge
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Registers device for push notifications and sends token to backend API.
 * Safely handles physical devices vs simulators/emulators.
 */
export async function registerForPushNotificationsAsync() {
  let token = null;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#EA580C',
        sound: 'default',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[Push] Notification permissions not granted');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      token = tokenData?.data || null;

      if (token) {
        console.log('[Push] Obtained Expo Push Token:', token);
        await registerPushToken(token, Platform.OS);
        console.log('[Push] Successfully registered token with backend');
      }
    } else {
      console.log('[Push] Physical device required for remote Push Notifications');
    }
  } catch (err) {
    console.warn('[Push] Error in registerForPushNotificationsAsync:', err?.message || err);
  }

  return token;
}

