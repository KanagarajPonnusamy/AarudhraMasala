import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getLocales } from 'expo-localization';
import { useTheme } from '../context/ThemeContext';

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '\u{1F1EE}\u{1F1F3}', iso: 'IN' },
  { code: '+1', country: 'United States', flag: '\u{1F1FA}\u{1F1F8}', iso: 'US' },
  { code: '+1', country: 'Canada', flag: '\u{1F1E8}\u{1F1E6}', iso: 'CA' },
  { code: '+44', country: 'United Kingdom', flag: '\u{1F1EC}\u{1F1E7}', iso: 'GB' },
  { code: '+61', country: 'Australia', flag: '\u{1F1E6}\u{1F1FA}', iso: 'AU' },
  { code: '+971', country: 'UAE', flag: '\u{1F1E6}\u{1F1EA}', iso: 'AE' },
  { code: '+966', country: 'Saudi Arabia', flag: '\u{1F1F8}\u{1F1E6}', iso: 'SA' },
  { code: '+65', country: 'Singapore', flag: '\u{1F1F8}\u{1F1EC}', iso: 'SG' },
  { code: '+60', country: 'Malaysia', flag: '\u{1F1F2}\u{1F1FE}', iso: 'MY' },
  { code: '+49', country: 'Germany', flag: '\u{1F1E9}\u{1F1EA}', iso: 'DE' },
  { code: '+33', country: 'France', flag: '\u{1F1EB}\u{1F1F7}', iso: 'FR' },
  { code: '+81', country: 'Japan', flag: '\u{1F1EF}\u{1F1F5}', iso: 'JP' },
  { code: '+86', country: 'China', flag: '\u{1F1E8}\u{1F1F3}', iso: 'CN' },
  { code: '+82', country: 'South Korea', flag: '\u{1F1F0}\u{1F1F7}', iso: 'KR' },
  { code: '+55', country: 'Brazil', flag: '\u{1F1E7}\u{1F1F7}', iso: 'BR' },
  { code: '+27', country: 'South Africa', flag: '\u{1F1FF}\u{1F1E6}', iso: 'ZA' },
  { code: '+234', country: 'Nigeria', flag: '\u{1F1F3}\u{1F1EC}', iso: 'NG' },
  { code: '+254', country: 'Kenya', flag: '\u{1F1F0}\u{1F1EA}', iso: 'KE' },
  { code: '+94', country: 'Sri Lanka', flag: '\u{1F1F1}\u{1F1F0}', iso: 'LK' },
  { code: '+977', country: 'Nepal', flag: '\u{1F1F3}\u{1F1F5}', iso: 'NP' },
  { code: '+880', country: 'Bangladesh', flag: '\u{1F1E7}\u{1F1E9}', iso: 'BD' },
  { code: '+92', country: 'Pakistan', flag: '\u{1F1F5}\u{1F1F0}', iso: 'PK' },
  { code: '+63', country: 'Philippines', flag: '\u{1F1F5}\u{1F1ED}', iso: 'PH' },
  { code: '+62', country: 'Indonesia', flag: '\u{1F1EE}\u{1F1E9}', iso: 'ID' },
  { code: '+66', country: 'Thailand', flag: '\u{1F1F9}\u{1F1ED}', iso: 'TH' },
];

// Timezone -> ISO country code mapping for reliable detection
const TZ_TO_COUNTRY = {
  'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
  'America/Los_Angeles': 'US', 'America/Phoenix': 'US',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA',
  'Europe/London': 'GB',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU',
  'Asia/Dubai': 'AE',
  'Asia/Riyadh': 'SA',
  'Asia/Singapore': 'SG',
  'Asia/Kuala_Lumpur': 'MY',
  'Europe/Berlin': 'DE',
  'Europe/Paris': 'FR',
  'Asia/Tokyo': 'JP',
  'Asia/Shanghai': 'CN',
  'Asia/Seoul': 'KR',
  'America/Sao_Paulo': 'BR',
  'Africa/Johannesburg': 'ZA',
  'Africa/Lagos': 'NG',
  'Africa/Nairobi': 'KE',
  'Asia/Colombo': 'LK',
  'Asia/Kathmandu': 'NP',
  'Asia/Dhaka': 'BD',
  'Asia/Karachi': 'PK',
  'Asia/Manila': 'PH',
  'Asia/Jakarta': 'ID',
  'Asia/Bangkok': 'TH',
};

