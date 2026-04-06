import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function ReviewsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { reviews, currentUser, addReview } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [comment, setComment] = useState("");

  const userReviews = reviews.filter((r) => r.targetUserId === userId);
  const avgRating = userReviews.length
    ? userReviews.reduce((a, b) => a + b.rating, 0) / userReviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: userReviews.filter((r) => r.rating === star).length,
  }));

  const handleSubmitReview = () => {
    if (!currentUser) {
      router.push("/auth/login" as never);
      return;
    }
    if (!comment.trim()) {
      Alert.alert("Add a comment", "Please write a comment for your review.");
      return;
    }
    addReview({
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      targetUserId: userId ?? "",
      orderId: Date.now().toString(),
      rating: newRating,
      comment: comment.trim(),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowForm(false);
    setComment("");
    setNewRating(5);
    Alert.alert("Review submitted!", "Thank you for your feedback.");
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
          paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24),
        },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Ratings & Reviews</Text>
      </View>

      {/* Summary */}
      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.summaryLeft}>
          <Text style={[styles.avgScore, { color: colors.foreground }]}>
            {avgRating > 0 ? avgRating.toFixed(1) : "—"}
          </Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Feather
                key={s}
                name="star"
                size={16}
                color={s <= Math.round(avgRating) ? colors.star : colors.muted}
              />
            ))}
          </View>
          <Text style={[styles.reviewCount, { color: colors.mutedForeground }]}>
            {userReviews.length} {userReviews.length === 1 ? "review" : "reviews"}
          </Text>
        </View>
        <View style={styles.summaryBars}>
          {ratingCounts.map(({ star, count }) => {
            const pct = userReviews.length > 0 ? (count / userReviews.length) * 100 : 0;
            return (
              <View key={star} style={styles.barRow}>
                <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{star}</Text>
                <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
                  <View style={[styles.barFill, { backgroundColor: colors.star, width: `${pct}%` as unknown as number }]} />
                </View>
                <Text style={[styles.barCount, { color: colors.mutedForeground }]}>{count}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Write review btn */}
      {currentUser && userId !== currentUser.id && (
        <Pressable
          style={[styles.writeReviewBtn, { borderColor: colors.primary, backgroundColor: showForm ? colors.accent : "transparent" }]}
          onPress={() => setShowForm(!showForm)}
        >
          <Feather name="edit-3" size={16} color={colors.primary} />
          <Text style={[styles.writeReviewText, { color: colors.primary }]}>
            {showForm ? "Cancel Review" : "Write a Review"}
          </Text>
        </Pressable>
      )}

      {/* Review form */}
      {showForm && (
        <View style={[styles.reviewForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.formLabel, { color: colors.foreground }]}>Your Rating</Text>
          <View style={styles.starsInteractive}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Pressable
                key={s}
                onPress={() => {
                  setNewRating(s);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Feather
                  name="star"
                  size={32}
                  color={s <= newRating ? colors.star : colors.muted}
                />
              </Pressable>
            ))}
          </View>
          <Text style={[styles.formLabel, { color: colors.foreground }]}>Comment</Text>
          <TextInput
            style={[styles.commentInput, { borderColor: colors.border, backgroundColor: colors.background, color: colors.foreground }]}
            placeholder="Share your experience with this seller..."
            placeholderTextColor={colors.mutedForeground}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <Pressable
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            onPress={handleSubmitReview}
          >
            <Text style={[styles.submitBtnText, { color: colors.primaryForeground }]}>Submit Review</Text>
          </Pressable>
        </View>
      )}

      {/* Review list */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        {userReviews.length === 0 ? "No reviews yet" : "Reviews"}
      </Text>

      {userReviews.map((review) => (
        <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.reviewHeader}>
            <View style={[styles.reviewAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.reviewAvatarText}>{review.reviewerName[0].toUpperCase()}</Text>
            </View>
            <View style={styles.reviewMeta}>
              <Text style={[styles.reviewerName, { color: colors.foreground }]}>{review.reviewerName}</Text>
              <Text style={[styles.reviewDate, { color: colors.mutedForeground }]}>{timeAgo(review.createdAt)}</Text>
            </View>
            <View style={styles.reviewStars}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Feather
                  key={s}
                  name="star"
                  size={12}
                  color={s <= review.rating ? colors.star : colors.muted}
                />
              ))}
            </View>
          </View>
          <Text style={[styles.reviewComment, { color: colors.foreground }]}>{review.comment}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, gap: 14 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800" as const },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  summaryLeft: { alignItems: "center", gap: 4, minWidth: 80 },
  avgScore: { fontSize: 40, fontWeight: "800" as const, lineHeight: 44 },
  starsRow: { flexDirection: "row", gap: 2 },
  reviewCount: { fontSize: 12 },
  summaryBars: { flex: 1, gap: 5 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  barLabel: { fontSize: 12, width: 10, textAlign: "right" },
  barTrack: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 3 },
  barCount: { fontSize: 11, width: 16 },
  writeReviewBtn: {
    flexDirection: "row",
    gap: 8,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  writeReviewText: { fontSize: 14, fontWeight: "600" as const },
  reviewForm: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  formLabel: { fontSize: 14, fontWeight: "600" as const },
  starsInteractive: { flexDirection: "row", gap: 8 },
  commentInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
  },
  submitBtn: { height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  submitBtnText: { fontSize: 15, fontWeight: "700" as const },
  sectionTitle: { fontSize: 17, fontWeight: "700" as const },
  reviewCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  reviewHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  reviewAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  reviewAvatarText: { fontSize: 15, fontWeight: "700" as const, color: "#fff" },
  reviewMeta: { flex: 1 },
  reviewerName: { fontSize: 14, fontWeight: "600" as const },
  reviewDate: { fontSize: 12 },
  reviewStars: { flexDirection: "row", gap: 2 },
  reviewComment: { fontSize: 14, lineHeight: 20 },
});
