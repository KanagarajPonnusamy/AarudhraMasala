import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { SIZES } from '../constants/theme';

export default function Breadcrumb({ crumbs }) {
  const { theme } = useTheme();
  const navigation = useNavigation();

  if (!crumbs || crumbs.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <Text style={[styles.separator, { color: theme.textSecondary }]}>/</Text>
            )}
            {isLast || !crumb.screen ? (
              <Text
                style={[styles.currentCrumb, { color: theme.text }]}
                numberOfLines={1}
              >
                {crumb.label}
              </Text>
            ) : (
              <TouchableOpacity
                onPress={() => navigation.navigate(crumb.screen, crumb.params)}
              >
                <Text
                  style={[styles.linkCrumb, { color: theme.textSecondary }]}
                  numberOfLines={1}
                >
                  {crumb.label}
                </Text>
              </TouchableOpacity>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  separator: {
    fontSize: 13,
    marginHorizontal: 6,
  },
  linkCrumb: {
    fontSize: 13,
  },
  currentCrumb: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
});
