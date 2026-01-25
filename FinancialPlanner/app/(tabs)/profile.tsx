import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SettingsItemProps = {
  title: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
};

const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  onPress,
  rightElement,
  icon,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.6 : 1}
      onPress={onPress}
      style={styles.item}
    >
      <View style={styles.left}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color="#870c6aff"
            style={styles.icon}
          />
        )}
        <Text style={styles.itemText}>{title}</Text>
      </View>

      {rightElement ?? <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  );
};

export default function Settings() {
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  };
  const [pushEnabled, setPushEnabled] = useState<boolean>(true);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Profil</Text>

        {/* Profile */}
        <View style={styles.profile}>
          <Image
            source={{ uri: "https://i.pravatar.cc/100" }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.welcome}>Selamat Datang</Text>
            <Text style={styles.name}>Mr.wowo</Text>
          </View>

          <Text style={styles.chevron}>›</Text>
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <SettingsItem
            title="Profil Pengguna"
            icon="person-outline"
            onPress={() => router.push("../editProfile")}
          />

          <SettingsItem
            title="Ubah Password"
            icon="lock-closed-outline"
            onPress={() => router.push("../changePassword")}
          />

          <SettingsItem
            title="FAQs"
            icon="help-circle-outline"
            onPress={() => {}}
          />

          <SettingsItem
            title="Push Notification"
            icon="notifications-outline"
            rightElement={
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: "#e0e0e0", true: "#870c6aff" }}
                thumbColor="#fff"
                ios_backgroundColor="#e0e0e0"
              />
            }
          />
          <View style={{ marginTop: 30 }}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#870c6aff",
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  welcome: {
    fontSize: 12,
    color: "#888",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    marginTop: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  itemText: {
    fontSize: 16,
    color: "#111",
  },
  chevron: {
    fontSize: 22,
    color: "#999",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    marginRight: 12,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#870c6aff",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },

  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
