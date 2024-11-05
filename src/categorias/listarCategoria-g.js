import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { Icon, FAB, Button } from '@rneui/themed';

const ListarCategoria = () => {
    const [categorias, setCategorias] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = firestore()
            .collection('categorias')
            .onSnapshot(snapshot => {
                const listaCategorias = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setCategorias(listaCategorias);
                setLoading(false);
            }, error => {
                console.error("Error al obtener las categorías:", error);
                setLoading(false);
            });

        return () => unsubscribe();
    }, []);

    const navegarAMenu = (categoria) => {
        console.log('Navegando a menú con categoría:', categoria); // Para depuración
        navigation.navigate('Menu', {
            categoriaId: categoria.id,
            categoriaNombre: categoria.nombre,
        });
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    const obtenerIcono = (categoria) => {
        // Puedes mapear categorías a iconos específicos
        switch (categoria.nombre.toLowerCase()) {
            case 'bebidas':
                return 'local-drink';
            case 'pizzas':
                return 'local-pizza';
            case 'hamburguesas':
                return 'lunch-dining';
            case 'postres':
                return 'cake';
            default:
                return 'restaurant-menu';
        }
    };

    const eliminarCategoria = async (categoriaId) => {
        Alert.alert(
            "Confirmar eliminación",
            `¿Está seguro que desea eliminar la categoría?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await firestore()
                                .collection('categorias')
                                .doc(categoriaId)
                                .delete();
                            console.log('Categoría eliminada con éxito');
                        } catch (error) {
                            console.error('Error al eliminar la categoría:', error);
                            Alert.alert("Error", "No se pudo eliminar la categoría");
                        }
                    }
                }
            ]
        );
    };


    return (
        <View style={styles.container}>
            {/* Botón Crear Menú en la parte superior */}
            <Button
                title="Crear Menú"
                icon={{
                    name: 'add',
                    type: 'material',
                    size: 20,
                    color: 'white',
                }}
                iconContainerStyle={{ marginRight: 10 }}
                buttonStyle={styles.createButton}
                onPress={() => navigation.navigate('CrearMenu')}
            />
            <FlatList
                data={categorias}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.categoriaContainer}
                        onPress={() => navegarAMenu(item)}
                    >
                        <Icon
                            name={obtenerIcono(item)}
                            size={30}
                            color="#666"
                            style={styles.icono}
                        />
                        <Text style={styles.nombre}>{item.nombre}</Text>
                        <View style={styles.botonesContainer}>
                            <TouchableOpacity
                                style={styles.botonAccion}
                                onPress={() => navigation.navigate('EditCategoria', { categoria: item })}
                            >
                                <Icon
                                    name="edit"
                                    size={24}
                                    color="#2089dc"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.botonAccion}
                                onPress={() => eliminarCategoria(item.id)}
                            >
                                <Icon
                                    name="delete"
                                    size={24}
                                    color="#ff0000"
                                />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}
            />
            {/* Botón flotante para crear menú */}
            <FAB
                icon={{ name: 'add', color: 'white' }}
                color="#2089dc"
                placement="right"
                style={styles.fab}
                onPress={() => navigation.navigate('CreateCategoria')}
            />
        </View>
    );
};

// Estilos...
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    categoriaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        justifyContent: 'space-between', // Añadido para espaciar los elementos
    },
    botonesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    botonAccion: {
        padding: 5,
        marginLeft: 10,
    },
    icono: {
        width: 50,
        height: 50,
        marginRight: 15,
        color: '#780000',
    },
    nombre: {
        fontSize: 18,
        fontWeight: '500',
        color: '#000',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    }
});

export default ListarCategoria;
