import './global.css';
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import { Asset } from 'expo-asset';
import { authService } from './src/services/authService';

const Stack = createNativeStackNavigator();

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const navigationRef = useRef(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Pre-cache core image assets concurrently with session restoration
        await Promise.allSettled([
          Asset.loadAsync([
            require('./assets/icon.png'),
            require('./assets/building.png'),
          ]),
          (async () => {
            const token = await authService.getStoredToken();
            const user = await authService.getCurrentUser();
            if (token && user) {
              setCurrentUser(user);
            }
          })(),
        ]);
      } catch {
        // Continue even if pre-cache throws
      } finally {
        setIsRestoringSession(false);
      }
    };

    initializeApp();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue clearing local state
    }
    setCurrentUser(null);
    if (navigationRef.current) {
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    }
  };

  if (isRestoringSession) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAF9F6', alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#F57C00" />
      </SafeAreaView>
    );
  }

  const initialRoute = currentUser
    ? currentUser.mustChangePassword
      ? 'ChangePassword'
      : 'Dashboard'
    : 'Welcome';

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 220,
          gestureEnabled: true,
          freezeOnBlur: true,
          contentStyle: { backgroundColor: '#FAF9F6' },
        }}
      >
        <Stack.Screen name="Welcome">
          {(props) => (
            <WelcomeScreen
              {...props}
              onNavigateLogin={() => props.navigation.navigate('Login')}
              onNavigateRegister={() => props.navigation.navigate('Register')}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen
              {...props}
              onLogin={(userData) => {
                const user = {
                  userId: userData.userId,
                  roomNumber: userData.roomNumber,
                  mobileNumber: userData.mobileNumber,
                  role: userData.role,
                  mustChangePassword: userData.mustChangePassword,
                };
                setCurrentUser(user);
                if (userData.mustChangePassword) {
                  props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'ChangePassword' }],
                  });
                } else {
                  props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Dashboard' }],
                  });
                }
              }}
              onNavigateRegister={() => props.navigation.navigate('Register')}
              onNavigateChangePassword={() => props.navigation.navigate('ChangePassword')}
              onBack={() => props.navigation.goBack()}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Register">
          {(props) => (
            <RegisterScreen
              {...props}
              onNavigateLogin={() => props.navigation.navigate('Login')}
              onBack={() => props.navigation.goBack()}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="ChangePassword">
          {(props) => (
            <ChangePasswordScreen
              {...props}
              user={currentUser}
              isForced={Boolean(currentUser?.mustChangePassword)}
              onSuccess={(updatedUser) => {
                const nextUser = updatedUser || (currentUser ? { ...currentUser, mustChangePassword: false } : null);
                setCurrentUser(nextUser);
                if (nextUser) {
                  props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Dashboard' }],
                  });
                } else {
                  props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                }
              }}
              onCancel={() => {
                if (currentUser && !currentUser.mustChangePassword) {
                  props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Dashboard' }],
                  });
                } else {
                  props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                }
              }}
              onLogout={handleLogout}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Dashboard">
          {(props) => (
            <DashboardScreen
              {...props}
              user={currentUser}
              onLogout={handleLogout}
              onChangePassword={() => props.navigation.navigate('ChangePassword')}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
