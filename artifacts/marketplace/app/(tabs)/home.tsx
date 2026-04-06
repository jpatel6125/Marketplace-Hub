import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CategoryPill, { CATEGORIES } from "@/components/CategoryPill";
import ProductCard from "@/components/ProductCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { products, currentUser } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.status === "active");
    if (selectedCategory !== "All") {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, selectedCategory, search]);

  const featured = useMemo(() => filtered.slice(0, 4), [filtered]);
  const recent = useMemo(() => filtered.slice(0), [filtered]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 90),
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Hello, {currentUser?.name?.split(" ")[0] ?? "there"} 👋
          </Text>
          <Text style={[styles.headline, { color: colors.foreground }]}>
            Find great deals
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/(tabs)/profile" as never)}
          style={[styles.avatarBox, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.avatarText}>
            {(currentUser?.name ?? "U")[0].toUpperCase()}
          </Text>
        </Pressable>
      </View>

      {/* Search */}
      <Pressable
        style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => router.push("/(tabs)/search" as never)}
      >
        <Feather name="search" size={18} color={colors.mutedForeground} />
        <Text style={[styles.searchPlaceholder, { color: colors.mutedForeground }]}>
          Search products, brands...
        </Text>
        <View style={[styles.searchFilter, { backgroundColor: colors.primary }]}>
          <Feather name="sliders" size={14} color="#fff" />
        </View>
      </Pressable>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
      >
        {CATEGORIES.map((cat) => (
          <CategoryPill
            key={cat}
            label={cat}
            selected={selectedCategory === cat}
            onPress={() => setSelectedCategory(cat)}
          />
        ))}
      </ScrollView>

      {/* Featured */}
      {featured.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Featured</Text>
            <Pressable onPress={() => router.push("/(tabs)/search" as never)}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          >
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Recent */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {selectedCategory === "All" ? "Recent Listings" : selectedCategory}
          </Text>
          <Text style={[styles.count, { color: colors.mutedForeground }]}>
            {filtered.length} items
          </Text>
        </View>
        {recent.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="package" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No listings in this category
            </Text>
          </View>
        ) : (
          recent.map((p) => <ProductCard key={p.id} product={p} horizontal />)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  greeting: { fontSize: 14 },
  headline: { fontSize: 24, fontWeight: "800" as const, letterSpacing: -0.3 },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "700" as const, color: "#fff" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  searchPlaceholder: { flex: 1, fontSize: 14 },
  searchFilter: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  categories: { paddingHorizontal: 16, paddingBottom: 8 },
  section: { marginTop: 8, marginBottom: 8 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" as const },
  seeAll: { fontSize: 14, fontWeight: "600" as const },
  count: { fontSize: 13 },
  featuredList: { paddingHorizontal: 16, gap: 12 },
  empty: {
    margin: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  emptyText: { fontSize: 15 },
});
