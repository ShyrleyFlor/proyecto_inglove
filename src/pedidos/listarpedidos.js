import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { Icon } from '@rneui/themed';

const ListarPedidos = ({ navigation }) => {
    const [pedidos, setPedidos] = useState([]);
    const [filtro, setFiltro] = useState('todos'); // Estado para el filtro
    const [cargando, setCargando] = useState(true); // Estado de carga

    useEffect(() => {
        const obtenerDatos = () => {
            setCargando(true); // Iniciar carga

            const unsubscribe = firestore().collection('pedidos').onSnapshot(
                async snapshot => {
                    const listaPedidos = await Promise.all(snapshot.docs.map(async doc => {
                        const pedidoData = {
                            id: doc.id,
                            ...doc.data(),
                        };

                        // Obtener los datos de la mesa usando la referencia
                        if (pedidoData.mesaId) {
                            try {
                                const mesaDoc = await pedidoData.mesaId.get();
                                pedidoData.mesaNumero = mesaDoc.exists ? mesaDoc.data().numero : 'N/A';
                            } catch (error) {
                                console.warn("Error al obtener la mesa:", error);
                                pedidoData.mesaNumero = 'N/A';
                            }
                        } else {
                            console.warn("mesaId es inválido o no existe en el pedido:", pedidoData.id);
                        }

                        // Obtener detalles de cada item en el pedido usando la referencia
                        pedidoData.items = await Promise.all(pedidoData.items.map(async item => {
                            if (item.menuId) {
                                try {
                                    const menuDoc = await item.menuId.get();
                                    return {
                                        ...item,
                                        menuDetalles: menuDoc.exists ? menuDoc.data() : null,
                                    };
                                } catch (error) {
                                    console.warn("Error al obtener detalles del menú:", error);
                                    return {
                                        ...item,
                                        menuDetalles: null,
                                    };
                                }
                            } else {
                                return item;
                            }
                        }));

                        return pedidoData;
                    }));

                    setPedidos(listaPedidos);
                    setCargando(false); // Finalizar carga después de actualizar los pedidos
                },
                error => {
                    console.error("Error al obtener los pedidos:", error);
                    setCargando(false); // Finalizar carga en caso de error
                }
            );

            // Devuelve la función de desuscripción para limpiar la suscripción al salir del efecto
            return () => unsubscribe();
        };

        obtenerDatos();
    }, []);


    const filtrarPedidos = () => {
        const filtered = filtro === 'enCurso'
            ? pedidos.filter(pedido => Number(pedido.status) === 1)
            : filtro === 'finalizado'
                ? pedidos.filter(pedido => Number(pedido.status) === 0)
                : pedidos; // Todos
        return filtered;
    };

    const manejarSeleccionPedido = (pedido) => {
        const mesaId = pedido.mesaId.id; // Obtener el ID de la mesa correctamente
        const pedidoId = pedido.id; // El ID del pedido

        console.log(pedido);

        if (pedido.status === 1) {
            navigation.navigate('EnCursoPedido', { mesaId: mesaId, pedidoId: pedidoId });
        } else {
            navigation.navigate('MostrarPedido', { mesaId: mesaId, pedidoId: pedidoId });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.filtrosContainer}>
                <Button title="Todos" onPress={() => setFiltro('todos')}  buttonStyle={styles.filtroButton} />
                <Button title="En Curso" onPress={() => setFiltro('enCurso')}  buttonStyle={styles.filtroButton} />
                <Button title="Finalizados" onPress={() => setFiltro('finalizado')}  buttonStyle={styles.filtroButton} />
            </View>
            {cargando ? ( // Mostrar indicador de carga
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={filtrarPedidos()}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        return (
                            <View style={styles.pedidoContainer}>
                                <View style={styles.rowContainer}>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.text}>Mesa: {item.mesaNumero}</Text>
                                        <Text style={styles.text}>
                                            <Text style={{ color: item.status === 1 ? 'red' : 'green' }}>
                                                {item.status === 1 ? ' En Curso' : ' Finalizado'}
                                            </Text>
                                        </Text>
                                    </View>
                                    <Icon
                                        name={item.status === 1 ? 'info' : 'check-circle'}
                                        size={30}
                                        color={item.status === 1 ? 'red' : 'green'}
                                        onPress={() => manejarSeleccionPedido(item)}
                                    />
                                </View>
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    filtrosContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    filtroButton: {
        paddingHorizontal: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    pedidoContainer: {
        marginBottom: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff', // Fondo blanco para los pedidos
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2, // Sombra para Android
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Espacio entre los elementos
        alignItems: 'center', // Alinear verticalmente
    },
    textContainer: {
        flex: 1, // Permitir que el contenedor de texto ocupe el espacio disponible
        marginRight: 10, // Espacio entre el texto y el botón
    },
    text: {
        color: 'black',
        fontSize: 16,
        marginBottom: 5,
    },
});

export default ListarPedidos;