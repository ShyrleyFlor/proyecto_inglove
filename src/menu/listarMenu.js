import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const MenuScreen = ({ route, navigation }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si route.params existe
    if (!route || !route.params || !route.params.categoriaId) {
      console.error('No se recibió categoriaId');
      setLoading(false);
      return;
    }

    const { categoriaId } = route.params;
    console.log('CategoriaId recibido:', categoriaId); // Para depuración

    // Crear una referencia directa al documento
    const categoriaRef = firestore().collection('categorias').doc(categoriaId);

    const unsubscribe = firestore()
      .collection('menu')
      .where('categoriaId', '==', categoriaRef) // Usar la referencia directa
      .onSnapshot(
        snapshot => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log('Menús encontrados:', items); // Para depuración
          setMenuItems(items);
          setLoading(false);
        },
        error => {
          console.error('Error al obtener menús:', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [route, route?.params?.categoriaId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.categoryTitle}>
        {route?.params?.categoriaNombre || 'Menú'}
      </Text>

      <FlatList
        data={menuItems}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.menuItem}>
            {item.image && (
              <Image
                source={{ uri: item.image }}
                style={styles.menuImage}
              />
            )}
            <View style={styles.menuInfo}>
              <Text style={styles.menuName}>{item.nombre}</Text>
              <Text style={styles.menuDescription}>{item.descripcion}</Text>
              <Text style={styles.menuPrice}>{item.precio} GS</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyMessage}>
            No hay elementos en esta categoría
          </Text>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    elevation: 2,
  },
  menuImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  menuInfo: {
    flex: 1,
    marginLeft: 12,
  },
  menuName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#219ebc',
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#023047',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  }
});

export default MenuScreen;