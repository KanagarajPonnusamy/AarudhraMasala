/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AuthInput from '../components/AuthInput';
import CountryCodePicker, { getDefaultCountry } from '../components/CountryCodePicker';

export default function RegisterScreen({ navigation }) {
  const { theme } = useTheme();
  const { register } = useAuth();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState(getDefaultCountry);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!form.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (form.phone.length < 10) {
      newErrors.phone = 'Enter a valid phone number';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setMessage(null);
    try {
      const prefix = countryCode?.code?.replace('+', '') || '91';
      await register({ ...form, phone: prefix + form.phone });
      setMessage({ type: 'success', text: 'Account created successfully! Redirecting to login...' });
      setTimeout(() => navigation.replace('Login'), 1500);
    } catch (e) {
      const errMsg =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.response?.data?.status ||
        (typeof e.response?.data === 'string' ? e.response.data : null) ||
        e.message ||
        'Something went wrong. Please try again.';
      console.log('[Register] Error:', e.response?.status, JSON.stringify(e.response?.data));
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.brandName, { color: theme.primary }]}>Aarudhra</Text>
            <Text style={[styles.brandTag, { color: theme.text }]}>MASALA</Text>
            <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Sign up to explore fresh, pure & traditional masalas
            </Text>
          </View>

          {/* Message banner */}
          {message && (
            <View
              style={[
                styles.messageBanner,
                {
                  backgroundColor: message.type === 'success' ? '#D1FAE5' : '#FEE2E2',
                  borderColor: message.type === 'success' ? '#10B981' : '#EF4444',
                },
              ]}
            >
              <Feather
                name={message.type === 'success' ? 'check-circle' : 'alert-circle'}
                size={18}
                color={message.type === 'success' ? '#059669' : '#DC2626'}
              />
              <Text
                style={[
                  styles.messageText,
                  { color: message.type === 'success' ? '#065F46' : '#991B1B' },
                ]}
              >
                {message.text}
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Name row */}
            <View style={styles.nameRow}>
              <View style={styles.halfField}>
                <AuthInput
                  label="First Name"
                  icon="user"
                  placeholder="First name"
                  value={form.firstName}
                  onChangeText={(v) => updateField('firstName', v)}
                  autoCapitalize="words"
                  error={errors.firstName}
                />
              </View>
              <View style={styles.halfField}>
                <AuthInput
                  label="Last Name"
                  icon="user"
                  placeholder="Last name"
                  value={form.lastName}
                  onChangeText={(v) => updateField('lastName', v)}
                  autoCapitalize="words"
                  error={errors.lastName}
                />
              </View>
            </View>

            <AuthInput
              label="Email"
              icon="mail"
              placeholder="Enter your email"
              value={form.email}
              onChangeText={(v) => updateField('email', v)}
              keyboardType="email-address"
              error={errors.email}
            />

            <View style={styles.phoneContainer}>
              <Text style={[styles.phoneLabel, { color: theme.text }]}>Phone Number</Text>
              <View style={styles.phoneRow}>
                <CountryCodePicker
                  selected={countryCode}
                  onSelect={setCountryCode}
                />
                <View style={styles.phoneInput}>
                  <AuthInput
                    icon="phone"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChangeText={(v) => updateField('phone', v)}
                    keyboardType="phone-pad"
                    error={errors.phone}
                  />
                </View>
              </View>
            </View>

            <AuthInput
              label="Password"
              icon="lock"
              placeholder="Create a password"
              value={form.password}
              onChangeText={(v) => updateField('password', v)}
              secureTextEntry
              error={errors.password}
            />

            <AuthInput
              label="Confirm Password"
              icon="shield"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChangeText={(v) => updateField('confirmPassword', v)}
              secureTextEntry
              error={errors.confirmPassword}
            />

            {/* Terms */}
            <Text style={[styles.termsText, { color: theme.textSecondary }]}>
              By registering, you agree to our{' '}
              <Text style={{ color: theme.primary, fontWeight: '600' }}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text style={{ color: theme.primary, fontWeight: '600' }}>
                Privacy Policy
              </Text>
            </Text>

            <TouchableOpacity
              style={[styles.registerBtn, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleRegister}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.registerBtnText}>Create Account</Text>
              )}
            </TouchableOpacity>

          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')}>
              <Text style={[styles.footerLink, { color: theme.primary }]}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  brandName: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'currentColor',
    textShadowOffset: { width: 2, height: 0 },
    textShadowRadius: 0,
  },
  brandTag: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: -2,
    marginBottom: 20,
    textShadowColor: 'currentColor',
    textShadowOffset: { width: 1, height: 0 },
    textShadowRadius: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textShadowColor: 'currentColor',
    textShadowOffset: { width: 1, height: 0 },
    textShadowRadius: 0,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 6,
    lineHeight: 22,
  },
  messageBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  form: {
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  phoneContainer: {
    marginBottom: 0,
  },
  phoneLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  phonePicker: {
    paddingTop: 0,
  },
  phoneInput: {
    flex: 1,
  },
  termsText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
    marginTop: -4,
  },
  registerBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 13,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
