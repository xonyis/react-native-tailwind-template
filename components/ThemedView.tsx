// components/ThemedView.tsx
import { View } from "react-native";
import { useColorScheme } from "react-native";

export function ThemedView({
  className = "",
  lightColor,
  darkColor,
  ...props
}) {
  const colorScheme = useColorScheme();

  return (
    <View
      className={`${
        colorScheme === "dark" ? "dark:bg-gray-900" : "bg-white"
      } ${className}`}
      {...props}
    />
  );
}
