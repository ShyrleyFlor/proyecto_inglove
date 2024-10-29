import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    StyleSheet,
    ActivityIndicator,
    Button,
    Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

// Mapa de imágenes
const imagenes = {
    'imagen1.png': require('../assets/hambur.png'),
    'imagen2.png': require('../assets/bebida.png'),
    // Agrega más imágenes según sea necesario
};

const ListarCategoria = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = firestore()
            .collection('categorias')
            .onSnapshot(
                snapshot => {
                    const listaCategorias = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setCategorias(listaCategorias);
                    setLoading(false);
                },
                error => {
                    console.error("Error al obtener las categorías:", error);
                    setLoading(false);
                }
            );

        return () => unsubscribe(); // Desuscribirse cuando el componente se desmonte
    }, []);

    const obtenerImagen = (nombreArchivo) => {
        return imagenes[nombreArchivo] || require('../assets/default.png');
    };

    const eliminarCategoria = (id) => {
        Alert.alert(
            "Confirmar Eliminación",
            "¿Estás seguro de que deseas eliminar esta categoría?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", onPress: async () => {
                    try {
                        await firestore().collection('categorias').doc(id).delete();
                    } catch (error) {
                        console.error("Error al eliminar la categoría:", error);
                    }
                }},
            ]
        );
    };

    const editarCategoria = (categoria) => {
        navigation.navigate('EditCategoria', { categoriaId: categoria.id });
    };

    const crearCategoria = () => {
        navigation.navigate('CreateCategoria');
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Categorías</Text>
            <Button title="Crear Nueva Categoría" onPress={crearCategoria} color="#1d3557" />
            <FlatList
                data={categorias}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.categoriaContainer}>
                        <Image source={obtenerImagen(item.imagen)} style={styles.icono} />
                        <Text style={styles.nombre}>{item.nombre}</Text>
                        <View style={styles.botonContainer}>
                            <Button
                                title="Editar"
                                onPress={() => editarCategoria(item)}
                                color="#1d3557"
                            />
                            <Button
                                title="Eliminar"
                                onPress={() => eliminarCategoria(item.id)}
                                color="#e63946"
                            />
                        </View>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#000',
    },
    categoriaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        justifyContent: 'space-between',
    },
    icono: {
        width: 50,
        height: 50,
        marginRight: 15,
    },
    nombre: {
        fontSize: 18,
        fontWeight: '500',
        color: '#000',
        flex: 1,
    },
    botonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 150,
    },
});

export default ListarCategoria;
