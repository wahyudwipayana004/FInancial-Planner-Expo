import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  balance: number;
};

export default function BalanceCard({ balance }: Props) {
  return (
    <LinearGradient
      colors={["#9C27B0", "#E91E63"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <Text style={styles.label}>Saldo</Text>

      <Text style={styles.amount}>Rp {balance.toLocaleString("id-ID")}</Text>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.7}
        onPress={() => router.push("/wallet")}
      >
        <Text style={styles.buttonText}>Lihat detail</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: 25,
    borderRadius: 20,
    marginTop: 20,
  },
  label: {
    color: "#fff",
    fontSize: 18,
    opacity: 0.8,
  },
  amount: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
    marginVertical: 5,
  },
  button: {
    marginTop: 15,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
