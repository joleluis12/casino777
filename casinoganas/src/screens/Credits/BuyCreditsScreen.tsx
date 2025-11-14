import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { addCredits, getUserBalance } from "../../Apis/supabase";

const { width } = Dimensions.get("window");

// Componente de tarjeta de crédito premium
const CreditCard = ({ amount, onPress, disabled, isSelected }: any) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.creditOption,
          isSelected && styles.creditOptionSelected
        ]}
        activeOpacity={0.8}
        disabled={disabled}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={isSelected ? 
            ["rgba(255, 215, 0, 0.3)", "rgba(255, 165, 0, 0.2)", "rgba(255, 215, 0, 0.3)"] : 
            ["rgba(30, 30, 40, 0.8)", "rgba(20, 20, 30, 0.9)", "rgba(30, 30, 40, 0.8)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.creditGradient}
        >
          <View style={styles.cardContent}>
            <View style={styles.amountContainer}>
              <Text style={[
                styles.creditAmount,
                isSelected && styles.creditAmountSelected
              ]}>
                ${amount}
              </Text>
            </View>
            {isSelected && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="checkmark-circle" size={20} color="#FFD700" />
              </View>
            )}
          </View>
          {isSelected && (
            <View style={styles.glowEffect} />
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function BuyCreditsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const handleAddCredits = async (amount: number) => {
    try {
      setLoading(true);
      const updated = await addCredits(user.id, amount);
      setBalance(updated.balance);
      Alert.alert("✅ Compra exitosa", `Se agregaron $${amount} a tu cuenta`);
      setSelectedAmount(null);
    } catch (err) {
      Alert.alert("Error", "No se pudo agregar créditos");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
  };

  React.useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await getUserBalance(user.id);
        setBalance(Number(data.balance || 0));
      } catch {}
    };
    fetchBalance();
  }, []);

  const creditOptions = [50, 100, 200, 300, 1000, 2000];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0a0a0a", "#1a1a2e", "#0a0a0a"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Efectos de fondo sutiles */}
      <View style={styles.backgroundEffects}>
        <View style={styles.glowCircle1} />
        <View style={styles.glowCircle2} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header premium */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={["rgba(255, 215, 0, 0.2)", "rgba(255, 165, 0, 0.1)"]}
              style={styles.backButtonGradient}
            >
              <Ionicons name="chevron-back" size={24} color="#FFD700" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comprar Créditos</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Balance destacado con efecto glass */}
        <View style={styles.balanceSection}>
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"]}
            style={styles.balanceCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Efecto de borde luminoso */}
            <LinearGradient
              colors={["rgba(255, 215, 0, 0.3)", "transparent", "rgba(255, 215, 0, 0.1)"]}
              style={styles.balanceBorder}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            <View style={styles.balanceContent}>
              <View style={styles.balanceIconContainer}>
                <Ionicons name="diamond-outline" size={32} color="#FFD700" />
              </View>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Tu Balance Actual</Text>
                <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Descripción elegante */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Selecciona una cantidad para agregar a tu cuenta
          </Text>
        </View>

        {/* Opciones de crédito en grid 2x3 */}
        <View style={styles.optionsContainer}>
          {creditOptions.map((amount) => (
            <CreditCard
              key={amount}
              amount={amount}
              disabled={loading}
              isSelected={selectedAmount === amount}
              onPress={() => handleSelectAmount(amount)}
            />
          ))}
        </View>

        {/* Botón de compra principal */}
        <TouchableOpacity
          style={[
            styles.purchaseButton,
            (!selectedAmount || loading) && styles.purchaseButtonDisabled
          ]}
          activeOpacity={0.8}
          disabled={!selectedAmount || loading}
          onPress={() => selectedAmount && handleAddCredits(selectedAmount)}
        >
          <LinearGradient
            colors={
              selectedAmount && !loading
                ? ["rgba(255, 215, 0, 0.3)", "rgba(255, 165, 0, 0.4)", "rgba(255, 215, 0, 0.3)"]
                : ["rgba(100, 100, 100, 0.3)", "rgba(80, 80, 80, 0.4)", "rgba(100, 100, 100, 0.3)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.purchaseButtonGradient}
          >
            <View style={styles.purchaseButtonContent}>
              <Ionicons 
                name="flash" 
                size={22} 
                color={selectedAmount && !loading ? "#FFD700" : "#666"} 
              />
              <Text style={[
                styles.purchaseButtonText,
                (!selectedAmount || loading) && styles.purchaseButtonTextDisabled
              ]}>
                {loading ? "Procesando..." : `Comprar $${selectedAmount || ''}`}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Oferta limitada */}
        <View style={styles.offerBanner}>
          <View style={styles.offerGlow} />
          <Text style={styles.offerText}>OFERTA LIMITADA POR 24 HORAS</Text>
          <View style={styles.offerSparkle}>
            <Ionicons name="sparkles" size={16} color="#FFD700" />
          </View>
        </View>

        {/* Footer de seguridad */}
        <View style={styles.footer}>
          <View style={styles.securityBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#00FF88" />
            <Text style={styles.footerText}>
              Transacciones 100% seguras y encriptadas
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  backgroundEffects: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  glowCircle1: {
    position: "absolute",
    top: "20%",
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255, 215, 0, 0.03)",
    blurRadius: 50,
  },
  glowCircle2: {
    position: "absolute",
    bottom: "10%",
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(100, 65, 255, 0.03)",
    blurRadius: 50,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    zIndex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
    zIndex: 2,
  },
  backButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  backButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    textShadowColor: "rgba(255, 215, 0, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  placeholder: {
    width: 44,
  },
  balanceSection: {
    marginBottom: 32,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 2,
    position: "relative",
    overflow: "hidden",
  },
  balanceBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  balanceContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
    borderRadius: 18,
    backgroundColor: "rgba(20, 20, 30, 0.8)",
  },
  balanceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.2)",
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
    letterSpacing: 1,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FFD700",
    letterSpacing: -1,
    textShadowColor: "rgba(255, 215, 0, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  descriptionContainer: {
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    color: "#CCCCCC",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 32,
    justifyContent: "space-between",
  },
  creditOption: {
    width: (width - 64) / 2,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  creditOptionSelected: {
    borderColor: "rgba(255, 215, 0, 0.5)",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  creditGradient: {
    padding: 20,
    position: "relative",
    overflow: "hidden",
    minHeight: 80,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountContainer: {
    flex: 1,
  },
  creditAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  creditAmountSelected: {
    color: "#FFD700",
  },
  selectedIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  glowEffect: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderRadius: 16,
  },
  purchaseButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  purchaseButtonDisabled: {
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  purchaseButtonGradient: {
    padding: 20,
  },
  purchaseButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFD700",
    letterSpacing: 0.5,
  },
  purchaseButtonTextDisabled: {
    color: "#666",
  },
  offerBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.2)",
    marginBottom: 24,
    position: "relative",
    overflow: "hidden",
  },
  offerGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 215, 0, 0.05)",
  },
  offerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFD700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginRight: 8,
  },
  offerSparkle: {
    position: "absolute",
    right: 12,
  },
  footer: {
    alignItems: "center",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "rgba(0, 255, 136, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(0, 255, 136, 0.1)",
  },
  footerText: {
    fontSize: 12,
    color: "#00FF88",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});