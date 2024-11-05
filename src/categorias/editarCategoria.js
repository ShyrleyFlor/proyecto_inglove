// src/categorias/EditCategoria.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';

const EditCategoria = () => {
    const [categoria, setCategoria] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const route = useRoute();
    const { categoriaId } = route.params;

    console.log(categoriaId);

    useEffect(() => {
        console.log("categoriaId:", categoriaId); // Esto debería mostrar el ID correcto ahora
        const cargarCategoria = async () => {
            if (categoriaId) {
                try {
                    const doc = await firestore().collection('categorias').doc(categoriaId).get();
                    if (doc.exists) {
                        setCategoria({ id: doc.id, nombre: doc.data().nombre });
                    } else {
                        Alert.alert("Error", "La categoría no se encontró.");
                    }
                } catch (error) {
                    console.error("Error al cargar la categoría:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                Alert.alert("Error", "ID de categoría no válido.");
                setLoading(false);
            }
        };
        cargarCategoria();
    }, [categoriaId]);


    const guardarCambios = async () => {
        if (categoria) {
            try {
                const docRef = firestore().collection('categorias').doc(categoria.id);
                const doc = await docRef.get();

                if (!doc.exists) {
                    Alert.alert("Error", "La categoría no existe.");
                    return; // Salir si el documento no existe
                }

                await docRef.update({
                    nombre: categoria.nombre,
                });
                Alert.alert("Éxito", "La categoría ha sido actualizada.");
                navigation.goBack();
            } catch (error) {
                console.error("Error al guardar cambios:", error);
                Alert.alert("Error", "Hubo un problema al actualizar la categoría.");
            }
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#000000" />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Editar Categoría</Text>
            <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={categoria?.nombre}
                onChangeText={(text) => setCategoria({ ...categoria, nombre: text })}
            />
            <Button title="Guardar Cambios" onPress={guardarCambios} />
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
    input: {
        height: 40,
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: '#f2f2f2',
        color: 'black',
    },
});

export default EditCategoria;
