import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";

type Props = {
  shopping: number;
  food: number;
  bills: number;
};

export default function DonutChart({ shopping, bills, food }: Props) {
  const total = shopping + bills + food;

  if (total === 0) {
    return (
      <View style={styles.container}>
        <Text>Tidak ada pengeluaran</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <AnimatedCircularProgress
          size={180}
          width={18}
          fill={100}
          tintColor="#e0e0e0"
          backgroundColor="transparent"
        />

        <AnimatedCircularProgress
          size={180}
          width={18}
          fill={(shopping / total) * 100}
          tintColor="#ff7aa8"
          backgroundColor="transparent"
          rotation={0}
          lineCap="round"
          style={StyleSheet.absoluteFill}
        />

        <AnimatedCircularProgress
          size={180}
          width={18}
          fill={(bills / total) * 100}
          tintColor="#ffe47a"
          backgroundColor="transparent"
          rotation={(shopping / total) * 360}
          lineCap="round"
          style={StyleSheet.absoluteFill}
        />

        <AnimatedCircularProgress
          size={180}
          width={18}
          fill={(food / total) * 100}
          tintColor="#7acbff"
          backgroundColor="transparent"
          rotation={((shopping + bills) / total) * 360}
          lineCap="round"
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.centerText}>
          <Text style={styles.expense}>Pengeluaran</Text>
          <Text style={styles.days}>30 Hari Terakhir</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 50,
  },
  chartWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  centerText: {
    position: "absolute",
    alignItems: "center",
  },
  expense: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  days: {
    fontSize: 12,
    color: "#777",
  },
});
