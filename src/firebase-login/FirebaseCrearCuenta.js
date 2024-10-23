import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Input, Text } from '@rneui/themed';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const FirebaseCrearCuenta = ({ navigation }) => {
    const [nombre, setNombre] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('1'); // Por defecto es '1' (mesero)

    const handleSignUp = async () => {
        try {
            // Verificar si el usuario actual es gerente
            const user = auth().currentUser;
            const userDoc = await firestore().collection('usuarios').doc(user.uid).get();

            if (userDoc.exists && userDoc.data().rol === '0') { // Solo el gerente puede crear usuarios
                // Crear un nuevo usuario en Firestore
                await firestore().collection('usuarios').add({
                    nombre,
                    password,
                    rol,
                });
                Alert.alert('Cuenta creada exitosamente');
                navigation.navigate('FirebaseLogin');
            } else {
                Alert.alert('Acceso denegado', 'Solo los gerentes pueden crear nuevas cuentas.');
            }
        } catch (error) {
            console.error("Error al crear cuenta: ", error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text h3 style={styles.title}>Crear Cuenta</Text>

            <Input
                placeholder="Nombre de Usuario"
                leftIcon={{ type: 'material', name: 'person' }}
                value={nombre}
                onChangeText={setNombre}
            />

            <Input
                placeholder="Contraseña"
                leftIcon={{ type: 'material', name: 'lock' }}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <Button title="Registrar" buttonStyle={styles.button} onPress={handleSignUp} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { textAlign: 'center', marginBottom: 20 },
    button: { backgroundColor: '#2089dc', marginTop: 20 },
});

export default FirebaseCrearCuenta;
