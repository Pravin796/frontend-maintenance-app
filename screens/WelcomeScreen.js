import { Text, View, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import PrimaryButton from '../src/components/PrimaryButton';

export default function WelcomeScreen({ navigation, onNavigateLogin, onNavigateRegister }) {
  const handleLoginPress = () => {
    if (onNavigateLogin) {
      onNavigateLogin();
    } else if (navigation) {
      navigation.navigate('Login');
    }
  };

  const handleRegisterPress = () => {
    if (onNavigateRegister) {
      onNavigateRegister();
    } else if (navigation) {
      navigation.navigate('Register');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9F6' }}>
      <StatusBar style="light" />

      {/* Top Gradient Section: flex: 1 ensures it fills all available screen height */}
      <LinearGradient
        colors={['#FF6F00', '#FF8500', '#F57C00', '#E65100']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={{
          flex: 1,
          paddingTop: 48,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Header content: Icon + Title + Subtitle */}
        <View style={{ alignItems: 'center', paddingHorizontal: 24, marginTop: 70 }}>
          <Image
            source={require('../assets/icon.png')}
            style={{
              width: 86,
              height: 86,
              borderRadius: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.2,
              shadowRadius: 10,
            }}
            resizeMode="contain"
          />

          <Text style={{ fontSize: 28, fontWeight: '800', color: '#ffffff', textAlign: 'center', marginTop: 12, marginBottom: 4, letterSpacing: -0.5 }}>
            Radhika Residency
          </Text>

          <Text style={{ fontSize: 14, fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center' }}>
            Manage maintenance and payments in one place.
          </Text>
        </View>

        {/* Bottom group of the gradient: Building + Wave directly connected with no gap */}
        <View style={{ width: '100%', alignItems: 'center' }}>
          <Image
            source={require('../assets/building.png')}
            style={{
              width: '100%',
              height: 260,
              marginBottom: -18,
              zIndex: 2,
            }}
            resizeMode="contain"
          />

          {/* Smooth Organic Wavy Curve */}
          <View style={{ width: '100%', height: 48, overflow: 'hidden' }}>
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 375 48"
              preserveAspectRatio="none"
            >
              <Path
                d="M 0,20 C 95,48 190,50 280,30 C 320,21 355,18 375,20 L 375,48 L 0,48 Z"
                fill="#FAF9F6"
              />
            </Svg>
          </View>
        </View>
      </LinearGradient>

      {/* Bottom Sheet Section */}
      <View
        style={{
          backgroundColor: '#FAF9F6',
          paddingHorizontal: 24,
          paddingTop: 38,
          paddingBottom: 90,
        }}
      >
        {/* Primary Login Button */}
        <PrimaryButton
          title="Login"
          onPress={handleLoginPress}
          iconName="arrow-forward"
          style={{ borderRadius: 18, marginBottom: 13 }}
        />

        {/* Footer Link to Register */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#6B7280', fontSize: 14 }}>Don{"'"}t have an account? </Text>
          <TouchableOpacity onPress={handleRegisterPress}>
            <Text style={{ color: '#F57C00', fontWeight: 'bold', fontSize: 14 }}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
