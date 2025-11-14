import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Dimensions,
  ScrollView,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getUserBalance, updateUserBalance } from "../../Apis/supabase";

const { width, height } = Dimensions.get("window");

const COLS = 3;
const H_PADDING = 16;
const MACHINE_SIDE_PADDING = 14;
const MACHINE_SCALE = 0.9;
const GAP_COLS = 10;

const MACHINE_WIDTH = (width - H_PADDING * 2) * MACHINE_SCALE;
const CELL_W = Math.floor(
  (MACHINE_WIDTH - MACHINE_SIDE_PADDING * 2 - (COLS - 1) * GAP_COLS) / COLS
);
const CELL_H = Math.min(120, Math.max(92, Math.floor(height * 0.12)));

const DIAMOND_COUNT = 16;

// Emojis (⭐ = Wild)
const S = ["🍒", "🍋", "🍉", "🍇", "🔔", "⭐"] as const;
type Sym = typeof S[number];

const PAY: Record<Sym, number> = {
  "🍒": 20,
  "🍋": 25,
  "🍉": 30,
  "🍇": 40,
  "🔔": 60,
  "⭐": 0,
};

export default function NeonFruits({ navigation }: any) {
  const { user } = useAuth();
  const [credits, setCredits] = useState(0);
  const [bet, setBet] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);

  const reels = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];


  const bulbsTop = [...Array(24)].map(
    () => useRef(new Animated.Value(0)).current
  );
  const bulbsSide = [...Array(14)].map(
    () => useRef(new Animated.Value(0)).current
  );

  const machineScale = useRef(new Animated.Value(1)).current;
  const machineShake = useRef(new Animated.Value(0)).current;
  const winPulse = useRef(new Animated.Value(0)).current;
  const loseFlash = useRef(new Animated.Value(0)).current;

  const diamondAnims = useRef(
    [...Array(DIAMOND_COUNT)].map(() => ({
      translateY: new Animated.Value(-40),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.6),
    }))
  ).current;
  const diamondXPositions = useRef(
    [...Array(DIAMOND_COUNT)].map(
      (_: unknown, i: number) => (i + 0.5) / DIAMOND_COUNT
    )
  ).current;

  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      const d = await getUserBalance(user.id);
      setCredits(Number(d.balance || 0));
    })();
  }, [user?.id]);

  useEffect(() => {
    [...bulbsTop, ...bulbsSide].forEach((a, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(a, {
            toValue: 1,
            duration: 700 + (i % 4) * 120,
            useNativeDriver: true,
          }),
          Animated.timing(a, {
            toValue: 0.25,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", (e: any) => {
      if (!spinning) return;
      e.preventDefault();
      Alert.alert(
        "Tirada en curso",
        "Espera a que termine la tirada antes de salir del juego.",
        [{ text: "OK", style: "cancel" }]
      );
    });

    return sub;
  }, [navigation, spinning]);

  const randSym = () => S[Math.floor(Math.random() * S.length)] as Sym;

  const scoreLine = (line: Sym[]) => {
    const nonWild = line.filter((x) => x !== "⭐");
    if (nonWild.length === 0) return bet * 5; // 3 wilds
    const t = nonWild[0];
    const allSame = line.every((x) => x === t || x === "⭐");
    return allSame ? Math.max(bet * (PAY[t] / 10), bet) : 0;
  };

  const triggerWinAnim = () => {
    winPulse.setValue(0);
    machineScale.setValue(1);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(machineScale, {
          toValue: 1.06,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(machineScale, {
          toValue: 1.0,
          duration: 140,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(winPulse, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(winPulse, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const triggerLoseAnim = () => {
    machineShake.setValue(0);
    loseFlash.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(machineShake, {
          toValue: -1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(machineShake, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(machineShake, {
          toValue: -1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(machineShake, {
          toValue: 0,
          duration: 60,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(loseFlash, {
          toValue: 0.35,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(loseFlash, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const triggerDiamondBurst = () => {
    diamondAnims.forEach((anim, idx) => {
      anim.translateY.setValue(-40);
      anim.translateX.setValue(0);
      anim.opacity.setValue(1);
      anim.scale.setValue(0.7);

      const duration = 900 + Math.random() * 400;
      const finalY = 180 + Math.random() * 120;
      const dir = Math.random() > 0.5 ? 1 : -1;
      const finalX = dir * (40 + Math.random() * 70);

      Animated.parallel([
        Animated.timing(anim.translateY, {
          toValue: finalY,
          duration,
          delay: idx * 60,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateX, {
          toValue: finalX,
          duration,
          delay: idx * 60,
          useNativeDriver: true,
        }),
        Animated.timing(anim.scale, {
          toValue: 1.1,
          duration,
          delay: idx * 60,
          useNativeDriver: true,
        }),
      ]).start(() => {
        anim.opacity.setValue(0);
      });
    });
  };

  const spin = async () => {
    if (spinning || credits < bet) {
      if (credits < bet) Alert.alert("Sin créditos", "Recarga en Home");
      return;
    }
    setSpinning(true);
    setCredits((c) => c - bet);
    setLastWin(0);

    const cols: Sym[][] = [[], [], []];

    const anims = [0, 1, 2].map(
      (i) =>
        new Promise<void>((resolve) => {
          const col: Sym[] = [randSym(), randSym(), randSym()];
          cols[i] = col;
          Animated.sequence([
            Animated.timing(reels[i], {
              toValue: -CELL_H * 14,
              duration: 940 + i * 140,
              useNativeDriver: true,
            }),
            Animated.timing(reels[i], {
              toValue: -CELL_H * S.indexOf(col[1]),
              duration: 260,
              useNativeDriver: true,
            }),
          ]).start(() => resolve());
        })
    );

    await Promise.all(anims);

    // líneas
    const lines: Sym[][] = [
      [cols[0][0], cols[1][0], cols[2][0]],
      [cols[0][1], cols[1][1], cols[2][1]],
      [cols[0][2], cols[1][2], cols[2][2]],
      [cols[0][0], cols[1][1], cols[2][2]],
      [cols[0][2], cols[1][1], cols[2][0]],
    ];

    const total = lines.reduce((a, l) => a + scoreLine(l), 0);
    const newBal = credits - bet + total;

    setLastWin(total);
    setCredits(newBal);

    if (total > 0) {
      triggerWinAnim();

      if (total >= bet * 8) {
        triggerDiamondBurst();
      }
    } else {
      triggerLoseAnim();
    }

    try {
      await updateUserBalance(user.id, newBal, bet, total, {
        game: "NeonFruits",
        lines: lines.map((l) => l.join(" ")).join(" | "),
      });
    } catch {}

    setSpinning(false);
  };

  const renderBulbStrip = (arr: Animated.Value[], horizontal: boolean) => (
    <View
      style={[
        styles.bulbStrip,
        horizontal ? { flexDirection: "row" } : { flexDirection: "column" },
      ]}
    >
      {arr.map((a, i) => {
        const scale = a.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1.08],
        });
        const opacity = a.interpolate({
          inputRange: [0, 1],
          outputRange: [0.55, 1],
        });
        return (
          <Animated.View
            key={i}
            style={[styles.bulb, { opacity, transform: [{ scale }] }]}
          />
        );
      })}
    </View>
  );

  const shakeTranslate = machineShake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-10, 10],
  });

  const winScale = winPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.15],
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#080810" }}>
      {/* Marco fino y simétrico en toda la pantalla */}
      <View style={styles.frameFull}>
        {renderBulbStrip(bulbsTop, true)}
        <View style={styles.frameCenterRow}>
          {renderBulbStrip(bulbsSide, false)}

          <LinearGradient
            colors={["#19192e", "#13132a", "#0b0b1d"]}
            style={styles.gamePanel}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => {
                  if (spinning) {
                    Alert.alert(
                      "Tirada en curso",
                      "No puedes salir mientras está girando la máquina."
                    );
                    return;
                  }
                  navigation.goBack();
                }}
                style={styles.back}
              >
                <Ionicons name="arrow-back" size={22} color="#FFD700" />
              </TouchableOpacity>
              <Text style={styles.balance}>
                ${credits.toLocaleString()}
              </Text>
            </View>

            {/* Título */}
            <LinearGradient
              colors={["#FFD700", "#FFA500", "#FFD700"]}
              style={styles.titleGrad}
            >
              <Text style={styles.title}>💡 NEON FRUITS — ⭐ WILD</Text>
            </LinearGradient>

            <ScrollView
              contentContainerStyle={{ paddingBottom: 28 }}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Máquina */}
              <Animated.View
                style={[
                  styles.machine,
                  {
                    width: MACHINE_WIDTH,
                    paddingHorizontal: MACHINE_SIDE_PADDING,
                    transform: [
                      { scale: machineScale },
                      { translateX: shakeTranslate },
                    ],
                  },
                ]}
              >
                {/* overlay lose */}
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.loseOverlay,
                    {
                      opacity: loseFlash,
                    },
                  ]}
                />

                {/* separadores */}
                <View
                  style={[
                    styles.colDivider,
                    { left: MACHINE_WIDTH / 3 - 1 },
                  ]}
                />
                <View
                  style={[
                    styles.colDivider,
                    { right: MACHINE_WIDTH / 3 - 1 },
                  ]}
                />

                {[0, 1, 2].map((c) => (
                  <View
                    key={c}
                    style={[
                      styles.reelViewport,
                      { width: CELL_W, height: CELL_H },
                    ]}
                  >
                    <Animated.View
                      style={{ transform: [{ translateY: reels[c] }] }}
                    >
                      {[...Array(18)].map((_, k) => (
                        <View
                          key={k}
                          style={[
                            styles.cell,
                            { width: CELL_W, height: CELL_H },
                          ]}
                        >
                          <Text
                            style={[
                              styles.sym,
                              S[k % S.length] === "⭐" && styles.wild,
                            ]}
                          >
                            {S[k % S.length]}
                          </Text>
                        </View>
                      ))}
                    </Animated.View>
                  </View>
                ))}

                {/* halo de win */}
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.winHalo,
                    {
                      opacity: winPulse,
                      transform: [{ scale: winScale }],
                    },
                  ]}
                />

                {/* capa de diamantes */}
                <View pointerEvents="none" style={styles.diamondLayer}>
                  {diamondAnims.map((anim, idx) => (
                    <Animated.Text
                      key={idx}
                      style={{
                        position: "absolute",
                        fontSize: 22,
                        textShadowColor: "#00f0ff",
                        textShadowRadius: 8,
                        left: `${diamondXPositions[idx] * 100}%`,
                        opacity: anim.opacity,
                        transform: [
                          { translateX: anim.translateX },
                          { translateY: anim.translateY },
                          { translateX: -10 },
                          { scale: anim.scale },
                        ],
                      }}
                    >
                      🍒🍉🍇
                    </Animated.Text>
                  ))}
                </View>
              </Animated.View>

              {/* Controles GRANDES */}
              <View style={styles.betRow}>
                <TouchableOpacity
                  style={styles.bigIconBtn}
                  onPress={() =>
                    !spinning && setBet((b) => Math.max(10, b - 10))
                  }
                >
                  <Ionicons name="remove" size={28} color="#FFD700" />
                </TouchableOpacity>

                <LinearGradient
                  colors={["rgba(255,215,0,.2)", "rgba(255,165,0,.1)"]}
                  style={styles.bigBetDisplay}
                >
                  <Text style={styles.bigBetTxt}>${bet}</Text>
                </LinearGradient>

                <TouchableOpacity
                  style={styles.bigIconBtn}
                  onPress={() =>
                    !spinning && setBet((b) => Math.min(credits, b + 10))
                  }
                >
                  <Ionicons name="add" size={28} color="#FFD700" />
                </TouchableOpacity>
              </View>

              <View style={styles.quickRow}>
                {[10, 25, 50, 100].map((v) => (
                  <TouchableOpacity
                    key={v}
                    onPress={() => !spinning && setBet(Math.min(credits, v))}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={
                        bet === v
                          ? ["#FFD700", "#FFA500"]
                          : [
                              "rgba(255,215,0,.16)",
                              "rgba(255,165,0,.08)",
                            ]
                      }
                      style={[
                        styles.quickChip,
                        bet === v && { borderColor: "#FFD700" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.quickTxt,
                          { color: bet === v ? "#0b0b0b" : "#FFD700" },
                        ]}
                      >
                        ${v}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                disabled={spinning}
                onPress={spin}
                activeOpacity={0.92}
                style={styles.spinBtn}
              >
                <LinearGradient
                  colors={
                    spinning
                      ? ["#666", "#444"]
                      : ["#e60073", "#c8005f", "#aa004d"]
                  }
                  style={styles.spinGrad}
                >
                  <Ionicons
                    name={spinning ? "reload" : "play"}
                    size={28}
                    color="#fff"
                  />
                  <Text style={styles.spinTxt}>
                    {spinning ? "Girando…" : "GIRAR"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.lastWin}>
                Último premio:{" "}
                <Text style={{ color: "#34d399", fontWeight: "800" }}>
                  ${lastWin.toLocaleString()}
                </Text>
              </Text>

              <View style={styles.payTable}>
                {Object.entries(PAY).map(([sym, mult]) => (
                  <View key={sym} style={styles.payItem}>
                    <Text
                      style={[
                        styles.paySym,
                        sym === "⭐" && styles.wild,
                      ]}
                    >
                      {sym}
                    </Text>
                    <Text style={styles.payVal}>×{mult}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </LinearGradient>

          {renderBulbStrip(bulbsSide, false)}
        </View>
        {renderBulbStrip(bulbsTop, true)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frameFull: {
    flex: 1,
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#d4af37",
    backgroundColor: "#eae6df",
  },
  frameCenterRow: { flex: 1, flexDirection: "row", alignItems: "stretch" },

  bulbStrip: {
    justifyContent: "space-between",
    alignItems: "center",
    padding: 1,
    backgroundColor: "#3a2600",
  },
  bulb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },

  gamePanel: {
    flex: 1,
    paddingHorizontal: H_PADDING,
    paddingTop: 30,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,215,0,.12)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,.35)",
  },
  balance: { color: "#FFD700", fontSize: 20, fontWeight: "900" },

  titleGrad: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginBottom: 10,
  },
  title: {
    color: "#0b0b0b",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1,
  },

  machine: {
    alignSelf: "center",
    paddingVertical: 12,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "rgba(255,215,0,.35)",
    backgroundColor: "#0f0f21",
    flexDirection: "row",
    gap: GAP_COLS,
    position: "relative",
    overflow: "hidden",
  },
  colDivider: {
    position: "absolute",
    top: 10,
    bottom: 10,
    width: 2,
    backgroundColor: "rgba(255,215,0,.25)",
    borderRadius: 1,
  },

  reelViewport: {
    backgroundColor: "rgba(10,10,30,.85)",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,215,0,.35)",
  },
  cell: {
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,215,0,.08)",
  },
  sym: {
    fontSize: 58,
    textShadowColor: "rgba(255,255,255,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  wild: { textShadowColor: "rgba(255,215,0,.8)", textShadowRadius: 10 },

  winHalo: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(0,255,255,0.8)",
  },

  loseOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,0,0,0.35)",
  },

  diamondLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 260,
  },

  betRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 18,
    justifyContent: "center",
  },
  bigIconBtn: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,215,0,.10)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,.35)",
  },
  bigBetDisplay: {
    minWidth: 140,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  bigBetTxt: {
    color: "#f2f8f4",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 1,
  },

  quickRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 12,
  },
  quickChip: {
    height: 44,
    minWidth: 70,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,.35)",
  },
  quickTxt: { fontSize: 14, fontWeight: "900" },

  spinBtn: {
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
    marginTop: 16,
    alignSelf: "center",
  },
  spinGrad: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  spinTxt: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
  },

  lastWin: { marginTop: 14, color: "#fff", textAlign: "center" },

  payTable: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    paddingBottom: 16,
    paddingHorizontal: 8,
  },
  payItem: {
    minWidth: 100,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(255,215,0,.12)",
    borderColor: "rgba(255,215,0,.35)",
    borderWidth: 1,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  paySym: { fontSize: 28 },
  payVal: { color: "#FFD700", fontWeight: "900", fontSize: 16 },
});
