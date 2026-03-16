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

export default function LoginScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setMessage(null);
    try {
      await login(form.email, form.password);
      setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
      const returnTo = route.params?.returnTo;
      setTimeout(() => {
        if (returnTo) {
          navigation.replace(returnTo);
        } else {
          navigation.goBack();
        }
      }, 1000);
    } catch (e) {
      const errMsg =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.response?.data?.status ||
        (typeof e.response?.data === 'string' ? e.response.data : null) ||
        e.message ||
        'Something went wrong. Please try again.';
      console.log('[Login] Error:', e.response?.status, JSON.stringify(e.response?.data));
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
            <Text style={[styles.title, { color: theme.text }]}>Welcome Back!</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Sign in to your account to continue
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
            <AuthInput
              label="Email"
              icon="mail"
              placeholder="Enter your email"
              value={form.email}
              onChangeText={(v) => updateField('email', v)}
              keyboardType="email-address"
              error={errors.email}
            />
            <AuthInput
              label="Password"
              icon="lock"
              placeholder="Enter your password"
              value={form.password}
              onChangeText={(v) => updateField('password', v)}
              secureTextEntry
              error={errors.password}
            />

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={[styles.forgotText, { color: theme.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.loginBtnText}>Login</Text>
              )}
            </TouchableOpacity>

          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.replace('Register')}>
              <Text style={[styles.footerLink, { color: theme.primary }]}>
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cancel */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.navigate('Main')}
          >
            <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
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
  cancelBtn: {
    alignSelf: 'center',
    marginTop: 16,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    marginBottom: 32,
  },
  brandName: {
    fontSize: 36,
    fontFamily: 'BabyBoho',
    letterSpacing: 1,
    textShadowColor: 'currentColor',
    textShadowOffset: { width: 2, height: 0 },
    textShadowRadius: 0,
  },
  brandTag: {
    fontSize: 16,
    fontFamily: 'BabyBoho',
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loginBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
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
