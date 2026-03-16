/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useDrawerProgress } from '@react-navigation/drawer';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { DRAWER_MENU_ITEMS } from '../constants/data';

export default function CustomDrawer({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const progress = useDrawerProgress();

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const isLoggedIn = !!user;
  const initials = isLoggedIn
    ? `${(user.firstname || '')[0] || ''}${(user.lastname || '')[0] || ''}`.toUpperCase()
    : 'A';

  const handleNavigation = (item) => {
    navigation.closeDrawer();
    if (item.screen !== 'HomeScreen') {
      navigation.getParent()?.navigate(item.screen);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.closeDrawer();
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.drawerBg, paddingTop: insets.top }, animatedStyle]}>
      {/* Header / Profile */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={[styles.avatarContainer, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.headerInfo}>
          {isLoggedIn ? (
            <>
              <Text style={[styles.greeting, { color: theme.textSecondary }]}>Hello,</Text>
              <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
                {user.firstname} {user.lastname}
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.brandName, { color: theme.primary }]}>Aarudhra</Text>
              <Text style={[styles.brandTag, { color: theme.text }]}>MASALA</Text>
              <Text style={[styles.tagline, { color: theme.textSecondary }]}>
                Pure & Traditional
              </Text>
            </>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.closeDrawer()} style={styles.closeBtn}>
          <Feather name="x" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
        {DRAWER_MENU_ITEMS.map((item, index) => {
          const isHome = item.screen === 'HomeScreen';
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                isHome && {
                  backgroundColor: theme.isDark ? 'rgba(16,132,116,0.15)' : '#E8F5F1',
                },
              ]}
              onPress={() => handleNavigation(item)}
            >
              <Feather
                name={item.icon}
                size={20}
                color={isHome ? theme.primary : theme.textSecondary}
              />
              <Text
                style={[
                  styles.menuLabel,
                  { color: isHome ? theme.primary : theme.text },
                  isHome && { fontWeight: '700' },
                ]}
              >
                {item.label}
              </Text>
              <Feather name="chevron-right" size={16} color={theme.border} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <View style={styles.themeRow}>
          <Feather name={isDark ? 'moon' : 'sun'} size={18} color={theme.textSecondary} />
          <Text style={[styles.themeLabel, { color: theme.text }]}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#FFF"
          />
        </View>

        {isLoggedIn ? (
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: theme.accent }]}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={16} color="#FFF" />
            <Text style={styles.loginBtnText}>Logout</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: theme.primary }]}
            onPress={() => {
              navigation.closeDrawer();
              navigation.getParent()?.navigate('Login');
            }}
          >
            <Feather name="log-in" size={16} color="#FFF" />
            <Text style={styles.loginBtnText}>Login / Sign Up</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  brandName: {
    fontSize: 36,
    fontFamily: 'BabyBoho',
    letterSpacing: 0.5,
  },
  brandTag: {
    fontSize: 16,
    fontFamily: 'BabyBoho',
    letterSpacing: 3,
    marginTop: -1,
  },
  tagline: {
    fontSize: 11,
    marginTop: 4,
  },
  closeBtn: {
    padding: 4,
  },
  menuList: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 20,
    gap: 14,
    borderRadius: 8,
    marginHorizontal: 10,
    marginVertical: 1,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
    padding: 20,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  themeLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
