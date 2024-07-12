import { View, Text, Alert } from "react-native";
import nfcManager, { NfcTech } from "react-native-nfc-manager";
import { useTranslation } from "react-i18next";

import { SafeScreen } from "@/components/template";
import { useTheme } from "@/theme";

import Keypad from "@/components/molecules/Keypad/Keypad";
import { useState } from "react";

nfcManager.start();

function Example() {
  const { t } = useTranslation(["example", "welcome"]);
  const { colors, layout, gutters, fonts, components } = useTheme();

  const onNfcPress = async () => {
    try {
      // register for the NFC tag with NDEF in it
      await nfcManager.requestTechnology(NfcTech.Ndef);
      // the resolved tag object will contain `ndefMessage` property
      const tag = await nfcManager.getTag();
      console.warn("Tag found", tag);
      Alert.alert("Tag found", JSON.stringify(tag));
    } catch (ex) {
      console.warn("Oops!", ex);
    } finally {
      // stop the nfc scanning
      nfcManager.cancelTechnologyRequest();
    }
  };

  const [currentValue, setCurrentValue] = useState("");

  const handlePress = (value: string) => {
    // Ensure only two digits after decimal point
    if (currentValue.length === 0 && value === ".") {
      return setCurrentValue("0.");
    }

    if (currentValue.includes(".")) {
      if (value === ".") {
        return;
      }

      const decimalIndex = currentValue.indexOf(".");
      if (currentValue.length - decimalIndex > 2) {
        return;
      }
    }

    setCurrentValue((prevValue) => prevValue + value);
  };

  const handleSubmit = () => {
    setCurrentValue(""); // Clear the current value after submission
  };

  const handleClear = () => {
    setCurrentValue((prevValue) => prevValue.slice(0, -1)); // Remove last character
  };

  return (
    <SafeScreen>
      <View
        style={[
          gutters.paddingHorizontal_32,
          {
            height: "100%",
            justifyContent: "space-between",
          },
        ]}
      >
        <View style={{}}>
          <Text
            style={[
              {
                textAlign: "right",
                fontSize: 48,
              },
            ]}
          >
            Enter amount:
          </Text>
          {currentValue !== "" ? (
            <Text
              style={[
                {
                  textAlign: "right",
                  fontSize: 96,
                },
              ]}
            >
              {currentValue}
            </Text>
          ) : (
            <Text
              style={{
                textAlign: "right",
                fontSize: 96,
                color: "#aeaeae",
              }}
            >
              0,00
            </Text>
          )}
        </View>

        <Keypad
          onPress={(value) => handlePress(value)}
          onSubmit={() => {}}
          onClear={() => handleClear()}
        />
      </View>
    </SafeScreen>
  );
}

export default Example;
