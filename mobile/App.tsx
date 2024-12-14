import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ShoppingListDetailPage from './pages/ShoppingListDetailPage/ShoppingListDetailPage';
import ShoppingListsPage from './pages/ShoppingListsPage/ShoppingListsPage';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="ShoppingLists" component={ShoppingListsPage} />
        <Stack.Screen name="Register" component={RegisterPage} />
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="ShoppingListDetail" component={ShoppingListDetailPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;