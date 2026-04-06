import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { useApp, type Order } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const STATUS_FLOW: Order["status"][] = ["pending", "paid", "shipped", "completed"];

function getNextStatus(current: Order["status"]): Order["status"] | null {
  const idx = STATUS_FLOW.indexOf(current);
  if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { orders, currentUser, updateOrderStatus, addReview } = useApp();

  if (!currentUser) {
    return (
      <View style={[styles.authContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.authTitle, { color: colors.foreground }]}>My Orders</Text>
        <Pressable style={[styles.authBtn, { backgroundColor: colors.primary }]} onPress={() => router.push("/auth/login" as never)}>
          <Text style={[styles.authBtnText, { color: colors.primaryForeground }]}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  const handleAdvance = (order: Order) => {
    const next = getNextStatus(order.status);
    if (!next) return;
    const labels: Record<Order["status"], string> = {
      pending: "Mark as Paid",
      paid: "Mark as Shipped",
      shipped: "Mark as Completed",
      completed: "",
      cancelled: "",
    };
    Alert.alert(labels[order.status], "Update this order's status?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: () => {
          updateOrderStatus(order.id, next);
          if (next === "completed") {
            Alert.alert(
              "Leave a Review",
              "Would you like to leave a review for this transaction?",
              [
                { text: "Later", style: "cancel" },
                {
                  text: "Leave Review",
                  onPress: () => {
                    addReview({
                      reviewerId: currentUser.id,
                      reviewerName: currentUser.name,
                      targetUserId: order.isBuyer ? order.sellerId : order.buyerId,
                      orderId: order.id,
                      rating: 5,
                      comment: "Great transaction!",
                    });
                    Alert.alert("Review submitted!", "Thanks for your feedback.");
                  },
                },
              ]
            );
          }
        },
      },
    ]);
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
    >
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.muted }]}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>My Orders</Text>
      </View>

      {orders.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="shopping-bag" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No orders yet</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Your purchase and sale history will appear here
          </Text>
        </View>
      ) : (
        orders.map((order) => {
          const canAdvance = !order.isBuyer && order.status !== "completed" && order.status !== "cancelled";
          const isBuyerCompleted = order.isBuyer && order.status === "shipped";
          const next = getNextStatus(order.status);
          return (
            <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.orderTop}>
                <View style={styles.orderItemInfo}>
                  <View style={[styles.orderImagePlaceholder, { backgroundColor: colors.muted }]}>
                    <Feather name="package" size={20} color={colors.mutedForeground} />
                  </View>
                  <View style={styles.orderMeta}>
                    <Text style={[styles.orderTitle, { color: colors.foreground }]} numberOfLines={2}>
                      {order.productTitle}
                    </Text>
                    <Text style={[styles.orderPrice, { color: colors.primary }]}>${order.productPrice}</Text>
                    <Text style={[styles.orderParty, { color: colors.mutedForeground }]}>
                      {order.isBuyer ? `Seller: ${order.sellerName}` : `Buyer: ${order.buyerName}`}
                    </Text>
                  </View>
                </View>
                <OrderStatusBadge status={order.status} />
              </View>

              <View style={[styles.orderDivider, { backgroundColor: colors.border }]} />

              <View style={styles.orderBottom}>
                <Text style={[styles.orderDate, { color: colors.mutedForeground }]}>
                  {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </Text>
                <View style={styles.orderActions}>
                  {(canAdvance || isBuyerCompleted) && next && (
                    <Pressable
                      style={[styles.advanceBtn, { backgroundColor: colors.primary }]}
                      onPress={() => handleAdvance(order)}
                    >
                      <Text style={[styles.advanceBtnText, { color: colors.primaryForeground }]}>
                        {canAdvance
                          ? { pending: "Mark Paid", paid: "Mark Shipped", shipped: "Mark Complete", completed: "", cancelled: "" }[order.status]
                          : "Confirm Receipt"}
                      </Text>
                    </Pressable>
                  )}
                  {order.status === "completed" && (
                    <Pressable
                      style={[styles.reviewBtn, { borderColor: colors.star }]}
                      onPress={() => router.push(`/reviews/${order.isBuyer ? order.sellerId : order.buyerId}` as never)}
                    >
                      <Feather name="star" size={14} color={colors.star} />
                      <Text style={[styles.reviewBtnText, { color: colors.star }]}>Review</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  authContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  authTitle: { fontSize: 24, fontWeight: "700" as const },
  authBtn: { height: 50, paddingHorizontal: 32, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  authBtnText: { fontSize: 16, fontWeight: "700" as const },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "800" as const },
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
  orderCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
  },
  orderTop: {
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  orderItemInfo: { flex: 1, flexDirection: "row", gap: 12 },
  orderImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  orderMeta: { flex: 1, gap: 3 },
  orderTitle: { fontSize: 14, fontWeight: "600" as const, lineHeight: 20 },
  orderPrice: { fontSize: 16, fontWeight: "700" as const },
  orderParty: { fontSize: 12 },
  orderDivider: { height: 1, marginHorizontal: 14 },
  orderBottom: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderDate: { fontSize: 12 },
  orderActions: { flexDirection: "row", gap: 8 },
  advanceBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  advanceBtnText: { fontSize: 12, fontWeight: "600" as const },
  reviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  reviewBtnText: { fontSize: 12, fontWeight: "600" as const },
});
