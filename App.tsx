import 'react-native-gesture-handler'; // Importa esto al inicio

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import FirebaseLogin from './src/firebase-login/FirebaseLogin';
import FirebaseRecuperarCuenta from './src/firebase-login/FirebaseRecuperarCuenta';
import FirebaseCrearCuenta from './src/firebase-login/FirebaseCrearCuenta';
import GerenteHome from './src/screens/gerenteHome';
import MeseroHome from './src/screens/meseroHome';

const Stack = createStackNavigator();



const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="FirebaseLogin">
        <Stack.Screen name="FirebaseLogin" component={FirebaseLogin} />
        <Stack.Screen name="FirebaseRecuperarCuenta" component={FirebaseRecuperarCuenta} />
        <Stack.Screen name="FirebaseCrearCuenta" component={FirebaseCrearCuenta} />
        <Stack.Screen name="GerenteHome" component={GerenteHome} />
        <Stack.Screen name="MeseroHome" component={MeseroHome} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;