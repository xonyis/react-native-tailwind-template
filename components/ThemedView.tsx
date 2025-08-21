// components/ThemedView.tsx
import { useColorScheme, View } from "react-native";

export function ThemedView({
  className = "",
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
