import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { Icon } from '@rneui/themed';

const ListarCategoria = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = firestore()
            .collection('categorias')
            .onSnapshot(snapshot => {
                const listaCategorias = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setCategorias(listaCategorias);
                setLoading(false);
            }, error => {
                console.error("Error al obtener las categorías:", error);
                setLoading(false);
            });

        return () => unsubscribe();
    }, []);

    const navegarAMenu = (categoria) => {
        console.log('Navegando a menú con categoría:', categoria); // Para depuración
        navigation.navigate('Menu', {
            categoriaId: categoria.id,
            categoriaNombre: categoria.nombre,
        });
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    const obtenerIcono = (categoria) => {
        // Puedes mapear categorías a iconos específicos
        switch(categoria.nombre.toLowerCase()) {
            case 'bebidas':
                return 'local-drink';
            case 'pizzas':
                return 'local-pizza';
            case 'hamburguesas':
                return 'lunch-dining';
            default:
                return 'restaurant-menu';
        }
    };


    return (
        <View style={styles.container}>
            <FlatList
                data={categorias}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.categoriaContainer}
                        onPress={() => navegarAMenu(item)}
                    >
                        <Icon 
                            name={obtenerIcono(item)} 
                            size={30} 
                            color="#666"
                            style={styles.icono}
                        />
                        <Text style={styles.nombre}>{item.nombre}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

// Estilos...
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    categoriaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
    },
    icono: {
        width: 50,
        height: 50,
        marginRight: 15,
        color: '#780000',
    },
    nombre: {
        fontSize: 18,
        fontWeight: '500',
        color: '#000',
    },
});

export default ListarCategoria;
