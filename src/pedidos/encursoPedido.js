import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, Modal, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const EnCursoPedido = ({ route, navigation }) => {
    const { mesaId } = route.params; // Obtener el ID de la mesa desde los parámetros de la ruta
    const [pedido, setPedido] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [precioTotal, setPrecioTotal] = useState(0);

    useEffect(() => {
        const unsubscribePedido = firestore()
            .collection('pedidos')
            .where('mesaId', '==', firestore().collection('mesa').doc(mesaId))
            .onSnapshot(snapshot => {
                if (!snapshot.empty) {
                    const pedidoData = snapshot.docs[0].data();
                    setPedido(pedidoData);
                    setPrecioTotal(pedidoData.precioTotal);
                }
            });

        const unsubscribeMenu = firestore()
            .collection('menu')
            .onSnapshot(snapshot => {
                const listaMenu = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setMenuItems(listaMenu);
            });

        return () => {
            unsubscribePedido();
            unsubscribeMenu();
        };
    }, [mesaId]);

    const agregarItemPedido = (menuItem) => {
        if (pedido) {
            const existingItem = pedido.items.find(item => item.menuId.id === menuItem.id);
            if (existingItem) {
                existingItem.cantidad += 1;
            } else {
                pedido.items.push({ menuId: firestore().collection('menu').doc(menuItem.id), cantidad: 1 });
            }
            setPrecioTotal(prevTotal => prevTotal + menuItem.precio);
            setModalVisible(true); // Mostrar modal para confirmar el envío a cocina
        }
    };

    const finalizarPedido = async () => {
        if (pedido) {
            try {
                await firestore().collection('pedidos').doc(pedido.id).update({
                    items: pedido.items,
                    precioTotal: precioTotal,
                    status: 0 // Cambiar el estado a finalizado
                });
                Alert.alert("Pase en caja", "El pedido ha sido finalizado.");
                navigation.goBack(); // Regresar a la pantalla anterior
            } catch (error) {
                console.error("Error al finalizar el pedido:", error);
                Alert.alert("Error", "No se pudo finalizar el pedido.");
            }
        }
    };

    const marcarEnCurso = async () => {
        if (pedido) {
            try {
                await firestore().collection('pedidos').doc(pedido.id).update({
                    status: 1 // Cambiar el estado a en curso
                });
                Alert.alert("Pedido en curso", "El pedido ha sido marcado como en curso.");
            } catch (error) {
                console.error("Error al marcar el pedido como en curso:", error);
                Alert.alert("Error", "No se pudo marcar el pedido como en curso.");
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pedido en Curso para Mesa {mesaId}</Text>
            {pedido && (
                <FlatList
                    data={pedido.items}
                    keyExtractor={(item) => item.menuId.id}
                    renderItem={({ item }) => {
                        const menuItem = menuItems.find(menu => menu.id === item.menuId.id);
                        return (
                            <View style={styles.menuItem}>
                                {menuItem && (
                                    <>
                                        {menuItem.image && (
                                            <Image
                                                source={{ uri: menuItem.image }}
                                                style={styles.menuImage}
                                            />
                                        )}
                                        <View style={styles.menuInfo}>
                                            <Text style={styles.menuText}>{menuItem.nombre} - GS {menuItem.precio}</Text>
                                            <Text style={styles.menuDescription}>Cantidad: {item.cantidad}</Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        );
                    }}
                />
            )}
            <Text style={styles.total}>Total: GS {precioTotal}</Text>
            <View style={styles.buttonContainer}>
                <Button title="Finalizar Pedido" onPress={finalizarPedido} />
                <Button title="En Curso" onPress={marcarEnCurso} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'black',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
    },
    menuText: {
        color: 'black', // Texto en negro
    },
    menuDescription: {
        color: '#666',
        fontSize: 14,
    },
    menuImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    menuInfo: {
        flex: 1,
        marginLeft: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    total: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        color: 'black',
    },
});

export default EnCursoPedido;