import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Article = {
  id: string;
  title: string;
  desc: string;
  icon: string;
};

export default function Education() {
  const articles: Article[] = [
    {
      id: "1",
      title: "Manfaat Menabung",
      desc: "Temukan alasan pentingnya menabung...",
      icon: "bookmark-outline",
    },
    {
      id: "2",
      title: "Cara Mengatur Keuangan",
      desc: "Enorit menunggur keuangan...",
      icon: "bookmark-outline",
    },
    {
      id: "3",
      title: "Investasi untuk Pemula",
      desc: "Panduan dasar memulai investasi...",
      icon: "bookmark-outline",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#a1849dff" }}>
      <ScrollView style={styles.scroll}>
        <View>
          <Text style={styles.title}>Edukasi</Text>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() =>
              Linking.openURL("https://www.youtube.com/watch?v=tdUuyhZH5wI")
            }
          >
            <Image
              source={{
                uri: "https://img.youtube.com/vi/tdUuyhZH5wI/maxresdefault.jpg",
              }}
              style={styles.videoImage}
            />

            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>3:46</Text>
            </View>

            <View style={styles.playButton}>
              <Ionicons name="play" size={32} color="white" />
            </View>
          </TouchableOpacity>

          <FlatList
            scrollEnabled={false}
            data={articles}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingTop: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.articleItem}>
                <View>
                  <Text style={styles.articleTitle}>{item.title}</Text>
                  <Text style={styles.articleDesc}>{item.desc}</Text>
                </View>

                <Ionicons name={item.icon as any} size={22} color="#C71798" />
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#F8FAF9",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    color: "#82167cff",
  },
  videoCard: {
    width: "100%",
    height: 180,
    backgroundColor: "#efd6f0ff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    position: "relative",
  },
  videoImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  playButton: {
    position: "absolute",
    top: "35%",
    left: "40%",
    backgroundColor: "#C71798",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.9,
  },
  durationBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(7, 5, 7, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    color: "white",
    fontSize: 12,
  },
  articleItem: {
    backgroundColor: "#f9f8f8ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: "#DCEADF",
    elevation: 1,
  },
  articleTitle: {
    fontSize: 16,
    color: "#5e2556ff",
    fontWeight: "600",
  },
  articleDesc: {
    fontSize: 13,
    color: "#777",
    marginTop: 4,
  },
});
