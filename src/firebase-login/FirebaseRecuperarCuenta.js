import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const FirebaseRecuperarCuenta = () => {
    const [usuario, setUsuario] = useState('');
    const navigation = useNavigation();

    // Función para verificar si el usuario existe en la base de datos
    const handleContinuar = async () => {
        try {
            const querySnapshot = await firestore()
                .collection('usuario')
                .where('nombre', '==', usuario) // Cambia 'nombre' al nombre correcto del campo en Firestore
                .get();

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userId = userDoc.id;

                // Navega a la pantalla de Nueva Contraseña con el usuario y su ID
                navigation.navigate('NuevaContraseña', { usuario, userId });
            } else {
                Alert.alert('Error', 'El usuario no existe');
            }
        } catch (error) {
            console.error('Error al verificar usuario:', error);
            Alert.alert('Error', 'Hubo un problema al verificar el usuario. Inténtalo nuevamente.');
        }
    };

    return (
        <View style={styles.container}>
            <Text h4 style={styles.title}>Recuperar Cuenta</Text>
            <Input
                label="Nombre de Usuario"
                placeholder="Ingresa tu nombre de usuario"
                value={usuario}
                onChangeText={setUsuario}
            />
            <Button
                title="Continuar"
                buttonStyle={styles.button}
                onPress={handleContinuar}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 20,
        color: 'black',
    },
    button: {
        backgroundColor: '#007bff',
        marginTop: 10,
    },
});

export default FirebaseRecuperarCuenta;
