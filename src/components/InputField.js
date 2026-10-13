import React, { memo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const InputField = memo(function InputField({
  label,
  icon,
  iconColor = '#64748B',
  value,
  onChangeText,
  placeholder,
  placeholderTextColor = '#94A3B8',
  isPassword = false,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  editable = true,
  onFocus,
  onBlur,
  style,
  inputStyle,
  maxLength,
  multiline = false,
  returnKeyType,
  onSubmitEditing,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isSecure = isPassword ? !showPassword : secureTextEntry;

  return (
    <View
      style={[
        {
          backgroundColor: '#FFFFFF',
          borderColor: '#E8ECF2',
          borderWidth: 1.5,
          borderRadius: 18,
          paddingHorizontal: 16,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 14,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.02,
          shadowRadius: 3,
          elevation: 1,
        },
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={22}
          color={iconColor}
          style={{ marginRight: 12 }}
        />
      )}

      <View style={{ flex: 1 }}>
        {label ? (
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: '#334155',
              marginBottom: 2,
            }}
          >
            {label}
          </Text>
        ) : null}

        <TextInput
          style={[
            {
              color: '#1F2937',
              fontSize: 14.5,
              fontWeight: '500',
              padding: 0,
            },
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          keyboardType={keyboardType}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={autoCapitalize}
          editable={editable}
          secureTextEntry={isSecure}
          onFocus={onFocus}
          onBlur={onBlur}
          maxLength={maxLength}
          multiline={multiline}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
        />
      </View>

      {isPassword && (
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ paddingLeft: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
            size={22}
            color="#94A3B8"
          />
        </TouchableOpacity>
      )}
    </View>
  );
});

export default InputField;
