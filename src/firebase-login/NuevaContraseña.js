import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import { useNavigation, useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const NuevaContraseñaScreen = () => {
    const [nuevaContraseña, setNuevaContraseña] = useState('');
    const [confirmarContraseña, setConfirmarContraseña] = useState('');
    const navigation = useNavigation();
    const route = useRoute();
    const { userId } = route.params; // Extrae el userId pasado desde la pantalla de recuperación

    const handleGuardarContraseña = async () => {
        if (nuevaContraseña !== confirmarContraseña) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        try {
            // Verifica si el documento del usuario existe antes de intentar actualizar
            const usuarioDoc = await firestore().collection('usuario').doc(userId).get();
            
            if (!usuarioDoc.exists) {
                Alert.alert('Error', 'El usuario no existe');
                return;
            }

            // Actualiza la contraseña en Firestore
            await firestore().collection('usuario').doc(userId).update({
                contraseña: nuevaContraseña,
            });

            Alert.alert('Éxito', 'Contraseña actualizada exitosamente');
            navigation.navigate('FirebaseLogin'); // Redirige al inicio de sesión
        } catch (error) {
            console.error('Error al actualizar la contraseña:', error);
            Alert.alert('Error', 'No se pudo actualizar la contraseña. Intente nuevamente.');
        }
    };

    return (
        <View style={styles.container}>
            <Text h4 style={styles.title}>Ingresa Nueva Contraseña</Text>
            <Input
                label="Nueva Contraseña"
                //placeholder="Ingresa tu nueva contraseña"
                value={nuevaContraseña}
                onChangeText={setNuevaContraseña}
                secureTextEntry
            />
            <Input
                label="Confirmar Contraseña"
                //placeholder="Confirma tu nueva contraseña"
                value={confirmarContraseña}
                onChangeText={setConfirmarContraseña}
                secureTextEntry
            />
            <Button
                title="Guardar"
                buttonStyle={styles.button}
                onPress={handleGuardarContraseña}
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

export default NuevaContraseñaScreen;
