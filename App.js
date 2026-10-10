import './global.css';
import { StatusBar } from 'expo-status-bar';
import { Text, View, SafeAreaView } from 'react-native';

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 items-center justify-center p-6">
        <View className="w-24 h-24 bg-blue-600 rounded-3xl items-center justify-center mb-8 shadow-sm">
          <Text className="text-white text-4xl font-bold">RM</Text>
        </View>

        <Text className="text-3xl font-extrabold text-slate-900 text-center mb-3">
          Residency Maintenance
        </Text>

        <Text className="text-base text-slate-500 text-center mb-10 leading-6 px-4">
          Manage maintenance and payments in one place.
        </Text>

        <View className="w-full">
          <View className="bg-white p-5 rounded-2xl flex-row items-center mb-4 shadow-sm border border-slate-100">
            <View className="w-12 h-12 bg-indigo-100 rounded-xl mr-4" />
            <View className="flex-1">
              <Text className="text-slate-800 font-semibold text-lg">Maintenance</Text>
              <Text className="text-slate-500 text-sm mt-1">Submit and track requests</Text>
            </View>
          </View>

          <View className="bg-white p-5 rounded-2xl flex-row items-center shadow-sm border border-slate-100">
            <View className="w-12 h-12 bg-emerald-100 rounded-xl mr-4" />
            <View className="flex-1">
              <Text className="text-slate-800 font-semibold text-lg">Payments</Text>
              <Text className="text-slate-500 text-sm mt-1">Secure rent & fees</Text>
            </View>
          </View>
        </View>

        <StatusBar style="dark" />
      </View>
    </SafeAreaView>
  );
}
