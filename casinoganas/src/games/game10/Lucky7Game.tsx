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

export default function Lucky7Game() {
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);
  const [message, setMessage] = useState("Haz tu apuesta 🎯");
  const [choice, setChoice] = useState<"low" | "seven" | "high" | null>(null);
  const [rolling, setRolling] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // 🎲 Lógica principal del juego
  const rollDice = (bet: "low" | "seven" | "high") => {
    if (rolling) return;
    setRolling(true);
    setChoice(bet);
    setMessage("🎲 Lanzando dados...");

    // Animación de giro
    Animated.sequence([
      Animated.timing(rotateAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(rotateAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    // Animación de parpadeo (fade)
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    // Simular lanzamiento
    setTimeout(() => {
      const d1 = Math.ceil(Math.random() * 6);
      const d2 = Math.ceil(Math.random() * 6);
      const total = d1 + d2;

      setDice1(d1);
      setDice2(d2);

      let result: "low" | "seven" | "high" = "low";
      if (total === 7) result = "seven";
      else if (total > 7) result = "high";

      if (bet === result) {
        setMessage(`🏆 ¡Ganaste! Total: ${total}`);
      } else {
        setMessage(`😢 Perdiste. Total: ${total}`);
      }

      setRolling(false);
    }, 1000);
  };

  // 🪄 Botones con animación de escala
  const renderButton = (
    label: string,
    value: "low" | "seven" | "high",
    colors: readonly string[]
  ) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
        speed: 40,
        bounciness: 8,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }).start(() => {
        rollDice(value);
      });
    };

    return (
      <Animated.View
        key={value}
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
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
    <LinearGradient colors={["#000014", "#001030", "#000014"]} style={styles.container}>
      <Text style={styles.title}>🎯 Lucky 7</Text>

      <Animated.View
        style={[
          styles.diceContainer,
          { opacity: fadeAnim, transform: [{ rotateY: rotateInterpolate }] },
        ]}
      >
        <LinearGradient colors={["#00e5ff", "#007bff"]} style={styles.dice}>
          <Text style={styles.diceText}>{dice1}</Text>
        </LinearGradient>
        <LinearGradient colors={["#ff00ff", "#ff4081"]} style={styles.dice}>
          <Text style={styles.diceText}>{dice2}</Text>
        </LinearGradient>
      </Animated.View>

      <Text style={styles.message}>{message}</Text>

      <View style={styles.buttonRow}>
        {renderButton("⬇️ Menor que 7", "low", ["#ff416c", "#ff4b2b"])}
        {renderButton("🎯 Igual a 7", "seven", ["#FFD700", "#FFA500"])}
        {renderButton("⬆️ Mayor que 7", "high", ["#00b09b", "#96c93d"])}
      </View>

      <View style={styles.footer}>
        <Ionicons name="sparkles" size={18} color="#666" />
        <Text style={styles.footerText}>Apuesta inteligente y diviértete 💎</Text>
      </View>
    </LinearGradient>
  );
}

// 🎨 Estilos
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
    gap: 20,
  },
  dice: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#0ff",
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 10,
  },
  diceText: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "900",
  },
  message: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    textShadowColor: "rgba(0,255,255,0.6)",
    textShadowRadius: 10,
  },
  buttonRow: {
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
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
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#777",
  },
});
