import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
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

const CONDITIONS = ["All", "New", "Like New", "Good", "Fair", "Poor"];

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { products } = useApp();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    let list = products.filter((p) => p.status === "active");
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== "All") {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (selectedCondition !== "All") {
      list = list.filter((p) => p.condition === selectedCondition);
    }
    if (minPrice) list = list.filter((p) => p.price >= parseFloat(minPrice));
    if (maxPrice) list = list.filter((p) => p.price <= parseFloat(maxPrice));
    return list;
  }, [products, query, selectedCategory, selectedCondition, minPrice, maxPrice]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 100 : 90),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Search</Text>

        {/* Search bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Search products..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
          />
          <Pressable
            onPress={() => setShowFilters(!showFilters)}
            style={[
              styles.filterBtn,
              { backgroundColor: showFilters ? colors.primary : colors.muted },
            ]}
          >
            <Feather name="sliders" size={16} color={showFilters ? "#fff" : colors.foreground} />
          </Pressable>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={[styles.filters, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.filterTitle, { color: colors.foreground }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: 8 }}>
              {CATEGORIES.map((cat) => (
                <CategoryPill
                  key={cat}
                  label={cat}
                  selected={selectedCategory === cat}
                  onPress={() => setSelectedCategory(cat)}
                />
              ))}
            </ScrollView>

            <Text style={[styles.filterTitle, { color: colors.foreground }]}>Condition</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: 8 }}>
              {CONDITIONS.map((c) => (
                <CategoryPill
                  key={c}
                  label={c}
                  selected={selectedCondition === c}
                  onPress={() => setSelectedCondition(c)}
                />
              ))}
            </ScrollView>

            <Text style={[styles.filterTitle, { color: colors.foreground }]}>Price Range</Text>
            <View style={styles.priceRow}>
              <View style={[styles.priceInput, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <Text style={[styles.priceCurr, { color: colors.mutedForeground }]}>$</Text>
                <TextInput
                  style={[styles.priceField, { color: colors.foreground }]}
                  placeholder="Min"
                  placeholderTextColor={colors.mutedForeground}
                  value={minPrice}
                  onChangeText={setMinPrice}
                  keyboardType="numeric"
                />
              </View>
              <Text style={[styles.priceDash, { color: colors.mutedForeground }]}>—</Text>
              <View style={[styles.priceInput, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <Text style={[styles.priceCurr, { color: colors.mutedForeground }]}>$</Text>
                <TextInput
                  style={[styles.priceField, { color: colors.foreground }]}
                  placeholder="Max"
                  placeholderTextColor={colors.mutedForeground}
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        )}

        {/* Results */}
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsCount, { color: colors.foreground }]}>
            {results.length} {results.length === 1 ? "result" : "results"}
          </Text>
        </View>

        {results.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="search" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No results found</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Try different keywords or adjust filters
            </Text>
          </View>
        ) : (
          results.map((p) => <ProductCard key={p.id} product={p} horizontal />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 16 },
  title: { fontSize: 28, fontWeight: "800" as const, paddingHorizontal: 16, marginBottom: 16, letterSpacing: -0.3 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  input: { flex: 1, fontSize: 15 },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filters: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    gap: 4,
  },
  filterTitle: { fontSize: 13, fontWeight: "600" as const, marginBottom: 6, marginTop: 4 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  priceInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  priceCurr: { fontSize: 14 },
  priceField: { flex: 1, fontSize: 14 },
  priceDash: { fontSize: 16 },
  resultsHeader: { paddingHorizontal: 16, marginBottom: 8 },
  resultsCount: { fontSize: 14, fontWeight: "600" as const },
  empty: {
    margin: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 40,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle: { fontSize: 17, fontWeight: "600" as const },
  emptyText: { fontSize: 14, textAlign: "center" },
});
