import React, { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { FlatList, View, StyleSheet, Alert } from 'react-native';
import { ListItem, Button } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ListarCuenta = () => {
    const [data, setData] = useState([]);
    const [rtdata, setRTData] = useState([]);
    const navigation = useNavigation();

    // Función para cargar datos una sola vez
    async function loadData() {
        try {
            const usuariosSnapshot = await firestore().collection('usuarios').get();
            const usuarios = usuariosSnapshot.docs.map(doc => ({
                ...doc.data(),
                key: doc.id,
            }));
            setData(usuarios);
        } catch (error) {
            console.log("Error al cargar los usuarios: ", error);
        }
    }

    // Función para leer datos en tiempo real
    async function loadTRData() {
        const subscriber = firestore().collection('usuario').onSnapshot(querySnapshot => {
            const usuarios = [];
            querySnapshot.forEach(documentSnapshot => {
                usuarios.push({
                    ...documentSnapshot.data(),
                    key: documentSnapshot.id,
                });
            });
            setRTData(usuarios);
        });

        return () => subscriber();
    }

    useEffect(() => {
        loadData();
        loadTRData();
    }, []);

    // Combina ambas listas
    const combinedData = [...data, ...rtdata];

    // Función para eliminar un usuario
    const handleDelete = async (id) => {
        Alert.alert(
            'Confirmación',
            '¿Estás seguro de que deseas eliminar este usuario?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    onPress: async () => {
                        try {
                            await firestore().collection('usuario').doc(id).delete();
                            Alert.alert('Éxito', 'Usuario eliminado exitosamente');
                        } catch (error) {
                            console.error("Error al eliminar usuario: ", error.message);
                            Alert.alert('Error', 'Ha ocurrido un error al eliminar el usuario. Por favor, intenta nuevamente.');
                        }
                    },
                },
            ]
        );
    };

    const handleEdit = (item) => {
        navigation.navigate('EditarUsuario', { usuario: item });
    };

    return (
        <View style={styles.container}>
            {/* Botón Crear Usuario en la parte superior */}
            <Button
                buttonStyle={styles.createButton}
                icon={<Icon name="add" size={20} color="white"  />} // Icono de "+"
                onPress={() => navigation.navigate('FirebaseCrearCuenta')} // Navega a la pantalla de crear usuario
            />

            <FlatList
                data={combinedData}
                keyExtractor={item => item.key}
                renderItem={({ item }) => (
                    <ListItem bottomDivider>
                        <ListItem.Content>
                            <ListItem.Title style={styles.textBlack}>{item.nombre}</ListItem.Title>
                            <ListItem.Subtitle style={styles.textBlack}>
                                {item.rol === '0' ? 'Gerente' : 'Mesero'}
                            </ListItem.Subtitle>
                        </ListItem.Content>
                        {/* Icono de Editar */}
                        <Button
                            icon={<Icon name="edit" size={20} color="white" />}
                            buttonStyle={styles.editButton}
                            onPress={() => handleEdit(item)} // Navegar a la pantalla de edición
                        />
                        {/* Icono de Eliminar */}
                        <Button
                            icon={<Icon name="delete" size={20} color="white" />}
                            buttonStyle={styles.deleteButton}
                            onPress={() => handleDelete(item.key)}
                        />
                    </ListItem>
                )}
            />
        </View>
    );
};

// Estilos
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        position: 'relative',
    },
    textBlack: {
        color: 'black',
        fontSize: 18,
        marginRight: 10,
    },
    deleteButton: {
        backgroundColor: '#ff3b30',
        marginLeft: 10,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    createButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 10, // Espacio entre el botón y la lista
    },
    editButton: {
        backgroundColor: '#007bff',
        marginLeft: 10,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
});

export default ListarCuenta;