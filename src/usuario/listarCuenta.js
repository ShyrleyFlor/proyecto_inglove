import React, { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { FlatList, View, StyleSheet, Alert } from 'react-native';
import { ListItem, Text, Button } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';

const ListarCuenta = () => {
    const [data, setData] = useState([]);
    const [rtdata, setRTData] = useState([]);
    const navigation = useNavigation(); 

    // Función para cargar datos una sola vez
    async function loadData() {
        try {
            const usuariosSnapshot = await firestore().collection('usuarios').get(); // Cambia 'usuarios' al nombre de tu colección
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
        // Navegar a la pantalla de edición y pasar el objeto `usuario` completo como parámetro
        navigation.navigate('EditarUsuario', { usuario: item });
    };

    return (
        <FlatList
            data={combinedData}
            keyExtractor={item => item.key}
            renderItem={({ item }) => (
                <ListItem bottomDivider>
                    <ListItem.Content>
                        <ListItem.Title style={styles.textBlack}>{item.nombre}</ListItem.Title>
                        <ListItem.Subtitle style={styles.textBlack}>
                            {item.rol == '0' ? 'Gerente' : 'Mesero'}
                        </ListItem.Subtitle>
                    </ListItem.Content>
                    <Button
                            title="Editar"
                            buttonStyle={styles.editButton}
                            onPress={() => handleEdit(item)} // Navegar a la pantalla de edición
                        />
                    <Button
                        title="Eliminar"
                        buttonStyle={styles.deleteButton}
                        onPress={() => handleDelete(item.key)}
                    />
                </ListItem>
            )}
            ListHeaderComponent={() => (
                <View style={{ padding: 10, alignItems: 'center' }}>
                    <Text h4 style={styles.textBlack}>Usuarios</Text>
                    <Button
                            title="Crear Usuario"
                            buttonStyle={styles.createButton}
                            onPress={() => navigation.navigate('FirebaseCrearCuenta')} // Navega a la pantalla de crear usuario
                        />
                </View>
            )}
        />
    );
};

// Estilos
const styles = StyleSheet.create({
    textBlack: {
        color: 'black', // Color de texto negro
        fontSize: 18,
        marginBottom: 5,
        marginLeft: 10,

    },
    deleteButton: {
        backgroundColor: '#ff3b30', // Color de botón de eliminar
        marginLeft: 10,
    },
    createButton: {
        backgroundColor: '#4CAF50', // Color verde para el botón de creación
        marginTop: 10,
    },
    editButton: {
        backgroundColor: '#007bff', // Color de botón de editar (azul)
        marginLeft: 10,
    },
});

export default ListarCuenta;
