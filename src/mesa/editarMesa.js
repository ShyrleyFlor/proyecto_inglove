import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Alert } from 'react-native';
import { Overlay, Button } from '@rneui/themed';
import firestore from '@react-native-firebase/firestore';

const EditarMesa = ({ visible, onClose, mesa }) => {
    const [numero, setNumero] = useState(mesa?.numero?.toString() || '');
     // Actualiza el estado cuando cambia la mesa
     useEffect(() => {
        if (mesa) {
            setNumero(mesa.numero.toString()); // Asegúrate de que sea una cadena
        } else {
            setNumero(''); // Resetea el número si no hay mesa
        }
    }, [mesa]);

    const guardarCambios = async () => {
        if (!numero.trim()) {
            Alert.alert('Error', 'El número de mesa es requerido');
            return;
        }

        try {
            await firestore()
                .collection('mesa')
                .doc(mesa.id)
                .update({
                    numero: parseInt(numero)
                });
            Alert.alert('Éxito', 'Mesa actualizada correctamente');
            onClose();
        } catch (error) {
            console.error('Error al actualizar la mesa:', error);
            Alert.alert('Error', 'No se pudo actualizar la mesa');
        }
    };

    return (
        <Overlay
            isVisible={visible}
            onBackdropPress={onClose}
            overlayStyle={styles.overlay}
        >
            <View style={styles.container}>
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
                        title="Guardar"
                        onPress={guardarCambios}
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
    }
});

export default EditarMesa;