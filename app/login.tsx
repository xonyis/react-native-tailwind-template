import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const { signIn, isLoading, error, token } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  React.useEffect(() => {
    if (token) {
      router.replace("/(drawer)");
    }
  }, [token, router]);

  React.useEffect(() => {
    if (error) {
      Alert.alert("Connexion échouée", error);
    }
  }, [error]);

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Champs requis", "Merci de renseigner vos identifiants.");
      return;
    }
    await signIn({ email, password });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ThemedView className="flex-1 items-center justify-center px-6" lightColor="#ffffff" darkColor="#000000">
        <ThemedText className="text-3xl font-bold mb-8 text-black">Se connecter</ThemedText>
        <View style={{ width: "100%", gap: 12 }}>
          <Text className="text-black dark:text-white">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="email"
            placeholderTextColor="#888"
            style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, color: "#000" }}
          />
          <Text className="text-black dark:text-white">Mot de passe</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#888"
            style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, color: "#000" }}
          />
          <Pressable
            onPress={onSubmit}
            disabled={isLoading}
            style={{ backgroundColor: "#2563eb", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 8 }}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "600" }}>Connexion</Text>
            )}
          </Pressable>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}


