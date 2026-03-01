/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function AuthInput({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
}) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry;
  const borderColor = error
    ? '#EF4444'
    : isFocused
    ? theme.primary
    : theme.border;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.inputBg,
            borderColor,
          },
        ]}
      >
        <Feather
          name={icon}
          size={18}
          color={isFocused ? theme.primary : theme.textSecondary}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeBtn}
          >
            <Feather
              name={showPassword ? 'eye' : 'eye-off'}
              size={18}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
    outlineStyle: 'none',
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
