import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const ListarPedidos = ({ navigation }) => {
    const [pedidos, setPedidos] = useState([]);
    const [filtro, setFiltro] = useState('todos'); // Estado para el filtro

    useEffect(() => {
        const unsubscribe = firestore()
            .collection('pedidos')
            .onSnapshot(async snapshot => {
                console.log("Snapshot received:", snapshot.docs.length);

                const listaPedidos = await Promise.all(snapshot.docs.map(async doc => {
                    const pedidoData = {
                        id: doc.id,
                        ...doc.data(),
                    };

                    // Obtener los datos de la mesa usando la referencia
                    if (pedidoData.mesaId) {
                        const mesaDoc = await pedidoData.mesaId.get();
                        pedidoData.mesaNumero = mesaDoc.exists ? mesaDoc.data().numero : 'N/A';
                    } else {
                        console.warn("mesaId es inválido o no existe en el pedido:", pedidoData.id);
                    }

                    // Obtener detalles de cada item en el pedido usando la referencia
                    pedidoData.items = await Promise.all(pedidoData.items.map(async item => {
                        if (item.menuId) {
                            try {
                                const menuDoc = await item.menuId.get(); // Obtener el documento del menú
                                if (menuDoc.exists) {
                                    console.log("menuDoc data:", menuDoc.data());
                                    return {
                                        ...item,
                                        menuDetalles: menuDoc.data()
                                    };
                                } else {
                                    console.warn("El documento de menú no existe para menuId:", item.menuId.id);
                                    return {
                                        ...item,
                                        menuDetalles: null
                                    };
                                }
                            } catch (error) {
                                console.error("Error obteniendo datos del menú:", error);
                                return {
                                    ...item,
                                    menuDetalles: null
                                };
                            }
                        } else {
                            console.warn("menuId es inválido o no existe en el item:", item);
                            return item;
                        }
                    }));


                    return pedidoData;
                }));

                //console.log("Pedidos:", listaPedidos);
                setPedidos(listaPedidos);
            });

        return () => unsubscribe();
    }, []);

    const filtrarPedidos = () => {
        // console.log("Pedidos antes del filtrado:", pedidos);
        const filtered = filtro === 'enCurso'
            ? pedidos.filter(pedido => Number(pedido.status) === 1)
            : filtro === 'finalizado'
                ? pedidos.filter(pedido => Number(pedido.status) === 0)
                : pedidos; // Todos

        //console.log("Filtered Pedidos:", filtered);
        return filtered;
    };

    const manejarSeleccionPedido = (pedido) => {
        if (pedido.status === 1) {
            navigation.navigate('EnCursoPedido', { mesaId: pedido.mesaId.id });
        } else {
            const itemsDetalle = pedido.items.map(item => {
                const detalles = item.menuDetalles
                    ? `\n- ${item.menuDetalles.nombre}: ${item.cantidad} x GS ${item.menuDetalles.precio}`
                    : '\n- Detalles no disponibles';
                return detalles;
            }).join('');

            Alert.alert(
                "Detalles del Pedido",
                `Mesa: ${pedido.mesaNumero || 'N/A'}\nTotal: GS ${pedido.precioTotal || 0}\nItems:${itemsDetalle}`,
                [{ text: "OK" }] // Botón para cerrar la alerta
            );
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <Button title="Todos" onPress={() => setFiltro('todos')} />
                <Button title="En Curso" onPress={() => setFiltro('enCurso')} />
                <Button title="Finalizados" onPress={() => setFiltro('finalizado')} />
            </View>
            <FlatList
                data={filtrarPedidos()}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    console.log("Rendering item:", item.menuDetalles);
                    return (
                        <View style={styles.pedidoContainer}>
                            <View style={styles.rowContainer}>
                                <View style={styles.textContainer}>
                                    <Text style={styles.text}>Mesa: {item.mesaNumero}</Text>
                                    <Text style={styles.text}>Estado: {item.status === 1 ? 'En Curso' : 'Finalizado'}</Text>
                                </View>
                                <Button title="Ver Detalles" onPress={() => manejarSeleccionPedido(item)} />
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f9f9f9', // Color de fondo más claro
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