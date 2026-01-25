import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";

type Goal = {
  id: number;
  title: string;
  target: number;
  saved: number;
};

export default function GoalDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [deposit, setDeposit] = useState("");
  const [loading, setLoading] = useState(true);

  const formatRupiah = (value: string) => {
    const number = value.replace(/[^0-9]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  /** FETCH GOAL */
  useEffect(() => {
    if (!id) return;

    const fetchGoal = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        const res = await fetch(`${API_URL}/tabungan/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data: Goal = await res.json();
        setGoal(data);
      } catch (err) {
        console.error("FETCH GOAL ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGoal();
  }, [id]);

  /** ADD MONEY */
  const addMoney = async () => {
    if (!deposit || Number(deposit) <= 0) return;

    try {
      const token = await AsyncStorage.getItem("token");

      await fetch(`${API_URL}/tabungan/${id}/deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(deposit),
        }),
      });

      setDeposit("");

      // Refresh goal after deposit
      const res = await fetch(`${API_URL}/tabungan/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedGoal: Goal = await res.json();
      setGoal(updatedGoal);
    } catch (err) {
      console.error("DEPOSIT ERROR:", err);
    }
  };

  /** DELETE GOAL */
  const deleteGoal = async () => {
    const confirmed =
      Platform.OS === "web"
        ? window.confirm("Apakah anda yakin ingin menghapus tujuan ini?")
        : await new Promise<boolean>((resolve) => {
            Alert.alert(
              "Hapus Tujuan",
              "Apakah anda yakin ingin menghapus tujuan ini?",
              [
                {
                  text: "Batal",
                  onPress: () => resolve(false),
                  style: "cancel",
                },
                {
                  text: "Hapus",
                  onPress: () => resolve(true),
                  style: "destructive",
                },
              ],
            );
          });

    if (!confirmed) return;

    try {
      const token = await AsyncStorage.getItem("token");

      await fetch(`${API_URL}/tabungan/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      router.replace("/simulation");
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };

  if (loading || !goal) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  const progress = Math.min((goal.saved / goal.target) * 100, 100);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Detail Tabungan",
          headerBackTitle: "Back",
        }}
      />

      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={styles.container}>
          <Text style={styles.title}>{goal.title}</Text>

          <View style={styles.card}>
            <Text style={styles.amount}>
              Rp {goal.saved.toLocaleString("id-ID")} /{" "}
              {goal.target.toLocaleString("id-ID")}
            </Text>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>

          <Text style={styles.target}>Tambah tabungan</Text>

          <TextInput
            placeholder="1.000.000"
            keyboardType="numeric"
            style={styles.input}
            value={formatRupiah(deposit)}
            onChangeText={(text) => {
              const raw = text.replace(/[^0-9]/g, "");
              setDeposit(raw);
            }}
            placeholderTextColor="#aeaeaeff"
          />

          <TouchableOpacity onPress={addMoney}>
            <LinearGradient
              colors={["#9C27B0", "#E91E63"]}
              style={styles.primaryBtn}
            >
              <Text style={styles.btnText}>Tambah Tabungan</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Pressable
            onPress={deleteGoal}
            style={({ pressed }) => [
              styles.deleteBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.deleteText}>Hapus Tujuan</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: 20 },

  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 20,
    color: "#870c6a",
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E4EEE8",
    marginBottom: 20,
  },

  amount: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#52093E",
  },

  progressBar: {
    height: 10,
    backgroundColor: "#F1E3F2",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#C92899",
  },

  input: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#DCEADF",
  },

  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
  },

  btnText: { color: "#fff", fontWeight: "700" },

  deleteBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF4D4D",
  },
  target: {
    fontWeight: "500",
    fontSize: 15,
    color: "rgb(0, 0, 0)",
    marginLeft: 5,
    paddingBottom: 10,
  },

  deleteText: { color: "#FF4D4D", fontWeight: "700" },
});
