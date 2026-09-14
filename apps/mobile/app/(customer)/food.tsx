import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { Spacing, BorderRadius, Shadows } from '../../src/theme/spacing';
import { useAppStore } from '../../src/store/useAppStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../../src/components/Button';
import { Badge } from '../../src/components/Badge';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  menu: MenuItem[];
}

export default function FoodDeliveryScreen() {
  const router = useRouter();
  const { pickupLocation } = useAppStore();

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<{ [itemId: string]: { item: MenuItem; qty: number } }>({});
  const [orderPlaced, setOrderPlaced] = useState(false);

  const restaurants: Restaurant[] = [
    {
      id: 'rest-1',
      name: 'Student Biryani (Saddar)',
      tagline: 'The Legendary Taste of Karachi',
      cuisine: 'Biryani & Pulao',
      rating: 4.8,
      deliveryTime: '25-30 min',
      deliveryFee: 99,
      minOrder: 300,
      menu: [
        { id: 'm1', name: 'Chicken Biryani Special Single', description: 'Fragrant basmati rice with tender spiced chicken piece & aloo', price: 380 },
        { id: 'm2', name: 'Chicken Biryani Double Meat', description: 'Double portion chicken, extra aloo, salad & raita included', price: 540 },
        { id: 'm3', name: 'Special Shahi Zarda', description: 'Traditional sweet yellow rice with khoya & dry fruits', price: 180 },
      ],
    },
    {
      id: 'rest-2',
      name: 'Kolachi (Do Darya Clifton)',
      tagline: 'Iconic Ocean-side Pakistani BBQ',
      cuisine: 'Karahi & BBQ',
      rating: 4.9,
      deliveryTime: '35-45 min',
      deliveryFee: 149,
      minOrder: 800,
      menu: [
        { id: 'm4', name: 'Chicken Makhni Karahi (Half)', description: 'Rich tomato, butter & green chili gravy with tender chicken', price: 1450 },
        { id: 'm5', name: 'Mutton Chops BBQ (4 Pcs)', description: 'Juicy spiced char-grilled mutton chops', price: 1850 },
        { id: 'm6', name: 'Garlic Roghani Naan', description: 'Freshly baked tandoori naan brushed with garlic butter', price: 120 },
      ],
    },
    {
      id: 'rest-3',
      name: 'Waheed Kabab House (Burns Road)',
      tagline: 'World Famous Fry Kabab since 1961',
      cuisine: 'Burns Road Specialties',
      rating: 4.7,
      deliveryTime: '30-40 min',
      deliveryFee: 99,
      minOrder: 400,
      menu: [
        { id: 'm7', name: 'Beef Fry Kabab Plate', description: 'Minced beef simmered in pure desi ghee with secret herbs', price: 580 },
        { id: 'm8', name: 'Crispy Puri Paratha', description: 'Deep fried crispy flaky paratha', price: 90 },
        { id: 'm9', name: 'Special Nalli Nihari', description: 'Slow cooked beef shank with rich bone marrow stew', price: 780 },
      ],
    },
    {
      id: 'rest-4',
      name: 'OPTP Clifton',
      tagline: 'One Potato Two Potato',
      cuisine: 'Burgers & Fries',
      rating: 4.6,
      deliveryTime: '20-25 min',
      deliveryFee: 79,
      minOrder: 350,
      menu: [
        { id: 'm10', name: 'Southern Crispy Chicken Burger', description: 'Crispy breast fillet, spicy mayo, cheese & lettuce', price: 550 },
        { id: 'm11', name: 'Masala Seasoned Fries (Large)', description: 'Hand cut real Belgian style fries with signature spices', price: 320 },
        { id: 'm12', name: 'Garlic Mayo Wings (6 Pcs)', description: 'Glazed crispy wings tossed in garlic parmesan mayo', price: 420 },
      ],
    },
  ];

  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const current = prev[item.id]?.qty || 0;
      return {
        ...prev,
        [item.id]: { item, qty: current + 1 },
      };
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => {
      const current = prev[itemId]?.qty || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return {
        ...prev,
        [itemId]: { ...prev[itemId], qty: current - 1 },
      };
    });
  };

  const cartItems = Object.values(cart);
  const cartSubtotal = cartItems.reduce((sum, c) => sum + c.item.price * c.qty, 0);
  const cartDeliveryFee = 99;
  const cartTotal = cartSubtotal + (cartSubtotal > 0 ? cartDeliveryFee : 0);

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    Alert.alert(
      'Order Placed! 🛵',
      `Your food order (Rs. ${cartTotal}) has been sent to the kitchen.\nA Super App Delivery Partner will deliver to ${pickupLocation.name}.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity
          onPress={() => (selectedRestaurant ? setSelectedRestaurant(null) : router.back())}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>
          {selectedRestaurant ? selectedRestaurant.name : 'Karachi Food Delivery'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Delivery Location Banner */}
        <View style={styles.deliveryLocationPill}>
          <Ionicons name="location-sharp" size={18} color={Colors.primary} />
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <Text style={styles.locationLabel}>Delivering To</Text>
            <Text numberOfLines={1} style={styles.locationText}>
              {pickupLocation.name}
            </Text>
          </View>
        </View>

        {/* RESTAURANT MENU DETAIL VIEW */}
        {selectedRestaurant ? (
          <View>
            <View style={styles.restaurantHeroCard}>
              <Text style={styles.restHeroTitle}>{selectedRestaurant.name}</Text>
              <Text style={styles.restHeroTagline}>{selectedRestaurant.tagline}</Text>
              <View style={styles.restHeroMetaRow}>
                <Badge label={`${selectedRestaurant.rating} ★`} variant="success" />
                <Text style={styles.restHeroMetaText}>
                  {selectedRestaurant.deliveryTime} • Rs. {selectedRestaurant.deliveryFee} delivery
                </Text>
              </View>
            </View>

            <Text style={styles.sectionHeader}>Featured Menu Items</Text>
            <View style={styles.menuList}>
              {selectedRestaurant.menu.map((m) => {
                const qty = cart[m.id]?.qty || 0;
                return (
                  <View key={m.id} style={styles.menuItemCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuItemName}>{m.name}</Text>
                      <Text style={styles.menuItemDesc}>{m.description}</Text>
                      <Text style={styles.menuItemPrice}>Rs. {m.price}</Text>
                    </View>

                    <View style={styles.qtyControls}>
                      {qty > 0 ? (
                        <View style={styles.stepperBox}>
                          <TouchableOpacity
                            onPress={() => handleRemoveFromCart(m.id)}
                            style={styles.qtyBtn}
                          >
                            <Ionicons name="remove" size={14} color={Colors.textPrimary} />
                          </TouchableOpacity>
                          <Text style={styles.qtyText}>{qty}</Text>
                          <TouchableOpacity
                            onPress={() => handleAddToCart(m)}
                            style={styles.qtyBtn}
                          >
                            <Ionicons name="add" size={14} color={Colors.textPrimary} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => handleAddToCart(m)}
                          style={styles.addBtn}
                        >
                          <Ionicons name="add" size={16} color={Colors.primary} />
                          <Text style={styles.addBtnText}>Add</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          /* RESTAURANT DIRECTORY VIEW */
          <>
            {/* Category Filters */}
            <View style={styles.categoryPillsRow}>
              {['ALL', 'BIRYANI', 'KARAHI & BBQ', 'BURGER & FAST FOOD'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[styles.catPill, selectedCategory === cat && styles.catPillSelected]}
                >
                  <Text style={[styles.catPillText, selectedCategory === cat && styles.catPillTextSelected]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Restaurant Cards */}
            <Text style={styles.sectionHeader}>Popular Restaurants Near You</Text>
            <View style={styles.restaurantsList}>
              {restaurants.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  activeOpacity={0.9}
                  onPress={() => setSelectedRestaurant(r)}
                  style={styles.restaurantCard}
                >
                  <View style={styles.restAvatarBox}>
                    <MaterialCommunityIcons name="food-drumstick" size={28} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.restaurantName}>{r.name}</Text>
                      <Badge label={`${r.rating} ★`} variant="success" />
                    </View>
                    <Text style={styles.restaurantTagline}>{r.tagline}</Text>
                    <View style={styles.restaurantMeta}>
                      <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                      <Text style={styles.restaurantMetaText}>{r.deliveryTime}</Text>
                      <Text style={styles.bullet}>•</Text>
                      <Ionicons name="bicycle-outline" size={14} color={Colors.textMuted} />
                      <Text style={styles.restaurantMetaText}>Rs. {r.deliveryFee}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Floating Cart Bar */}
      {cartSubtotal > 0 && (
        <View style={styles.floatingCartBar}>
          <View>
            <Text style={styles.cartCountText}>{cartItems.length} items selected</Text>
            <Text style={styles.cartTotalText}>Total: Rs. {cartTotal}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePlaceOrder}
            style={styles.checkoutBtn}
          >
            <Text style={styles.checkoutBtnText}>Checkout & Order</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.textWhite} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topNav: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl * 3,
  },
  deliveryLocationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  locationLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  locationText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  categoryPillsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  catPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  catPillTextSelected: {
    color: Colors.textWhite,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  restaurantsList: {
    gap: Spacing.md,
  },
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  restAvatarBox: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  restaurantTagline: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  restaurantMetaText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  bullet: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  restaurantHeroCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  restHeroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  restHeroTagline: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  restHeroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  restHeroMetaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  menuList: {
    gap: Spacing.md,
  },
  menuItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  menuItemName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  menuItemDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuItemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 6,
  },
  qtyControls: {
    marginLeft: Spacing.md,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: 3,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.sm,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 78,
    left: 16,
    right: 16,
    backgroundColor: Colors.textPrimary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadows.lg,
  },
  cartCountText: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  cartTotalText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textWhite,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
    gap: 6,
  },
  checkoutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textWhite,
  },
});
