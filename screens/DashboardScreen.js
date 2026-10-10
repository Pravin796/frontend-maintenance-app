import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function DashboardScreen({ user, onLogout }) {
  const roleTitle = user?.role === 'ADMIN' ? 'Admin Dashboard' : 'Resident Dashboard';

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }}>
        <View className="mt-8 mb-8">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-3xl font-extrabold text-slate-900">Welcome</Text>
            {user?.role ? (
              <View className={`px-3 py-1 rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                <Text className={`font-bold text-xs ${user.role === 'ADMIN' ? 'text-purple-700' : 'text-blue-700'}`}>
                  {user.role}
                </Text>
              </View>
            ) : null}
          </View>
          <Text className="text-base text-slate-500">
            {roleTitle} {user?.roomNumber ? `• Room ${user.roomNumber}` : ''}
          </Text>
        </View>

        <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
          <View className="flex-row items-center mb-4">
            <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center mr-4">
              <Text className="text-blue-600 font-bold text-xl">₹</Text>
            </View>
            <View className="flex-1">
              <Text className="text-slate-500 text-sm mb-1">Monthly Maintenance</Text>
              <Text className="text-slate-900 font-bold text-2xl">₹500</Text>
            </View>
          </View>

          <View className="h-px bg-slate-100 my-4" />

          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-amber-100 rounded-xl items-center justify-center mr-4">
              <Text className="text-amber-600 font-bold text-xl">!</Text>
            </View>
            <View className="flex-1">
              <Text className="text-slate-500 text-sm mb-1">Outstanding Balance</Text>
              <Text className="text-slate-900 font-semibold text-lg">Not loaded</Text>
            </View>
          </View>
        </View>

        <View className="bg-blue-50 border border-blue-100 p-5 rounded-2xl mb-8">
          <Text className="text-blue-800 text-center leading-6">
            Actual maintenance details, payment history, and user information will appear after backend integration.
          </Text>
        </View>

        <View className="mt-auto">
          <TouchableOpacity
            className="bg-white border border-slate-200 rounded-2xl py-4 items-center"
            onPress={onLogout}
          >
            <Text className="text-slate-700 font-bold text-lg">Logout</Text>
          </TouchableOpacity>
        </View>
        <StatusBar style="dark" />
      </ScrollView>
    </SafeAreaView>
  );
}
