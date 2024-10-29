import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';

// Mapa de imágenes
const imagenes = {
    'imagen1.png': require('../assets/hambur.png'),
    'imagen2.png': require('../assets/bebida.png'),
    // Agrega más imágenes según sea necesario
};

const ListarCategoria = () => {
    const [categorias, setCategorias] = useState([]);
    const [image, setImage] = useState(true);

    useEffect(() => {
        const obtenerCategorias = async () => {
            try {
                const snapshot = await firestore().collection('categorias').get();
                const listaCategorias = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setCategorias(listaCategorias);
            } catch (error) {
                console.error("Error al obtener las categorías:", error);
            } finally {
                setImage(false);
            }
        };

        obtenerCategorias();
    }, []);

    const obtenerImagen = (nombreArchivo) => {
        return imagenes[nombreArchivo] || require('../assets/default.png'); // Imagen de respaldo
    };

    if (image) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Categorías</Text>
            <FlatList
                data={categorias}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.categoriaContainer}>
                        <Image source={obtenerImagen(item.imagen)} style={styles.icono} />
                        <Text style={styles.nombre}>{item.nombre}</Text>
                    </View>
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
    },
});

export default ListarCategoria;
