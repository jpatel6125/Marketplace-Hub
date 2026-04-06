import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import productImageMap from "@/constants/productImages";
import { useColors } from "@/hooks/useColors";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const conditionColors: Record<string, string> = {
  "New": "#10B981",
  "Like New": "#10B981",
  "Good": "#3B82F6",
  "Fair": "#F59E0B",
  "Poor": "#EF4444",
};

export default function ProductDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, currentUser, toggleFavorite, favorites, startChat, placeOrder, deleteProduct } = useApp();

  const product = products.find((p) => p.id === id);
  if (!product) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Product not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const isFav = favorites.includes(product.id);
  const isOwner = currentUser?.id === product.sellerId;
  const localImg = productImageMap[product.id];
  const conditionColor = conditionColors[product.condition] ?? colors.mutedForeground;

  const handleChat = () => {
    if (!currentUser) {
      router.push("/auth/login" as never);
      return;
    }
    const roomId = startChat(product);
    router.push(`/chat/${roomId}` as never);
  };

  const handleBuy = () => {
    if (!currentUser) {
      router.push("/auth/login" as never);
      return;
    }
    Alert.alert(
      "Confirm Purchase",
      `Buy "${product.title}" for $${product.price}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Pay",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const order = placeOrder(product);
            Alert.alert("Order Placed!", "Your order has been placed successfully.", [
              { text: "View Orders", onPress: () => router.push("/orders" as never) },
              { text: "Continue", onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert("Delete Listing", "Are you sure you want to remove this listing?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteProduct(product.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Image */}
        <View style={[styles.imageContainer, { backgroundColor: colors.muted }]}>
          {localImg ? (
            <Image source={localImg} style={styles.mainImage} />
          ) : product.images[0] ? (
            <Image source={{ uri: product.images[0] }} style={styles.mainImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather name="image" size={60} color={colors.mutedForeground} />
              <Text style={[styles.imagePlaceholderText, { color: colors.mutedForeground }]}>
                No photo available
              </Text>
            </View>
          )}
          {/* Back btn */}
          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: colors.card, top: insets.top + (Platform.OS === "web" ? 67 : 12) }]}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </Pressable>
          {/* Fav btn */}
          <Pressable
            onPress={() => { toggleFavorite(product.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={[styles.favBtn, { backgroundColor: colors.card, top: insets.top + (Platform.OS === "web" ? 67 : 12) }]}
          >
            <Feather name="heart" size={20} color={isFav ? colors.destructive : colors.foreground} />
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Status & Category row */}
          <View style={styles.tagRow}>
            <View style={[styles.categoryTag, { backgroundColor: colors.accent }]}>
              <Text style={[styles.categoryTagText, { color: colors.primary }]}>{product.category}</Text>
            </View>
            <View style={[styles.conditionTag, { backgroundColor: conditionColor + "20" }]}>
              <Text style={[styles.conditionTagText, { color: conditionColor }]}>{product.condition}</Text>
            </View>
            {product.status !== "active" && (
              <View style={[styles.soldTag, { backgroundColor: colors.muted }]}>
                <Text style={[styles.soldTagText, { color: colors.mutedForeground }]}>
                  {product.status === "sold" ? "SOLD" : "PENDING"}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.productTitle, { color: colors.foreground }]}>{product.title}</Text>
          <Text style={[styles.price, { color: colors.primary }]}>${product.price}</Text>

          {/* Meta info */}
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={14} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{product.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="clock" size={14} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{timeAgo(product.createdAt)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="eye" size={14} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{product.views} views</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Description</Text>
            <Text style={[styles.description, { color: colors.foreground }]}>{product.description}</Text>
          </View>

          {/* Seller */}
          <View style={[styles.sellerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Seller</Text>
            <Pressable
              style={styles.sellerRow}
              onPress={() => router.push(`/reviews/${product.sellerId}` as never)}
            >
              <View style={[styles.sellerAvatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.sellerAvatarText}>{product.sellerName[0].toUpperCase()}</Text>
              </View>
              <View style={styles.sellerInfo}>
                <Text style={[styles.sellerName, { color: colors.foreground }]}>{product.sellerName}</Text>
                <View style={styles.ratingRow}>
                  <Feather name="star" size={13} color={colors.star} />
                  <Text style={[styles.ratingText, { color: colors.foreground }]}>
                    {product.sellerRating > 0 ? product.sellerRating.toFixed(1) : "New seller"}
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {/* Owner actions */}
          {isOwner && (
            <View style={styles.ownerActions}>
              <Pressable
                style={[styles.ownerBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
                onPress={() => {}}
              >
                <Feather name="edit-2" size={16} color={colors.foreground} />
                <Text style={[styles.ownerBtnText, { color: colors.foreground }]}>Edit</Text>
              </Pressable>
              <Pressable
                style={[styles.ownerBtn, { borderColor: colors.destructive, backgroundColor: "#FEF2F2" }]}
                onPress={handleDelete}
              >
                <Feather name="trash-2" size={16} color={colors.destructive} />
                <Text style={[styles.ownerBtnText, { color: colors.destructive }]}>Delete</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom actions */}
      {!isOwner && product.status === "active" && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16),
            },
          ]}
        >
          <Pressable
            style={[styles.chatBtn, { borderColor: colors.primary }]}
            onPress={handleChat}
          >
            <Feather name="message-circle" size={20} color={colors.primary} />
            <Text style={[styles.chatBtnText, { color: colors.primary }]}>Chat</Text>
          </Pressable>
          <Pressable
            style={[styles.buyBtn, { backgroundColor: colors.primary }]}
            onPress={handleBuy}
          >
            <Feather name="shopping-bag" size={20} color={colors.primaryForeground} />
            <Text style={[styles.buyBtnText, { color: colors.primaryForeground }]}>Buy Now</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontSize: 18, fontWeight: "600" as const },
  backLink: { fontSize: 16 },
  imageContainer: { width: "100%", height: 320, position: "relative", alignItems: "center", justifyContent: "center" },
  mainImage: { width: "100%", height: "100%", resizeMode: "cover" },
  imagePlaceholder: { alignItems: "center", gap: 12 },
  imagePlaceholderText: { fontSize: 14 },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  favBtn: {
    position: "absolute",
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  content: { padding: 16, gap: 16 },
  tagRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  categoryTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  categoryTagText: { fontSize: 12, fontWeight: "600" as const },
  conditionTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  conditionTagText: { fontSize: 12, fontWeight: "600" as const },
  soldTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  soldTagText: { fontSize: 12, fontWeight: "700" as const, letterSpacing: 0.5 },
  productTitle: { fontSize: 22, fontWeight: "700" as const, lineHeight: 28 },
  price: { fontSize: 28, fontWeight: "800" as const },
  meta: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", gap: 4, alignItems: "center" },
  metaText: { fontSize: 13 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700" as const },
  description: { fontSize: 15, lineHeight: 22 },
  sellerCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  sellerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  sellerAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  sellerAvatarText: { fontSize: 18, fontWeight: "700" as const, color: "#fff" },
  sellerInfo: { flex: 1, gap: 3 },
  sellerName: { fontSize: 15, fontWeight: "600" as const },
  ratingRow: { flexDirection: "row", gap: 4, alignItems: "center" },
  ratingText: { fontSize: 13 },
  ownerActions: { flexDirection: "row", gap: 12 },
  ownerBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  ownerBtnText: { fontSize: 14, fontWeight: "600" as const },
  bottomBar: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  chatBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  chatBtnText: { fontSize: 16, fontWeight: "600" as const },
  buyBtn: {
    flex: 2,
    flexDirection: "row",
    gap: 6,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buyBtnText: { fontSize: 16, fontWeight: "700" as const },
  star: { fontSize: 14 },
});