function detectCountry() {
  try {
    // 1. Primary: detect via timezone (most reliable for actual location)
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('[CountryDetect] timezone:', tz);

    if (tz) {
      const isoCode = TZ_TO_COUNTRY[tz];
      console.log('[CountryDetect] mapped ISO:', isoCode);
      if (isoCode) {
        const found = COUNTRY_CODES.find((c) => c.iso === isoCode);
        if (found) {
          console.log('[CountryDetect] RESULT:', found.country, found.code);
          return found;
        }
      }
    }

    // 2. Fallback: expo-localization regionCode
    const locales = getLocales();
    const region = locales?.[0]?.regionCode;
    console.log('[CountryDetect] locale region:', region);
    if (region) {
      const found = COUNTRY_CODES.find((c) => c.iso === region.toUpperCase());
      if (found) {
        console.log('[CountryDetect] RESULT:', found.country, found.code);
        return found;
      }
    }
  } catch (e) {
    console.log('[CountryDetect] ERROR:', e.message);
  }

  console.log('[CountryDetect] FALLBACK to India');
  return COUNTRY_CODES[0];
}

const DEFAULT_COUNTRY = detectCountry();

export function getDefaultCountry() {
  return DEFAULT_COUNTRY;
}

export default function CountryCodePicker({ selected, onSelect }) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const searchRef = useRef(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      onSelect(DEFAULT_COUNTRY);
    }
  }, [onSelect]);

  const filtered = search
    ? COUNTRY_CODES.filter(
        (c) =>
          c.country.toLowerCase().includes(search.toLowerCase()) ||
          c.code.includes(search)
      )
    : COUNTRY_CODES;

  const handleSelect = (item) => {
    onSelect(item);
    setVisible(false);
    setSearch('');
  };

  const display = selected || DEFAULT_COUNTRY;

  return (
    <>
      <TouchableOpacity
        style={[styles.picker, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.flag}>{display.flag || ''}</Text>
        <Text style={[styles.code, { color: theme.text }]}>{display.code || '+91'}</Text>
        <Feather name="chevron-down" size={14} color={theme.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Select Country
              </Text>
              <TouchableOpacity
                onPress={() => { setVisible(false); setSearch(''); }}
                style={styles.modalClose}
              >
                <Feather name="x" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={[styles.searchBar, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
              <Feather name="search" size={16} color={theme.textSecondary} />
              <TextInput
                ref={searchRef}
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search country or code..."
                placeholderTextColor={theme.textSecondary}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* List */}
            <FlatList
              data={filtered}
              keyExtractor={(item, i) => `${item.iso}-${i}`}
              renderItem={({ item }) => {
                const isSelected = display.iso === item.iso && display.code === item.code;
                return (
                  <TouchableOpacity
                    style={[
                      styles.countryRow,
                      isSelected && {
                        backgroundColor: theme.isDark
                          ? 'rgba(16,132,116,0.15)'
                          : '#E8F5F1',
                      },
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={styles.countryFlag}>{item.flag}</Text>
                    <Text
                      style={[styles.countryName, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {item.country}
                    </Text>
                    <Text style={[styles.countryCode, { color: theme.textSecondary }]}>
                      {item.code}
                    </Text>
                    {isSelected && (
                      <Feather name="check" size={16} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                );
              }}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    marginRight: 8,
  },
  flag: {
    fontSize: 18,
  },
  code: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalClose: {
    padding: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 14,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
    outlineStyle: 'none',
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 18,
    gap: 12,
  },
  countryFlag: {
    fontSize: 22,
  },
  countryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
});
