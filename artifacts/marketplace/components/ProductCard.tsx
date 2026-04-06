import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useApp, type Product } from "@/context/AppContext";
import productImageMap from "@/constants/productImages";
import { useColors } from "@/hooks/useColors";

interface Props {
  product: Product;
  horizontal?: boolean;
}

export default function ProductCard({ product, horizontal }: Props) {
  const colors = useColors();
  const router = useRouter();
  const { toggleFavorite, favorites, currentUser } = useApp();
  const isFav = favorites.includes(product.id);

  const handleFav = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(product.id);
  };

  const conditionColor = {
    "New": colors.success,
    "Like New": colors.success,
    "Good": colors.info,
    "Fair": colors.warning,
    "Poor": colors.destructive,
  }[product.condition] ?? colors.mutedForeground;

  const localImg = productImageMap[product.id];

  if (horizontal) {
    return (
      <Pressable
        style={[styles.hCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push(`/product/${product.id}` as never)}
      >
        <View style={[styles.hImageBox, { backgroundColor: colors.muted }]}>
          {localImg ? (
            <Image source={localImg} style={styles.hImage} />
          ) : product.images[0] ? (
            <Image source={{ uri: product.images[0] }} style={styles.hImage} />
          ) : (
            <Feather name="image" size={28} color={colors.mutedForeground} />
          )}
        </View>
        <View style={styles.hInfo}>
          <Text style={[styles.hTitle, { color: colors.foreground }]} numberOfLines={2}>{product.title}</Text>
          <Text style={[styles.hPrice, { color: colors.primary }]}>${product.price}</Text>
          <View style={styles.hMeta}>
            <View style={[styles.conditionBadge, { backgroundColor: conditionColor + "20" }]}>
              <Text style={[styles.conditionText, { color: conditionColor }]}>{product.condition}</Text>
            </View>
            <Text style={[styles.hLocation, { color: colors.mutedForeground }]} numberOfLines={1}>
              <Feather name="map-pin" size={11} color={colors.mutedForeground} /> {product.location}
            </Text>
          </View>
        </View>
        {currentUser && (
          <Pressable onPress={handleFav} style={styles.hFav}>
            <Feather name={isFav ? "heart" : "heart"} size={18} color={isFav ? colors.destructive : colors.mutedForeground} />
          </Pressable>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/product/${product.id}` as never)}
    >
      <View style={[styles.imageBox, { backgroundColor: colors.muted }]}>
        {localImg ? (
          <Image source={localImg} style={styles.image} />
        ) : product.images[0] ? (
          <Image source={{ uri: product.images[0] }} style={styles.image} />
        ) : (
          <Feather name="image" size={36} color={colors.mutedForeground} />
        )}
        {currentUser && (
          <Pressable onPress={handleFav} style={[styles.favBtn, { backgroundColor: colors.card }]}>
            <Feather name="heart" size={16} color={isFav ? colors.destructive : colors.mutedForeground} />
          </Pressable>
        )}
        <View style={[styles.conditionPill, { backgroundColor: conditionColor }]}>
          <Text style={styles.conditionPillText}>{product.condition}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>{product.title}</Text>
        <Text style={[styles.price, { color: colors.primary }]}>${product.price}</Text>
        <View style={styles.footer}>
          <Feather name="map-pin" size={11} color={colors.mutedForeground} />
          <Text style={[styles.location, { color: colors.mutedForeground }]} numberOfLines={1}> {product.location}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 170,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  imageBox: {
    width: "100%",
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  favBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  conditionPill: {
    position: "absolute",
    bottom: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  conditionPillText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600" as const,
  },
  info: {
    padding: 10,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: "500" as const,
    lineHeight: 18,
  },
  price: {
    fontSize: 16,
    fontWeight: "700" as const,
    marginTop: 2,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  location: {
    fontSize: 11,
    flex: 1,
  },
  // Horizontal styles
  hCard: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
  },
  hImageBox: {
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  hImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  hInfo: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  hTitle: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  hPrice: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  hMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  conditionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  conditionText: {
    fontSize: 11,
    fontWeight: "600" as const,
  },
  hLocation: {
    fontSize: 11,
    flex: 1,
  },
  hFav: {
    padding: 12,
  },
});
