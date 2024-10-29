import 'react-native-gesture-handler'; // Importa esto al inicio

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import FirebaseLogin from './src/firebase-login/FirebaseLogin';
import FirebaseRecuperarCuenta from './src/firebase-login/FirebaseRecuperarCuenta';
import FirebaseCrearCuenta from './src/usuario/FirebaseCrearCuenta';
import GerenteHome from './src/screens/gerenteHome';
import MeseroHome from './src/screens/meseroHome';
import ListarCuenta from './src/usuario/listarCuenta';
import EditarUsuario from './src/usuario/EditarUsuario';
import NuevaContraseñaScreen from './src/firebase-login/NuevaContraseña';
import ListarCategoria from './src/categorias/listarCategoria';
import ListarCategoriag from './src/categorias/listarCategoria-g';
import EditCategoria from './src/categorias/editarCategoria';
import CreateCategoria from './src/categorias/crearCategoria';
import ListarMenu from './src/menu/listarMenu';

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
        <Stack.Screen name="ListarCuentas" component={ListarCuenta} />
        <Stack.Screen name="EditarUsuario" component={EditarUsuario} />
        <Stack.Screen name="NuevaContraseña" component={NuevaContraseñaScreen} />
        <Stack.Screen name="ListarCategorias" component={ListarCategoria} />
        <Stack.Screen name="ListarCategoriag" component={ListarCategoriag} />
        <Stack.Screen name="EditCategoria" component={EditCategoria} />
        <Stack.Screen name="CreateCategoria" component={CreateCategoria} />
        <Stack.Screen name="ListarMenu" component={ListarMenu} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;