import AsyncStorage from "@react-native-async-storage/async-storage";

export async function authFetch(url: string, options: RequestInit = {}) {
  const token = await AsyncStorage.getItem("token");

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}
