import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  StyleProp,
} from "react-native";

const ResponsiveButton = ({
  onPress,
  title,
  containerStyle,
  style,
}: {
  onPress: () => void;
  title: string;
  backgroundColor?: string;
  containerStyle?: StyleProp<any>;
  style?: StyleProp<any>;
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
  },
  button: {
    backgroundColor: "#0f90FF", // Button color
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: "100%",
    minHeight: 80,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowRadius: 1,
    shadowOffset: {
      height: 3,
      width: 3,
    },
    shadowOpacity: 0.2,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 36,
    // fontWeight: "bold",
  },
});

export default ResponsiveButton;
