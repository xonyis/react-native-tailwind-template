import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";

export default function Index() {
  const { token, isLoading } = useAuth();
  if (isLoading) return null;
  if (!token) return <Redirect href="/login" />;
  return <Redirect href="/(drawer)" />;
}


