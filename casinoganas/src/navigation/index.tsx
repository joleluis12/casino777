import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import HomeScreen from "../screens/Home/HomeScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";

// 🎰 Juegos
import ResultScreen from "../games/game1/ResultScreen";
import CosmicRoulette from "../games/game2/CosmicRoulette";
import BattleOfElements from "../games/game3/BattleOfElements"
import RouletteGame4 from "../games/game4/RouletteGame";
import CosmicSpin from "../games/game5/CosmicSpin";
import NeonFruits from "../games/game6/NeonFruits";
import MysticGems from "../games/game7/MysticGems";
import MegaSevens from "../games/game8/MegaSevens";
import DiceDuelGame from "../games/game11/DiceDuelGame";
import Lucky7Game from "../games/game10/Lucky7Game";
import BlackjackGame from "../games/game9/BlackjackGame";






// 💳 Nueva pantalla de compras
import BuyCreditsScreen from "../screens/Credits/BuyCreditsScreen";


const Stack = createStackNavigator();

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />

            {/* 🎮 Juegos */}
            
           

            {/* 💳 Comprar Créditos */}
            <Stack.Screen name="BuyCredits" component={BuyCreditsScreen} />

            <Stack.Screen name="CosmicRoulette" component={CosmicRoulette} />
            
            <Stack.Screen name="BattleOfElements" component={BattleOfElements} />

            <Stack.Screen name="RouletteGame4" component={RouletteGame4} />

            <Stack.Screen name="CosmicSpin" component={CosmicSpin} />

            <Stack.Screen name="MysticGems" component={MysticGems}/>

            <Stack.Screen name="NeonFruits" component={NeonFruits}/>

            <Stack.Screen name="MegaSevens" component={MegaSevens}/>

            <Stack.Screen name="DiceDuelGame" component={DiceDuelGame} />

            <Stack.Screen name="Lucky7Game" component={Lucky7Game} />

            <Stack.Screen name="BlackjackGame" component={BlackjackGame} />

        




          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
