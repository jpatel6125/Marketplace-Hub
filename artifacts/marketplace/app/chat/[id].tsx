import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function ChatRoomScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { chatRooms, currentUser, sendMessage } = useApp();
  const [text, setText] = useState("");
  const flatRef = useRef<FlatList>(null);

  const room = chatRooms.find((r) => r.id === id);

  if (!room) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Conversation not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const handleSend = () => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(room.id, text.trim());
    setText("");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12),
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.headerBack}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={[styles.headerAvatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.headerAvatarText}>{room.otherUserName[0].toUpperCase()}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: colors.foreground }]}>{room.otherUserName}</Text>
          <Text style={[styles.headerProduct, { color: colors.primary }]} numberOfLines={1}>
            {room.productTitle} · ${room.productPrice}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push(`/product/${room.productId}` as never)}
          style={[styles.headerProductBtn, { backgroundColor: colors.accent }]}
        >
          <Feather name="package" size={16} color={colors.primary} />
        </Pressable>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={room.messages}
        keyExtractor={(m) => m.id}
        inverted={false}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: false })}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <View style={[styles.emptyChatIcon, { backgroundColor: colors.accent }]}>
              <Feather name="message-circle" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.emptyChatText, { color: colors.mutedForeground }]}>
              Start the conversation! Ask about the item or make an offer.
            </Text>
          </View>
        }
        renderItem={({ item: msg }) => {
          const isMine = msg.senderId === currentUser?.id;
          return (
            <View style={[styles.bubbleWrapper, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
              <View
                style={[
                  styles.bubble,
                  isMine
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
                ]}
              >
                <Text style={[styles.bubbleText, { color: isMine ? "#fff" : colors.foreground }]}>
                  {msg.text}
                </Text>
              </View>
              <Text style={[styles.bubbleTime, { color: colors.mutedForeground }]}>
                {formatTime(msg.timestamp)}
              </Text>
            </View>
          );
        }}
      />

      {/* Input */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 8),
          },
        ]}
      >
        <View style={[styles.inputBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.mutedForeground}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
        </View>
        <Pressable
          onPress={handleSend}
          style={[
            styles.sendBtn,
            { backgroundColor: text.trim() ? colors.primary : colors.muted },
          ]}
        >
          <Feather name="send" size={18} color={text.trim() ? "#fff" : colors.mutedForeground} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontSize: 18, fontWeight: "600" as const },
  backLink: { fontSize: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerBack: { padding: 4 },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: { fontSize: 16, fontWeight: "700" as const, color: "#fff" },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: "600" as const },
  headerProduct: { fontSize: 12 },
  headerProductBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  messagesList: { paddingHorizontal: 16, paddingVertical: 16, gap: 8 },
  emptyChat: { alignItems: "center", gap: 12, paddingTop: 40, paddingHorizontal: 32 },
  emptyChatIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyChatText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  bubbleWrapper: { gap: 3 },
  bubbleMine: { alignItems: "flex-end" },
  bubbleTheirs: { alignItems: "flex-start" },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  bubbleTime: { fontSize: 11, marginHorizontal: 4 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  inputBox: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 120,
  },
  input: { fontSize: 15, lineHeight: 20 },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
