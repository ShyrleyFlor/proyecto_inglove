import 'react-native-gesture-handler'; // Importa esto al inicio
import React, {useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import FirebaseLogin from './src/firebase-login/FirebaseLogin';
import FirebaseRecuperarCuenta from './src/firebase-login/FirebaseRecuperarCuenta';
import FirebaseCrearCuenta from './src/usuario/FirebaseCrearCuenta';
import ListarCuenta from './src/usuario/listarCuenta';
import EditarUsuario from './src/usuario/EditarUsuario';
import NuevaContraseñaScreen from './src/firebase-login/NuevaContraseña';
import ListarCategoria from './src/categorias/listarCategoria';
import EditCategoria from './src/categorias/editarCategoria';
import CreateCategoria from './src/categorias/crearCategoria';
import ListarMenu from './src/menu/listarMenu';
import ListarCategoriaG from './src/categorias/listarCategoria-g';
import EditarMenu from './src/menu/editarMenu';
import CrearMenu from './src/menu/crearMenu';
import ListarMesa from './src/mesa/listarmesag';
import ListarMesasM from './src/mesa/listarmesa';
import CrearPedidos from './src/pedidos/crearPedidos';
import EnCursoPedido from './src/pedidos/encursoPedido';
import ListarPedidos from './src/pedidos/listarpedidos';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
//inicializar rol
// Definición de tipos
interface TabNavigatorProps {
  rol: number | null; // El rol puede ser un número o null
}

/// Definir el tipo para los parámetros de navegación
type CategoriaStackParamList = {
  ListaCategorias: undefined;
  Menu: {categoriaNombre?: string};
};

// Creamos un stack navigator separado para la sección de categorías y menú
const CategoriaStack = createStackNavigator<CategoriaStackParamList>();
const CategoriaStackScreenMesero = () => {
  return (
    <CategoriaStack.Navigator>
      <CategoriaStack.Screen
        name="ListaCategorias"
        component={ListarCategoria}
        options={{headerShown: false}}
      />
      <CategoriaStack.Screen
        name="Menu"
        component={ListarMenu}
        options={({route}) => ({
          title: route.params?.categoriaNombre || 'Menú',
        })}
      />
    </CategoriaStack.Navigator>
  );
};

const CategoriaStackScreenGerente = () => {
  return (
    <CategoriaStack.Navigator>
      <CategoriaStack.Screen
        name="ListaCategorias"
        component={ListarCategoriaG}
        options={{headerShown: false}}
      />
      <CategoriaStack.Screen
        name="Menu"
        component={ListarMesasM}
        options={({route}) => ({
          title: route.params?.categoriaNombre || 'Menú',
        })}
      />
      
    </CategoriaStack.Navigator>
  );
};

// Componente para el Tab Navigator
const TabNavigator: React.FC<TabNavigatorProps> = ({rol}) => {
  return (
    <Tab.Navigator>
      {rol == 0 && (
        <>
          <Tab.Screen
            name="Cuentas"
            component={ListarCuenta}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              tabBarIcon: ({color, size}) => (
                <Icon name="account-circle" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Categorias"
            component={CategoriaStackScreenGerente}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              tabBarIcon: ({color, size}) => (
                <Icon name="category" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Mesas"
            component={ListarMesa}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              tabBarIcon: ({color, size}) => (
                <Icon name="table-restaurant" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Listar Pedidos"
            component={ListarPedidos}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              tabBarIcon: ({color, size}) => (
                <Icon name="list" color={color} size={size} />
              ),
            }}
          />
        </>
      )}
      {rol != 0 && (
        <>
          <Tab.Screen
            name="Categorias"
            component={CategoriaStackScreenMesero}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              tabBarIcon: ({color, size}) => (
                <Icon name="category" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Mesas"
            component={ListarMesasM}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              tabBarIcon: ({color, size}) => (
                <Icon name="table-restaurant" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Pedidos"
            component={CrearPedidos}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              tabBarIcon: ({color, size}) => (
                <Icon name="shopping-cart" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Listar Pedidos"
            component={ListarPedidos}
            options={{
              // eslint-disable-next-line react/no-unstable-nested-components
              tabBarIcon: ({color, size}) => (
                <Icon name="list" color={color} size={size} />
              ),
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
};

const App = () => {
  const [userRole, setUserRole] = useState<number | null>(null);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="FirebaseLogin">
        <Stack.Screen name="FirebaseLogin">
          {props => <FirebaseLogin {...props} setUserRole={setUserRole} />}
        </Stack.Screen>
        <Stack.Screen
          name="FirebaseRecuperarCuenta"
          component={FirebaseRecuperarCuenta}
        />
        <Stack.Screen
          name="FirebaseCrearCuenta"
          component={FirebaseCrearCuenta}
        />
        <Stack.Screen name="Cerrar Sesion" options={{headerShown: false}}>
          {() => <TabNavigator rol={userRole} />}
        </Stack.Screen>
        {/* Otras pantallas que no están en el Tab Navigator */}
        <Stack.Screen name="ListarCuentas" component={ListarCuenta} />
        <Stack.Screen name="EditarUsuario" component={EditarUsuario} />
        <Stack.Screen
          name="NuevaContraseña"
          component={NuevaContraseñaScreen}
        />
        <Stack.Screen name="EditCategoria" component={EditCategoria} />
        <Stack.Screen name="CreateCategoria" component={CreateCategoria} />
        <Stack.Screen name="EditarMenu" component={EditarMenu} />
        <Stack.Screen name="CrearMenu" component={CrearMenu} />
        <Stack.Screen name="ListarMesa" component={ListarMesa} />
        <Stack.Screen name='EnCursoPedido' component={EnCursoPedido} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default App;
