import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useCallback } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "@/config/api";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Wallet() {
  const [wallet, setWallet] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });

  const [totalSavings, setTotalSavings] = useState(0);

  const getAuthHeader = async () => {
    const token = await AsyncStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchWallet = async () => {
    try {
      const headers = await getAuthHeader();

      const res = await fetch(`${API_URL}/wallet/summary`, { headers });
      const data = await res.json();

      setWallet({
        income: Number(data.income) || 0,
        expense: Number(data.expense) || 0,
        balance: Number(data.balance) || 0,
      });

      setTotalSavings(Number(data.totalSavings) || 0);
    } catch (err) {
      console.error("Failed to fetch wallet summary", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWallet();
    }, []),
  );

  /* ======================
     MODAL & INPUT
     ====================== */
  const [modalVisible, setModalVisible] = useState(false);

  const [incomeInput, setIncomeInput] = useState("");
  const [shoppingInput, setShoppingInput] = useState("");
  const [billsInput, setBillsInput] = useState("");
  const [foodInput, setFoodInput] = useState("");

  /* ======================
     HELPERS
     ====================== */
  const formatRupiah = (value: string) => {
    const number = value.replace(/[^0-9]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  /* ======================
     SUBMIT TRANSACTIONS
     ====================== */
  const submit = async () => {
    const income = parseInt(incomeInput) || 0;
    const shopping = parseInt(shoppingInput) || 0;
    const bills = parseInt(billsInput) || 0;
    const food = parseInt(foodInput) || 0;

    const headers = await getAuthHeader();

    const transactions = [
      income > 0 && {
        type: "pemasukan",
        amount: income,
      },
      shopping > 0 && {
        type: "pengeluaran",
        category: "shopping",
        amount: shopping,
      },
      bills > 0 && {
        type: "pengeluaran",
        category: "bills",
        amount: bills,
      },
      food > 0 && {
        type: "pengeluaran",
        category: "food",
        amount: food,
      },
    ].filter(Boolean);

    try {
      await Promise.all(
        transactions.map((payload) =>
          fetch(`${API_URL}/transactions`, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
          }),
        ),
      );

      await fetchWallet();

      setIncomeInput("");
      setShoppingInput("");
      setBillsInput("");
      setFoodInput("");
      setModalVisible(false);
    } catch (err) {
      console.error("SUBMIT ERROR:", err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#a1849dff" }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Wallet</Text>

        <LinearGradient colors={["#9C27B0", "#E91E63"]} style={styles.card}>
          <Text style={styles.label}>Pemasukan</Text>
          <Text style={styles.value}>
            Rp {wallet.income.toLocaleString("id-ID")}
          </Text>

          <Text style={styles.label}>Pengeluaran</Text>
          <Text style={styles.value}>
            Rp {wallet.expense.toLocaleString("id-ID")}
          </Text>

          <View style={styles.line} />

          <Text style={styles.saldoLabel}>Saldo</Text>
          <Text style={styles.saldo}>
            Rp {wallet.balance.toLocaleString("id-ID")}
          </Text>
        </LinearGradient>
      </ScrollView>

      <Pressable
        onPress={() => setModalVisible(true)}
        style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <Modal transparent animationType="slide" visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Tambah Transaksi</Text>

            <Text style={styles.section}>Pemasukan</Text>
            <TextInput
              placeholder="1.000.000"
              keyboardType="numeric"
              value={formatRupiah(incomeInput)}
              onChangeText={(t) => setIncomeInput(t.replace(/[^0-9]/g, ""))}
              placeholderTextColor="#aeaeaeff"
              style={styles.input}
            />

            <Text style={styles.section}>Pengeluaran</Text>

            <TextInput
              placeholder="Shopping"
              keyboardType="numeric"
              value={formatRupiah(shoppingInput)}
              onChangeText={(t) => setShoppingInput(t.replace(/[^0-9]/g, ""))}
              placeholderTextColor="#aeaeaeff"
              style={styles.input}
            />

            <TextInput
              placeholder="Bayar Bulanan"
              keyboardType="numeric"
              value={formatRupiah(billsInput)}
              onChangeText={(t) => setBillsInput(t.replace(/[^0-9]/g, ""))}
              placeholderTextColor="#aeaeaeff"
              style={styles.input}
            />

            <TextInput
              placeholder="Makanan"
              keyboardType="numeric"
              value={formatRupiah(foodInput)}
              onChangeText={(t) => setFoodInput(t.replace(/[^0-9]/g, ""))}
              placeholderTextColor="#aeaeaeff"
              style={styles.input}
            />

            <Pressable onPress={submit} style={styles.submit}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Simpan</Text>
            </Pressable>

            <Pressable
              onPress={() => setModalVisible(false)}
              style={styles.cancel}
            >
              <Text>Batal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    color: "#870c6aff",
  },
  card: {
    padding: 20,
    borderRadius: 22,
  },
  label: {
    fontSize: 16,
    color: "#e3e3e3",
    marginTop: 10,
  },
  value: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
  },
  line: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: 15,
  },
  saldoLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  saldo: {
    fontSize: 30,
    fontWeight: "800",
    color: "#fff",
  },
  fab: {
    position: "absolute",
    bottom: 25,
    right: 25,
    backgroundColor: "#4e54c8",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  fabText: {
    fontSize: 34,
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
  },
  section: {
    marginTop: 10,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  submit: {
    backgroundColor: "#9C27B0",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  cancel: {
    alignItems: "center",
    padding: 10,
  },
});
