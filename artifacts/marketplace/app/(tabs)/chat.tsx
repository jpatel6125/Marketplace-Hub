import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { chatRooms, currentUser, isLoggedIn } = useApp();

  if (!isLoggedIn) {
    return (
      <View style={[styles.authContainer, { backgroundColor: colors.background }]}>
        <Feather name="message-circle" size={48} color={colors.mutedForeground} />
        <Text style={[styles.authTitle, { color: colors.foreground }]}>Your Messages</Text>
        <Text style={[styles.authText, { color: colors.mutedForeground }]}>
          Sign in to view your conversations with buyers and sellers
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
      <Text style={[styles.title, { color: colors.foreground }]}>Messages</Text>

      {chatRooms.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="message-circle" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No conversations yet</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Find a product you like and start chatting with the seller
          </Text>
        </View>
      ) : (
        chatRooms.map((room) => (
          <Pressable
            key={room.id}
            style={[styles.roomCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/chat/${room.id}` as never)}
          >
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {room.otherUserName[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.roomInfo}>
              <View style={styles.roomTop}>
                <Text style={[styles.roomName, { color: colors.foreground }]}>
                  {room.otherUserName}
                </Text>
                <Text style={[styles.roomTime, { color: colors.mutedForeground }]}>
                  {room.lastMessageTime ? timeAgo(room.lastMessageTime) : ""}
                </Text>
              </View>
              <Text style={[styles.roomProduct, { color: colors.primary }]} numberOfLines={1}>
                Re: {room.productTitle}
              </Text>
              <Text style={[styles.roomLast, { color: colors.mutedForeground }]} numberOfLines={1}>
                {room.lastMessage ?? "Start the conversation"}
              </Text>
            </View>
            {room.unreadCount > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.unreadText}>{room.unreadCount}</Text>
              </View>
            )}
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  authContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  authTitle: { fontSize: 24, fontWeight: "700" as const },
  authText: { fontSize: 15, textAlign: "center" },
  authBtn: { height: 50, paddingHorizontal: 32, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 8 },
  authBtnText: { fontSize: 16, fontWeight: "700" as const },
  title: { fontSize: 28, fontWeight: "800" as const, marginBottom: 16, letterSpacing: -0.3 },
  roomCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "700" as const, color: "#fff" },
  roomInfo: { flex: 1, gap: 3 },
  roomTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  roomName: { fontSize: 15, fontWeight: "600" as const },
  roomTime: { fontSize: 12 },
  roomProduct: { fontSize: 12, fontWeight: "500" as const },
  roomLast: { fontSize: 13 },
  unreadBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: { fontSize: 11, fontWeight: "700" as const, color: "#fff" },
  empty: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 40,
    alignItems: "center",
    gap: 12,
    marginTop: 24,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600" as const },
  emptyText: { fontSize: 14, textAlign: "center" },
});
