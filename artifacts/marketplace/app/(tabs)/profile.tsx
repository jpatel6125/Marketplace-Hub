import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentUser, isLoggedIn, logout, products, reviews } = useApp();

  if (!isLoggedIn || !currentUser) {
    return (
      <View style={[styles.authContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.bigAvatar, { backgroundColor: colors.primary }]}>
          <Feather name="user" size={48} color="#fff" />
        </View>
        <Text style={[styles.authTitle, { color: colors.foreground }]}>Your Profile</Text>
        <Text style={[styles.authText, { color: colors.mutedForeground }]}>
          Sign in to manage your listings, orders, and account
        </Text>
        <Pressable
          style={[styles.authBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/auth/login" as never)}
        >
          <Text style={[styles.authBtnText, { color: colors.primaryForeground }]}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  const myListings = products.filter((p) => p.sellerId === currentUser.id);
  const myReviews = reviews.filter((r) => r.targetUserId === currentUser.id);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth/splash" as never);
        },
      },
    ]);
  };

  const menuItems = [
    { icon: "package", label: "My Listings", count: myListings.length, onPress: () => router.push("/(tabs)/home" as never) },
    { icon: "shopping-bag", label: "My Orders", count: null, onPress: () => router.push("/orders" as never) },
    { icon: "star", label: "Reviews", count: myReviews.length, onPress: () => router.push(`/reviews/${currentUser.id}` as never) },
    { icon: "heart", label: "Favorites", count: null, onPress: () => {} },
    { icon: "settings", label: "Account Settings", count: null, onPress: () => {} },
    { icon: "help-circle", label: "Help & Support", count: null, onPress: () => {} },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 100 : 90),
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile card */}
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.bigAvatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.bigAvatarText}>
            {currentUser.name[0].toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>{currentUser.name}</Text>
        <Text style={[styles.email, { color: colors.mutedForeground }]}>{currentUser.email}</Text>
        {currentUser.location && (
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={13} color={colors.mutedForeground} />
            <Text style={[styles.location, { color: colors.mutedForeground }]}>{currentUser.location}</Text>
          </View>
        )}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {currentUser.rating > 0 ? currentUser.rating.toFixed(1) : "—"}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Rating</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{myListings.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Listings</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{myReviews.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Reviews</Text>
          </View>
        </View>
        <Text style={[styles.joinedText, { color: colors.mutedForeground }]}>
          Member since {new Date(currentUser.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </Text>
      </View>

      {/* Menu */}
      <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {menuItems.map((item, idx) => (
          <View key={item.label}>
            <Pressable style={styles.menuItem} onPress={item.onPress}>
              <View style={[styles.menuIcon, { backgroundColor: colors.accent }]}>
                <Feather name={item.icon as "package"} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
              <View style={styles.menuRight}>
                {item.count !== null && (
                  <View style={[styles.menuBadge, { backgroundColor: colors.muted }]}>
                    <Text style={[styles.menuBadgeText, { color: colors.mutedForeground }]}>{item.count}</Text>
                  </View>
                )}
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              </View>
            </Pressable>
            {idx < menuItems.length - 1 && (
              <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            )}
          </View>
        ))}
      </View>

      <Pressable
        style={[styles.logoutBtn, { borderColor: colors.destructive }]}
        onPress={handleLogout}
      >
        <Feather name="log-out" size={18} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, gap: 14 },
  authContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  authTitle: { fontSize: 24, fontWeight: "700" as const },
  authText: { fontSize: 15, textAlign: "center" },
  authBtn: { height: 50, paddingHorizontal: 32, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 8 },
  authBtnText: { fontSize: 16, fontWeight: "700" as const },
  profileCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 6,
  },
  bigAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  bigAvatarText: { fontSize: 32, fontWeight: "700" as const, color: "#fff" },
  name: { fontSize: 22, fontWeight: "700" as const },
  email: { fontSize: 14 },
  locationRow: { flexDirection: "row", gap: 4, alignItems: "center" },
  location: { fontSize: 13 },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: 16,
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 22, fontWeight: "700" as const },
  statLabel: { fontSize: 12 },
  statDivider: { width: 1, height: 36, marginHorizontal: 8 },
  joinedText: { fontSize: 12, marginTop: 4 },
  menuCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "500" as const },
  menuRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  menuBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  menuBadgeText: { fontSize: 12, fontWeight: "600" as const },
  menuDivider: { height: 1, marginHorizontal: 16 },
  logoutBtn: {
    flexDirection: "row",
    gap: 8,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  logoutText: { fontSize: 15, fontWeight: "600" as const },
});
