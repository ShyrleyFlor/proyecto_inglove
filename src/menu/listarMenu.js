import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const MenuScreen = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener categorías
    const unsubscribeCategories = firestore()
      .collection('categorias')
      .onSnapshot(snapshot => {
        const catList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(catList);
      });

    // Obtener menú
    const unsubscribeMenu = firestore()
      .collection('menu')
      .onSnapshot(snapshot => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMenuItems(items);
        setLoading(false);
      }, error => {
        console.error("Error fetching menu items: ", error);
        setLoading(false);
      });

    return () => {
      unsubscribeCategories();
      unsubscribeMenu();
    };
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.nombre : 'Sin categoría';
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.menuItem}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.title}>{item.nombre}</Text>
            <Text style={styles.description}>{item.descripcion}</Text>
            <Text style={styles.price}>${item.precio}</Text>
            <Text>Categoría: {getCategoryName(item.categoriaId)}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  menuItem: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f44c71',
    marginBottom: 10,
  },
});

export default MenuScreen;