import React, { useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { View, StyleSheet, Alert } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import { useRoute, useNavigation } from '@react-navigation/native'; 
import { Picker } from '@react-native-picker/picker';

const EditarUsuario = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { usuario } = route.params; // Obtenemos el usuario desde la ruta

    const [nombre, setNombre] = useState(usuario.nombre);
    const [rol, setRol] = useState(usuario.rol);

    // Función para guardar los cambios
    const handleSave = async () => {
        try {
            await firestore().collection('usuario').doc(usuario.key).update({
                nombre: nombre,
                rol: rol,
            });
            Alert.alert('Éxito', 'Usuario actualizado exitosamente');
            navigation.goBack(); // Volver a la lista después de guardar
        } catch (error) {
            console.error("Error al actualizar usuario: ", error.message);
            Alert.alert('Error', 'Hubo un problema al actualizar el usuario. Por favor, intenta de nuevo.');
        }
    };

    return (
        <View style={styles.container}>
            <Input
                label="Nombre"
                value={nombre}
                leftIcon={{ type: 'material', name: 'person' }}
                onChangeText={setNombre}
                placeholder="Nombre del usuario"
            />
            {/* Picker para el rol */}
            <Text style={styles.label}>Rol</Text>
            <Picker
                selectedValue={rol}
                style={styles.picker}
                onValueChange={(itemValue) => setRol(itemValue)}
            >
                <Picker.Item label="Gerente" value="0" />
                <Picker.Item label="Mesero" value="1" />
            </Picker>
            <Button
                title="Guardar Cambios"
                buttonStyle={styles.saveButton}
                onPress={handleSave}
            />
        </View>
    );
};

// Estilos
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    textBlack: {
        color: 'black',
        fontSize: 18,
        marginBottom: 20,
    },
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 20,
        color: 'black',
    },
    saveButton: {
        backgroundColor: '#007bff',
        marginTop: 10,
    },
});

export default EditarUsuario;
