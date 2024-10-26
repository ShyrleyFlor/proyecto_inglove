import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Input, Text } from '@rneui/themed';
import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const FirebaseCrearCuenta = ({ navigation }) => {
    const [nombre, setNombre] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('1'); // Por defecto es '1' (mesero)

    const handleSignUp = async () => {
        try {
            // Crear un nuevo usuario en Firestore
            await firestore().collection('usuario').add({
                nombre,
                password,
                rol,
            });
            Alert.alert('Cuenta creada exitosamente');
            navigation.navigate('ListarCuentas');
        } catch (error) {
            console.error("Error al crear cuenta: ", error.message);
            Alert.alert('Error', 'Ha ocurrido un error al crear la cuenta. Por favor, intenta nuevamente.');
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
                inputContainerStyle={styles.input}
            />

            <Input
                placeholder="Contraseña"
                leftIcon={{ type: 'material', name: 'lock' }}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                inputContainerStyle={styles.input}
            />

            <Picker
                selectedValue={rol}
                style={styles.picker}
                onValueChange={(itemValue) => setRol(itemValue)}
            >
                <Picker.Item label="Gerente" value="0" />
                <Picker.Item label="Mesero" value="1" />
            </Picker>

            <Button title="Registrar" buttonStyle={styles.button} onPress={handleSignUp} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { textAlign: 'center', marginBottom: 20, color: 'black' }, // Letras en negro
    button: { backgroundColor: '#2089dc', marginTop: 20 },
    picker: { height: 50, width: '100%', marginBottom: 20 },
    input: { borderColor: 'black', borderWidth: 1, borderRadius: 5 }, // Estilo de entrada
});

export default FirebaseCrearCuenta;
