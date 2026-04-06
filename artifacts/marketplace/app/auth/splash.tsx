import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function SplashScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <View style={[styles.top, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 60) }]}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
        />
        <Text style={styles.brand}>SwapSpace</Text>
        <Text style={styles.tagline}>Buy & sell with people near you</Text>
      </View>

      <View style={styles.middle}>
        <Image
          source={require("../../assets/images/onboarding.png")}
          style={styles.hero}
          resizeMode="contain"
        />
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20) }]}>
        <View style={styles.features}>
          {[
            { icon: "search", label: "Discover items near you" },
            { icon: "message-circle", label: "Chat directly with sellers" },
            { icon: "shield", label: "Safe & secure transactions" },
          ].map((f) => (
            <View key={f.icon} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Feather name={f.icon as "search"} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.featureText, { color: colors.primaryForeground }]}>{f.label}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={[styles.btn, { backgroundColor: colors.card }]}
          onPress={() => router.push("/auth/signup" as never)}
        >
          <Text style={[styles.btnText, { color: colors.primary }]}>Get Started</Text>
        </Pressable>

        <Pressable
          style={[styles.btnOutline, { borderColor: "rgba(255,255,255,0.4)" }]}
          onPress={() => router.push("/auth/login" as never)}
        >
          <Text style={[styles.btnOutlineText, { color: colors.primaryForeground }]}>
            I already have an account
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  top: {
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginBottom: 4,
  },
  brand: {
    fontSize: 36,
    fontWeight: "800" as const,
    color: "#fff",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  middle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  hero: {
    width: "100%",
    height: 280,
  },
  bottom: {
    paddingHorizontal: 24,
    gap: 12,
  },
  features: {
    gap: 12,
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 15,
    fontWeight: "500" as const,
  },
  btn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  btnOutline: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  btnOutlineText: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
});
