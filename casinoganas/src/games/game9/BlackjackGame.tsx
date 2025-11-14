import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Si no tienes AuthContext y Supabase, puedes quitar estas líneas o poner mocks:
import { useAuth } from "../../context/AuthContext"; // ⚠️ quita si no existe
import { getUserBalance, updateUserBalance } from "../../Apis/supabase"; // ⚠️ quita si no existen

const { width } = Dimensions.get("window");
const suits = ["♠️", "♥️", "♦️", "♣️"];
const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// 🔹 Crea la baraja
function createDeck() {
  const deck = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

// 🔹 Valor de cada carta
function getCardValue(value: string) {
  if (["J", "Q", "K"].includes(value)) return 10;
  if (value === "A") return 11;
  return parseInt(value, 10);
}

export default function BlackjackGame() {
  const { user } = useAuth?.() || { user: { id: "demo-user" } }; // Evita error si no existe contexto

  const [deck, setDeck] = useState(createDeck());
  const [playerCards, setPlayerCards] = useState<any[]>([]);
  const [dealerCards, setDealerCards] = useState<any[]>([]);
  const [playerTotal, setPlayerTotal] = useState(0);
  const [dealerTotal, setDealerTotal] = useState(0);
  const [balance, setBalance] = useState(1000);
  const [bet, setBet] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("Presiona JUGAR para comenzar");
  const [showDealerCards, setShowDealerCards] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🔹 Calcular total
  const calculateTotal = (cards: any[]) => {
    let total = 0;
    let aces = 0;
    for (const card of cards) {
      total += getCardValue(card.value);
      if (card.value === "A") aces++;
    }
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }
    return total;
  };

  // 🔹 Iniciar juego
  const startGame = () => {
    if (bet > balance) {
      Alert.alert("⚠️ Fondos insuficientes", "Recarga tu balance para jugar.");
      return;
    }

    const newDeck = createDeck();
    const player = [newDeck.pop(), newDeck.pop()];
    const dealer = [newDeck.pop(), newDeck.pop()];

    setDeck(newDeck);
    setPlayerCards(player);
    setDealerCards(dealer);
    setPlayerTotal(calculateTotal(player));
    setDealerTotal(calculateTotal(dealer));
    setMessage("Tu turno ✨");
    setShowDealerCards(false);
    setGameOver(false);
    fadeAnim.setValue(0);
    setBalance(balance - bet);
  };

  // 🔹 Pedir carta
  const hit = () => {
    if (gameOver) return;
    const newDeck = [...deck];
    const newCard = newDeck.pop();
    const newHand = [...playerCards, newCard];
    const total = calculateTotal(newHand);

    setDeck(newDeck);
    setPlayerCards(newHand);
    setPlayerTotal(total);

    if (total > 21) {
      setMessage("💀 Te pasaste. Pierdes.");
      endRound("dealer");
    }
  };

  // 🔹 Plantarse
  const stand = () => {
    if (gameOver) return;
    setMessage("Turno del dealer 🎲");
    setShowDealerCards(true);

    let dealerHand = [...dealerCards];
    let total = calculateTotal(dealerHand);

    while (total < 17) {
      const newCard = deck.pop();
      dealerHand.push(newCard);
      total = calculateTotal(dealerHand);
    }

    setDealerCards(dealerHand);
    setDealerTotal(total);
    revealDealer();

    setTimeout(() => {
      if (total > 21) endRound("player");
      else if (total > playerTotal) endRound("dealer");
      else if (total < playerTotal) endRound("player");
      else endRound("draw");
    }, 1200);
  };

  const revealDealer = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  // 🔹 Finalizar ronda
  const endRound = (winner: "player" | "dealer" | "draw") => {
    setGameOver(true);
    let winAmount = 0;

    if (winner === "player") {
      winAmount = bet * 2;
      setMessage("🏆 ¡Ganaste!");
    } else if (winner === "draw") {
      winAmount = bet;
      setMessage("🤝 Empate, recuperas tu apuesta.");
    } else {
      setMessage("😢 Dealer gana.");
    }

    setBalance(balance + winAmount);
  };

  const renderCard = (card: any, index: number, colors: string[]) => (
    <Animated.View key={index} style={styles.cardContainer}>
      <LinearGradient colors={colors} style={styles.card}>
        <Text style={styles.cardValue}>{card.value}</Text>
        <Text style={styles.cardSuit}>{card.suit}</Text>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <LinearGradient colors={["#0a0420", "#190a40", "#0a0420"]} style={styles.container}>
      <Text style={styles.title}>🎴 Blackjack Royale</Text>
      <Text style={styles.balance}>💰 Balance: ${balance.toFixed(2)}</Text>
      <Text style={styles.bet}>Apuesta actual: ${bet}</Text>

      {/* Dealer */}
      <View style={styles.section}>
        <Text style={styles.handTitle}>👑 Dealer</Text>
        <View style={styles.cardsRow}>
          {dealerCards.map((card, i) =>
            showDealerCards || i === 0
              ? renderCard(card, i, ["#f7b733", "#fc4a1a"])
              : renderCard({ value: "?", suit: "?" }, i, ["#444", "#222"])
          )}
        </View>
        <Animated.Text style={[styles.total, { opacity: fadeAnim }]}>
          {showDealerCards ? `Total: ${dealerTotal}` : ""}
        </Animated.Text>
      </View>

      {/* Player */}
      <View style={styles.section}>
        <Text style={styles.handTitle}>💎 Tú</Text>
        <View style={styles.cardsRow}>
          {playerCards.map((card, i) => renderCard(card, i, ["#6a11cb", "#2575fc"]))}
        </View>
        <Text style={styles.total}>Total: {playerTotal}</Text>
      </View>

      {/* Mensaje */}
      <View style={styles.messageBox}>
        <Text style={styles.message}>{message}</Text>
      </View>

      {/* Botones */}
      <View style={styles.actions}>
        {!gameOver ? (
          <>
            <TouchableOpacity style={styles.btn} onPress={hit}>
              <LinearGradient colors={["#00b09b", "#96c93d"]} style={styles.btnGradient}>
                <Ionicons name="hand-right" size={22} color="#fff" />
                <Text style={styles.btnText}>Pedir</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn} onPress={stand}>
              <LinearGradient colors={["#ff416c", "#ff4b2b"]} style={styles.btnGradient}>
                <Ionicons name="stop-circle" size={22} color="#fff" />
                <Text style={styles.btnText}>Plantarse</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.btn} onPress={startGame}>
            <LinearGradient colors={["#FFD700", "#FFA500"]} style={styles.btnGradient}>
              <Ionicons name="refresh" size={22} color="#000" />
              <Text style={[styles.btnText, { color: "#000" }]}>Jugar de nuevo</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {!playerCards.length && (
        <TouchableOpacity style={styles.startBtn} onPress={startGame}>
          <LinearGradient colors={["#8E2DE2", "#4A00E0"]} style={styles.startGradient}>
            <Ionicons name="play" size={26} color="#fff" />
            <Text style={styles.startText}>JUGAR</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "space-between", paddingVertical: 40 },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFD700",
    textShadowColor: "#A55EEA",
    textShadowRadius: 15,
    marginTop: 20,
  },
  balance: { color: "#fff", fontSize: 16, marginTop: 8 },
  bet: { color: "#A55EEA", fontSize: 14, marginBottom: 20 },
  section: { alignItems: "center" },
  handTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 10 },
  cardsRow: { flexDirection: "row", justifyContent: "center", gap: 12 },
  cardContainer: { transform: [{ rotate: "0deg" }] },
  card: {
    width: width * 0.18,
    height: width * 0.25,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  cardValue: { fontSize: 24, fontWeight: "900", color: "#fff" },
  cardSuit: { fontSize: 22, color: "#fff" },
  total: { color: "#FFD700", fontSize: 16, marginTop: 8 },
  messageBox: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  message: { color: "#fff", fontSize: 16, fontWeight: "700", textAlign: "center" },
  actions: { flexDirection: "row", gap: 15, marginTop: 10 },
  btn: { borderRadius: 14, overflow: "hidden" },
  btnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderRadius: 14,
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  startBtn: { marginTop: 30, borderRadius: 16, overflow: "hidden" },
  startGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 14,
    gap: 10,
    borderRadius: 16,
  },
  startText: { color: "#fff", fontWeight: "900", fontSize: 18 },
});
