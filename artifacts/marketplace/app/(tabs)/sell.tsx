import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
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
import { useApp, type Product } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const CONDITIONS: Product["condition"][] = ["New", "Like New", "Good", "Fair", "Poor"];

export default function SellScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addProduct, currentUser, isLoggedIn } = useApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [condition, setCondition] = useState<Product["condition"]>("Good");
  const [location, setLocation] = useState(currentUser?.location ?? "");
  const [loading, setLoading] = useState(false);

  if (!isLoggedIn) {
    return (
      <View style={[styles.authContainer, { backgroundColor: colors.background }]}>
        <Feather name="tag" size={48} color={colors.mutedForeground} />
        <Text style={[styles.authTitle, { color: colors.foreground }]}>Start Selling</Text>
        <Text style={[styles.authText, { color: colors.mutedForeground }]}>
          Sign in to list your items and reach thousands of buyers
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

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !price.trim() || !location.trim()) {
      Alert.alert("Missing fields", "Please fill in all required fields.");
      return;
    }
    const priceVal = parseFloat(price);
    if (isNaN(priceVal) || priceVal <= 0) {
      Alert.alert("Invalid price", "Please enter a valid price.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    addProduct({
      title: title.trim(),
      description: description.trim(),
      price: priceVal,
      category,
      condition,
      location: location.trim(),
      images: [],
      status: "active",
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoading(false);
    Alert.alert("Listed!", "Your item is now live.", [
      { text: "View Feed", onPress: () => router.replace("/(tabs)/home" as never) },
    ]);
    setTitle("");
    setDescription("");
    setPrice("");
    setLocation(currentUser?.location ?? "");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 100),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: colors.foreground }]}>List an Item</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Fill in the details to create your listing
        </Text>

        {/* Image placeholder */}
        <Pressable
          style={[styles.imageUpload, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Feather name="camera" size={28} color={colors.mutedForeground} />
          <Text style={[styles.imageUploadText, { color: colors.mutedForeground }]}>
            Add up to 5 photos
          </Text>
          <Text style={[styles.imageUploadSub, { color: colors.mutedForeground }]}>
            Tap to choose from library
          </Text>
        </Pressable>

        <View style={styles.form}>
          {/* Title */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Title *</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]}
              placeholder="What are you selling?"
              placeholderTextColor={colors.mutedForeground}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Description *</Text>
            <TextInput
              style={[
                styles.input,
                styles.textarea,
                { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground },
              ]}
              placeholder="Describe your item, include condition details, dimensions, etc."
              placeholderTextColor={colors.mutedForeground}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Price */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Price *</Text>
            <View style={[styles.priceBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={[styles.priceCurr, { color: colors.mutedForeground }]}>$</Text>
              <TextInput
                style={[styles.priceInput, { color: colors.foreground }]}
                placeholder="0.00"
                placeholderTextColor={colors.mutedForeground}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                <CategoryPill
                  key={cat}
                  label={cat}
                  selected={category === cat}
                  onPress={() => setCategory(cat)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Condition */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Condition</Text>
            <View style={styles.conditionRow}>
              {CONDITIONS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCondition(c)}
                  style={[
                    styles.conditionBtn,
                    {
                      backgroundColor: condition === c ? colors.primary : colors.card,
                      borderColor: condition === c ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.conditionText,
                      { color: condition === c ? colors.primaryForeground : colors.foreground },
                    ]}
                  >
                    {c}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Location */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.foreground }]}>Location *</Text>
            <View style={[styles.locationBox, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Feather name="map-pin" size={18} color={colors.mutedForeground} />
              <TextInput
                style={[styles.locationInput, { color: colors.foreground }]}
                placeholder="City, State"
                placeholderTextColor={colors.mutedForeground}
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>
        </View>

        <Pressable
          style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Feather name="check-circle" size={20} color={colors.primaryForeground} />
          <Text style={[styles.submitBtnText, { color: colors.primaryForeground }]}>
            {loading ? "Publishing..." : "Publish Listing"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  authContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  authTitle: { fontSize: 24, fontWeight: "700" as const },
  authText: { fontSize: 15, textAlign: "center" },
  authBtn: { height: 50, paddingHorizontal: 32, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 8 },
  authBtnText: { fontSize: 16, fontWeight: "700" as const },
  title: { fontSize: 28, fontWeight: "800" as const, marginBottom: 4, letterSpacing: -0.3 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  imageUpload: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    height: 120,
    marginBottom: 20,
    gap: 6,
  },
  imageUploadText: { fontSize: 15, fontWeight: "600" as const },
  imageUploadSub: { fontSize: 12 },
  form: { gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600" as const },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textarea: { height: 100, paddingTop: 12 },
  priceBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    gap: 4,
  },
  priceCurr: { fontSize: 18, fontWeight: "600" as const },
  priceInput: { flex: 1, fontSize: 18, fontWeight: "600" as const },
  conditionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  conditionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  conditionText: { fontSize: 13, fontWeight: "500" as const },
  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  locationInput: { flex: 1, fontSize: 15 },
  submitBtn: {
    flexDirection: "row",
    gap: 8,
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  submitBtnText: { fontSize: 16, fontWeight: "700" as const },
});
