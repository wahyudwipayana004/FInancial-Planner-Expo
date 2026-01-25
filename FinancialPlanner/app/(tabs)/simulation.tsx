import { LinearGradient } from "expo-linear-gradient";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { API_URL } from "@/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** Goal type */
type Goal = {
  id: number;
  title: string;
  target: number;
  saved: number;
};

export default function Simulation() {
  const router = useRouter();

  /** FORM STATE */
  const [target, setTarget] = useState("");
  const [tujuan, setTujuan] = useState("");

  /** GOALS STATE */
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  /** FETCH GOALS */
  useFocusEffect(
    useCallback(() => {
      const fetchGoals = async () => {
        try {
          setLoading(true);

          const token = await AsyncStorage.getItem("token");

          const res = await fetch(`${API_URL}/tabungan`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data: any[] = await res.json();

          // normalize all goals
          const normalized: Goal[] = data.map((g) => ({
            id: g.id,
            title: g.title,
            target: Number(g.target) || 0,
            saved: Number(g.saved) || 0,
          }));

          setGoals(normalized);
        } catch (err) {
          console.error("FETCH TABUNGAN ERROR:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchGoals();
    }, []),
  );

  /** CREATE NEW GOAL */
  const hitung = async () => {
    if (!target || !tujuan) return;

    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${API_URL}/tabungan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: tujuan,
          target: Number(target),
        }),
      });

      const data = await res.json();

      // normalize numbers just to be safe
      const newGoal: Goal = {
        id: data.id,
        title: data.title,
        target: Number(data.target) || 0,
        saved: Number(data.saved) || 0,
      };

      setGoals((prev) => [newGoal, ...prev]);

      setTarget("");
      setTujuan("");
    } catch (err) {
      console.error("Failed to create goal", err);
    }
  };

  /** FORMAT RUPIAH */
  const formatRupiah = (value: string) => {
    const number = value.replace(/[^0-9]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Tabungan</Text>

        {/* CREATE GOAL CARD */}
        <View style={styles.card}>
          <Text style={styles.target}>Target tabungan</Text>

          <TextInput
            placeholder="10.000.000"
            keyboardType="numeric"
            style={styles.input}
            value={formatRupiah(target)}
            onChangeText={(text) => {
              const raw = text.replace(/[^0-9]/g, "");
              setTarget(raw);
            }}
            placeholderTextColor="#aeaeaeff"
          />

          <Text style={styles.target}>Tujuan</Text>

          <TextInput
            placeholder="DP Alphard"
            style={styles.input}
            value={tujuan}
            onChangeText={setTujuan}
            placeholderTextColor="#aeaeaeff"
          />

          <TouchableOpacity onPress={hitung}>
            <LinearGradient
              colors={["#9C27B0", "#E91E63"]}
              style={styles.gradientBtn}
            >
              <Text style={styles.btnText}>Tambah Tujuan</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* GOALS LIST */}
        <Text style={styles.sectionTitle}>Tujuan Keuangan</Text>
        {goals.map((goal) => {
          const saved = Number(goal.saved) || 0;
          const targetVal = Number(goal.target) || 0;

          const progress =
            targetVal > 0 ? Math.min((saved / targetVal) * 100, 100) : 0;

          return (
            <TouchableOpacity
              key={goal.id} // unique key for React
              style={styles.goalCard}
              onPress={() => router.push(`../goal/${goal.id}`)}
            >
              <Text style={styles.goalTitle}>{goal.title}</Text>

              <Text style={styles.goalSubtitle}>
                Rp{" "}
                {goal.saved != null ? goal.saved.toLocaleString("id-ID") : "0"}{" "}
                /{" "}
                {goal.target != null
                  ? goal.target.toLocaleString("id-ID")
                  : "0"}
              </Text>

              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 20,
    color: "#870c6a",
  },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E4EEE8",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#DCEADF",
  },
  gradientBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    marginBottom: 12,
    color: "#7F0E70",
  },
  goalCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#DCEADF",
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#52093E",
  },
  goalSubtitle: {
    color: "#777",
    marginVertical: 8,
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
  target: {
    fontWeight: "500",
    fontSize: 15,
    color: "rgb(0, 0, 0)",
    marginLeft: 5,
    paddingBottom: 10,
  },
});
