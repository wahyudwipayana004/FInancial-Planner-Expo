import BalanceCard from "@/components/balancecard";
import DonutChart from "@/components/donutchart";
import React, { useState, useEffect, useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authFetch } from "@/utils/authFetch";
import { useFocusEffect } from "expo-router";
import { Image } from "react-native";

export default function Index() {
  const [expenses, setExpenses] = useState({
    shopping: 0,
    food: 0,
    bills: 0,
  });

  type ExpenseItem = {
    category: "shopping" | "food" | "bills";
    total: number;
  };

  // FETCH EXPENSES
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await authFetch(
          "http://localhost:3000/wallet/expenses-by-category",
        );
        const data: ExpenseItem[] = await res.json();

        const mapped: Record<"shopping" | "food" | "bills", number> = {
          shopping: 0,
          food: 0,
          bills: 0,
        };

        data.forEach((item) => {
          mapped[item.category] = Number(item.total);
        });

        setExpenses(mapped);
      } catch (err) {
        console.error("DONUT FETCH ERROR:", err);
      }
    };

    fetchExpenses();
  }, []);

  // BALANCE STATE
  const [balance, setBalance] = useState(0);

  const fetchBalance = async () => {
    try {
      const res = await authFetch("http://localhost:3000/wallet/summary");
      const data = await res.json();
      setBalance(Number(data.balance));
    } catch (err) {
      console.error("BALANCE FETCH ERROR:", err);
    }
  };

  // ✅ REFRESH BALANCE WHEN SCREEN FOCUSED
  useFocusEffect(
    useCallback(() => {
      fetchBalance();
    }, []),
  );

  // RECOMMENDATION LOGIC
  const getRecommendation = () => {
    const entries = Object.entries(expenses);
    if (entries.every(([, value]) => value === 0)) {
      return "Belum ada data pengeluaran.";
    }

    const [highestCategory] = entries.reduce((max, current) =>
      current[1] > max[1] ? current : max,
    );

    switch (highestCategory) {
      case "shopping":
        return "Kurangi pengeluaran membeli barang yang tidak penting.";
      case "food":
        return "Coba atur budget makan dan kurangi jajan berlebihan.";
      case "bills":
        return "Periksa tagihan bulanan dan cari cara menghemat.";
      default:
        return "";
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#a1849dff" }}>
      <ScrollView style={styles.container}>
        <BalanceCard balance={balance} />
        <Text style={styles.overview}>Overview</Text>
        <View style={styles.chartcard}>
          <DonutChart
            shopping={expenses.shopping}
            food={expenses.food}
            bills={expenses.bills}
          />

          <View style={styles.categoriesContainer}>
            <View style={styles.categoryRow}>
              <View style={[styles.dot, { backgroundColor: "#ff7aa8" }]} />
              <Text style={styles.categoryLabel}>Shopping</Text>
              <Text style={styles.categoryValue}>
                Rp {expenses.shopping.toLocaleString()}
              </Text>
            </View>

            <View style={styles.categoryRow}>
              <View style={[styles.dot, { backgroundColor: "#ffe47a" }]} />
              <Text style={styles.categoryLabel}>Bayar Bulanan</Text>
              <Text style={styles.categoryValue}>
                Rp {expenses.bills.toLocaleString()}
              </Text>
            </View>

            <View style={styles.categoryRow}>
              <View style={[styles.dot, { backgroundColor: "#7acbff" }]} />
              <Text style={styles.categoryLabel}>Makanan</Text>
              <Text style={styles.categoryValue}>
                Rp {expenses.food.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.containerRek}>
          <Text style={styles.rekomendasi}>Rekomendasi</Text>
          <Text style={styles.rekomendasiDetail}>{getRecommendation()}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overview: {
    padding: 10,
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 20,
    color: "#650d50ff",
  },

  chartcard: {
    backgroundColor: "#ffffffff",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 3,
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAF9",
    padding: 20,
  },
  categoriesContainer: {
    marginTop: 25,
    width: "100%",
    paddingHorizontal: 10,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 6,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  categoryLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  categoryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  containerRek: {
    backgroundColor: "#ffffffff",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 3,
    padding: 15,
    borderRadius: 20,
    marginTop: 5,
    marginBottom: 30,
  },
  rekomendasi: {
    padding: 10,
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 20,
    color: "#650d50ff",
  },
  rekomendasiDetail: {
    paddingLeft: 10,
    marginBottom: 50,
    fontSize: 15,
  },
});

//logo: {
//   alignItems: "center",
//  justifyContent: "center",
//  marginTop: 0,
//},

// logoImage: {
//  width: 120,
//  height: 120,
//  bottom: 40,
//  resizeMode: "contain",
//},
