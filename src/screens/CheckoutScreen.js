/**
 * Created by: Kanagaraj P
 * Created on: 03-03-2026
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import AuthInput from '../components/AuthInput';
import { SIZES } from '../constants/theme';

export default function CheckoutScreen({ navigation }) {
  const { theme } = useTheme();
  const { cartItems, cartCount, cartTotal, getOrderObject, clearCart } = useCart();
  const { placeOrder } = useOrders();

  const [building, setBuilding] = useState('');
  const [street1, setStreet1] = useState('');
  const [street2, setStreet2] = useState('');
  const [pincode, setPincode] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeAutoFilled, setPincodeAutoFilled] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (pincode.length === 6) {
      fetchPincodeDetails(pincode);
    } else {
      setState('');
      setCountry('');
      setPincodeAutoFilled(false);
    }
  }, [pincode]);

  const fetchPincodeDetails = async (code) => {
    setPincodeLoading(true);
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${code}`
      );
      const data = await response.json();
      if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setState(postOffice.State || '');
        setCountry(postOffice.Country || '');
        setPincodeAutoFilled(true);
        setErrors((prev) => ({ ...prev, pincode: null, state: null, country: null }));
      } else {
        setState('');
        setCountry('');
        setPincodeAutoFilled(false);
        setErrors((prev) => ({ ...prev, pincode: 'Invalid pincode' }));
      }
    } catch {
      setState('');
      setCountry('');
      setPincodeAutoFilled(false);
      setErrors((prev) => ({ ...prev, pincode: 'Failed to verify pincode' }));
    } finally {
      setPincodeLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!building.trim()) newErrors.building = 'Building is required';
    if (!street1.trim()) newErrors.street1 = 'Street 1 is required';
    if (!pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (pincode.length !== 6) newErrors.pincode = 'Enter a valid 6-digit pincode';
    if (!state.trim()) newErrors.state = 'State is required';
    if (!country.trim()) newErrors.country = 'Country is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return;

    const address = [building, street1, street2, pincode, state, country]
      .filter(Boolean)
      .join(', ');

    const order = getOrderObject();
    order.order.shippingaddress = address;
    order.order.billingaddress = address;
    order.order.pincode = pincode;

    // Include product names in order details for display
    order.orderdetails = order.orderdetails.map((detail, idx) => ({
      ...detail,
      productName: cartItems[idx]?.name || detail.productcode,
    }));

    await placeOrder(order);
    clearCart();
    navigation.replace('OrderSuccess');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.headerBg, borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Checkout
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Order Summary */}
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Feather name="shopping-bag" size={20} color={theme.primary} />
          <Text style={[styles.summaryText, { color: theme.text }]}>
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
          </Text>
          <Text style={[styles.summaryAmount, { color: theme.primary }]}>
            ₹{cartTotal}
          </Text>
        </View>

        {/* Delivery Address */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Delivery Address
        </Text>

        <AuthInput
          label="Building No / Name"
          icon="home"
          placeholder="e.g. 12, Lotus Apartments"
          value={building}
          onChangeText={(text) => {
            setBuilding(text);
            if (errors.building) setErrors((prev) => ({ ...prev, building: null }));
          }}
          error={errors.building}
        />

        <AuthInput
          label="Street 1"
          icon="map-pin"
          placeholder="Main street address"
          value={street1}
          onChangeText={(text) => {
            setStreet1(text);
            if (errors.street1) setErrors((prev) => ({ ...prev, street1: null }));
          }}
          error={errors.street1}
        />

        <AuthInput
          label="Street 2"
          icon="map-pin"
          placeholder="Landmark / Area (optional)"
          value={street2}
          onChangeText={setStreet2}
        />

        <View>
          <AuthInput
            label="Pincode"
            icon="hash"
            placeholder="6-digit pincode"
            value={pincode}
            onChangeText={(text) => {
              const digits = text.replace(/[^0-9]/g, '').slice(0, 6);
              setPincode(digits);
              if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: null }));
            }}
            keyboardType="numeric"
            error={errors.pincode}
          />
          {pincodeLoading && (
            <ActivityIndicator
              size="small"
              color={theme.primary}
              style={styles.pincodeLoader}
            />
          )}
        </View>

        <AuthInput
          label="State"
          icon="map"
          placeholder={pincodeAutoFilled ? state : 'Auto-filled from pincode'}
          value={state}
          onChangeText={pincodeAutoFilled ? undefined : setState}
          editable={!pincodeAutoFilled}
          error={errors.state}
        />

        <AuthInput
          label="Country"
          icon="globe"
          placeholder={pincodeAutoFilled ? country : 'Auto-filled from pincode'}
          value={country}
          onChangeText={pincodeAutoFilled ? undefined : setCountry}
          editable={!pincodeAutoFilled}
          error={errors.country}
        />

        {/* Payment Method */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Payment Method
        </Text>

        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.paymentOption,
            {
              backgroundColor: theme.card,
              borderColor: theme.primary,
            },
          ]}
        >
          <View style={[styles.radioOuter, { borderColor: theme.primary }]}>
            <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
          </View>
          <Feather name="dollar-sign" size={18} color={theme.text} style={{ marginRight: 8 }} />
          <Text style={[styles.paymentLabel, { color: theme.text }]}>
            Cash on Delivery
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Place Order Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
            shadowColor: theme.shadowColor,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.placeOrderBtn, { backgroundColor: theme.primary }]}
          onPress={handlePlaceOrder}
        >
          <Feather name="check-circle" size={18} color="#FFF" />
          <Text style={styles.placeOrderText}>Place Order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 36,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 32,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    marginBottom: 20,
    gap: 10,
  },
  summaryText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '900',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  pincodeLoader: {
    position: 'absolute',
    right: 16,
    top: 38,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: SIZES.radius,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  paymentLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    padding: SIZES.padding,
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  placeOrderText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
