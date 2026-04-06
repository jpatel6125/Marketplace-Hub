import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function StarRating({ rating, size = 16, interactive, onRate }: Props) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(rating);
        if (interactive) {
          return (
            <Pressable key={star} onPress={() => onRate?.(star)} style={{ padding: 2 }}>
              <View style={[styles.star, { width: size + 4, height: size + 4 }]}>
                <View
                  style={[
                    styles.starShape,
                    {
                      width: size,
                      height: size,
                      backgroundColor: filled ? colors.star : colors.muted,
                    },
                  ]}
                />
              </View>
            </Pressable>
          );
        }
        return (
          <View
            key={star}
            style={[
              styles.dot,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: filled ? colors.star : colors.muted,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 3,
    alignItems: "center",
  },
  dot: {},
  star: {
    alignItems: "center",
    justifyContent: "center",
  },
  starShape: {
    borderRadius: 3,
  },
});
