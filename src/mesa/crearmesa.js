import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, Text } from 'react-native';
import { Overlay, Button } from '@rneui/themed';
import firestore from '@react-native-firebase/firestore';

const CrearMesa = ({ visible, onClose }) => {
    const [numero, setNumero] = useState('');

    const guardarMesa = async () => {
        if (!numero.trim()) {
            Alert.alert('Error', 'El número de mesa es requerido');
            return;
        }

        try {
            await firestore()
                .collection('mesa')
                .add({
                    numero: parseInt(numero),
                    status: 0 // Estado por defecto: disponible
                });
            Alert.alert('Éxito', 'Mesa creada correctamente');
            onClose(); // Cierra el modal después de crear la mesa
        } catch (error) {
            console.error('Error al crear la mesa:', error);
            Alert.alert('Error', 'No se pudo crear la mesa');
        }
    };

    return (
        <Overlay
            isVisible={visible}
            onBackdropPress={onClose}
            overlayStyle={styles.overlay}
        >
            <View style={styles.container}>
                <Text style={styles.label}>Número de mesa</Text>
                <TextInput
                    style={styles.input}
                    value={numero}
                    onChangeText={setNumero}
                    placeholder="Número de mesa"
                    keyboardType="numeric"
                    autoFocus
                />
                <View style={styles.botonesContainer}>
                    <Button
                        title="Cancelar"
                        type="outline"
                        onPress={onClose}
                        containerStyle={styles.boton}
                    />
                    <Button
                        title="Crear"
                        onPress={guardarMesa}
                        containerStyle={styles.boton}
                    />
                </View>
            </View>
        </Overlay>
    );
};

const styles = StyleSheet.create({
    overlay: {
        width: '80%',
        padding: 20,
    },
    container: {
        width: '100%',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        fontSize: 16,
        color: 'black',
    },
    botonesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    boton: {
        width: '45%',
    },
    label: {
        fontSize: 16,
        marginBottom: 10, // Espacio entre la etiqueta y el campo de entrada
        color: 'black',
    },
});

export default CrearMesa;