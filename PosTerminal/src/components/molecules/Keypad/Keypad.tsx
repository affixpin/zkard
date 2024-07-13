import ResponsiveButton from "@/components/atoms/ResponsiveButton/ResponsiveButton";
import { View } from "react-native";

function KeypadRow({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
      }}
    >
      {children}
    </View>
  );
}

export default function Keypad({
  onPress,
  onSubmit,
  onClear,
}: {
  onPress: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}) {
  return (
    <View style={{ minWidth: "100%", width: "100%" }}>
      <KeypadRow>
        <ResponsiveButton onPress={() => onPress("1")} title="1" />
        <ResponsiveButton title="2" onPress={() => onPress("2")} />
        <ResponsiveButton title="3" onPress={() => onPress("3")} />
      </KeypadRow>
      <KeypadRow>
        <ResponsiveButton title="4" onPress={() => onPress("4")} />
        <ResponsiveButton title="5" onPress={() => onPress("5")} />
        <ResponsiveButton title="6" onPress={() => onPress("6")} />
      </KeypadRow>
      <KeypadRow>
        <ResponsiveButton title="7" onPress={() => onPress("7")} />
        <ResponsiveButton title="8" onPress={() => onPress("8")} />
        <ResponsiveButton title="9" onPress={() => onPress("9")} />
      </KeypadRow>
      <KeypadRow>
        <ResponsiveButton title="." onPress={() => onPress(".")} />
        <ResponsiveButton title="0" onPress={() => onPress("0")} />
        <ResponsiveButton title="<" onPress={() => onClear()} />
      </KeypadRow>
      <KeypadRow>
        <ResponsiveButton
          title="Proceed >"
          onPress={() => onSubmit()}
          style={{ backgroundColor: "#00eeaa", padding: 0, margin: 0 }}
        />
      </KeypadRow>
    </View>
  );
}
