import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function DiceDuelGame() {
  const [redDie, setRedDie] = useState(1);
  const [blueDie, setBlueDie] = useState(1);
  const [message, setMessage] = useState("Haz tu apuesta 🎯");
  const [choice, setChoice] = useState<"red" | "blue" | null>(null);
  const [rolling, setRolling] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const rollDice = (bet: "red" | "blue") => {
    if (rolling) return;
    setRolling(true);
    setChoice(bet);
    setMessage("🎲 Tirando los dados...");

    // animación de giro
    Animated.sequence([
      Animated.timing(rotateAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(rotateAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      const d1 = Math.ceil(Math.random() * 6);
      const d2 = Math.ceil(Math.random() * 6);
      setRedDie(d1);
      setBlueDie(d2);

      if (d1 === d2) {
        setMessage(`🤝 Empate (${d1} - ${d2})`);
      } else {
        const winner = d1 > d2 ? "red" : "blue";
        if (bet === winner) {
          setMessage(`🏆 ¡Ganaste! ${winner === "red" ? "Rojo" : "Azul"} ganó`);
        } else {
          setMessage(`😢 Perdiste. Ganó ${winner === "red" ? "Rojo" : "Azul"}`);
        }
      }

      setRolling(false);
    }, 1000);
  };

  // Botón con animación de escala
  const renderButton = (
    label: string,
    value: "red" | "blue",
    colors: readonly string[]
  ) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start(() => {
        rollDice(value);
      });
    };

    return (
      <Animated.View key={value} style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          disabled={rolling}
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.button, choice === value && styles.selectedButton]}
          >
            <Text style={styles.buttonText}>{label}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <LinearGradient colors={["#01000e", "#10002b", "#2b006b"]} style={styles.container}>
      <Text style={styles.title}>🎲 Dice Duel</Text>

      <Animated.View
        style={[
          styles.diceContainer,
          { transform: [{ rotateY: rotateInterpolate }] },
        ]}
      >
        <LinearGradient colors={["#ff416c", "#ff4b2b"]} style={styles.dice}>
          <Text style={styles.diceText}>{redDie}</Text>
        </LinearGradient>

        <LinearGradient colors={["#00e5ff", "#007bff"]} style={styles.dice}>
          <Text style={styles.diceText}>{blueDie}</Text>
        </LinearGradient>
      </Animated.View>

      <Text style={styles.message}>{message}</Text>

      <View style={styles.buttonRow}>
        {renderButton("🔴 Apostar Rojo", "red", ["#ff416c", "#ff4b2b"])}
        {renderButton("🔵 Apostar Azul", "blue", ["#007bff", "#00e5ff"])}
      </View>

      <View style={styles.footer}>
        <Ionicons name="trophy" size={18} color="#FFD700" />
        <Text style={styles.footerText}>¡Que gane el mejor! 💰</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingVertical: 40,
  },
  title: {
    color: "#FFD700",
    fontSize: 30,
    fontWeight: "900",
    textShadowColor: "#00e5ff",
    textShadowRadius: 10,
    letterSpacing: 1,
  },
  diceContainer: {
    flexDirection: "row",
    gap: 30,
  },
  dice: {
    width: width * 0.28,
    height: width * 0.28,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#fff",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  diceText: {
    color: "#fff",
    fontSize: 50,
    fontWeight: "900",
  },
  message: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    textShadowColor: "rgba(255,255,255,0.4)",
    textShadowRadius: 8,
  },
  buttonRow: {
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
    marginTop: 20,
  },
  button: {
    width: width * 0.7,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedButton: {
    borderWidth: 2,
    borderColor: "#fff",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: "#ccc",
  },
});
