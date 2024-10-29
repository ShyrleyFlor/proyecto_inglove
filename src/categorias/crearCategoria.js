// src/categorias/CreateCategoria.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const CreateCategoria = () => {
    const [nombre, setNombre] = useState('');
    const navigation = useNavigation();

    const crearCategoria = async () => {
        if (nombre.trim() === '') {
            Alert.alert("Error", "El nombre de la categoría es obligatorio.");
            return;
        }

        try {
            await firestore().collection('categorias').add({
                nombre: nombre,
                // Agrega otros campos aquí si es necesario, como `imagen: ''`
            });
            Alert.alert("Éxito", "La categoría ha sido creada.");
            navigation.goBack();
        } catch (error) {
            console.error("Error al crear la categoría:", error);
            Alert.alert("Error", "Hubo un problema al crear la categoría.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Nueva Categoría</Text>
            <TextInput
                style={styles.input}
                placeholder="Nombre de la categoría"
                value={nombre}
                onChangeText={setNombre}
            />
            <Button title="Crear Categoría" onPress={crearCategoria} />
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

export default CreateCategoria;
