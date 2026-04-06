import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useColors } from "@/hooks/useColors";

export const CATEGORIES = [
  "All",
  "Electronics",
  "Clothing",
  "Furniture",
  "Sports",
  "Books",
  "Home & Garden",
  "Toys",
  "Vehicles",
  "Other",
];

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default function CategoryPill({ label, selected, onPress }: Props) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pill,
        {
          backgroundColor: selected ? colors.primary : colors.card,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: selected ? colors.primaryForeground : colors.foreground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: "500" as const,
  },
});
