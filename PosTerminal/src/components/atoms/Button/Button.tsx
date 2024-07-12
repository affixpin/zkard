import { TouchableOpacity } from "react-native";

import { useTheme } from "@/theme";

export default function Button({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) {
  const { colors, gutters } = useTheme();

  return (
    <TouchableOpacity
      testID="button"
      onPress={onPress}
      style={{
        backgroundColor: colors.purple500,
        alignContent: "center",
        justifyContent: "center",
        ...gutters.padding_12,
      }}
    >
      {children}
    </TouchableOpacity>
  );
}
