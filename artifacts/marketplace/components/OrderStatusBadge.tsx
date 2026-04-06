import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Order } from "@/context/AppContext";

const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Pending",
  paid: "Paid",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function OrderStatusBadge({ status }: { status: Order["status"] }) {
  const colors = useColors();
  const colorMap: Record<Order["status"], string> = {
    pending: colors.warning,
    paid: colors.info,
    shipped: colors.primary,
    completed: colors.success,
    cancelled: colors.mutedForeground,
  };
  const bg = colorMap[status];
  return (
    <View style={[styles.badge, { backgroundColor: bg + "20" }]}>
      <View style={[styles.dot, { backgroundColor: bg }]} />
      <Text style={[styles.text, { color: bg }]}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
});
