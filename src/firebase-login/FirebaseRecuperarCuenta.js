import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Input, Text } from "@rneui/themed";
import auth from '@react-native-firebase/auth';


const FirebaseRecuperarCuenta = ({ navigation }) => {

    const [email, setEmail] = useState('');

    const handleResetPassword = async () => {
        try {
            await auth().sendPasswordResetEmail(email);
            console.log('Correo de recuperación enviado');
            navigation.navigate('FirebaseLogin');
        } catch (error) {
            console.error("Error al enviar correo de recuperación: ", error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text h3 style={styles.title}>Recuperar Contraseña</Text>

            <Input
                placeholder="Correo Electrónico"
                leftIcon={{ type: 'material', name: 'email' }}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <Button title="Enviar Correo de Recuperación" buttonStyle={styles.button} onPress={handleResetPassword} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { textAlign: 'center', marginBottom: 20 },
    button: { backgroundColor: '#2089dc', marginTop: 20 },
});

export default FirebaseRecuperarCuenta;