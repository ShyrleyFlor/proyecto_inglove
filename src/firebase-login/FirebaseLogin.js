import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Input, Text } from '@rneui/themed';
import firestore from '@react-native-firebase/firestore';

const FirebaseLogin = ({ navigation, setUserRole }) => {
    const [nombre, setNombre] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const querySnapshot = await firestore()
                .collection('usuario')
                .where('nombre', '==', nombre)
                .where('contraseña', '==', password)
                .get();

            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                setUserRole(userData.rol); // Establecer el rol del usuario como número
                navigation.navigate('Cerrar Sesion'); // Redirigir a la navegación principal
            } else {
                Alert.alert('Error', 'Nombre o contraseña incorrectos.');
            }
            setNombre('');
            setPassword('');
        } catch (error) {
            console.error("Error al iniciar sesión: ", error.message);
        }
    };

    const handleRecoverAccount = () => {
        // Reiniciar los inputs de login
        setNombre('');
        setPassword('');
        navigation.navigate('FirebaseRecuperarCuenta');
    };


    return (
        <View style={styles.container}>
            <Text h3 style={styles.title}>Iniciar Sesión</Text>

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

            <Button title="Entrar" buttonStyle={styles.button} onPress={handleLogin} />

            <Button
                title="Recuperar Cuenta"
                type="clear"
                buttonStyle={styles.buttonrec}
                titleStyle={styles.recoverText}
                onPress={handleRecoverAccount}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { textAlign: 'center', marginBottom: 20 },
    button: { backgroundColor: '#2089dc', marginTop: 20 },
    recoverText: { color: '#f8f9fa' },
    buttonrec: { marginTop: 10, backgroundColor: '#c1121f' },
});

export default FirebaseLogin;
