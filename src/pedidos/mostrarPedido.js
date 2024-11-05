import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, Modal, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const MostrarPedido = ({ route }) => {
    const { mesaId } = route.params; // Obtener el ID de la mesa desde los parámetros de la ruta
    const [pedido, setPedido] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [numeroMesa, setNumeroMesa] = useState(null);
    const [precioTotal, setPrecioTotal] = useState(0);

    useEffect(() => {

        const obtenerNumeroMesa = async () => {
            try {
                const mesaDoc = await firestore().collection('mesa').doc(mesaId).get();
                if (mesaDoc.exists) {
                    setNumeroMesa(mesaDoc.data().numero);
                } else {
                    console.error("No se encontró la mesa con el ID:", mesaId);
                }
            } catch (error) {
                console.error("Error al obtener el número de la mesa:", error);
            }
        };

        obtenerNumeroMesa();

        const unsubscribePedido = firestore()
            .collection('pedidos')
            .where('mesaId', '==', firestore().collection('mesa').doc(mesaId))
            .onSnapshot(snapshot => {
                if (!snapshot.empty) {
                    // Obtiene el primer documento de la lista de resultados
                    const doc = snapshot.docs[0];
                    const pedidoData = {
                        id: doc.id, // Agregar el ID del documento
                        ...doc.data(), // Agregar los datos del documento
                    };
                    console.log("Datos del pedido:", pedidoData); 
                    setPedido(pedidoData);
                    setPrecioTotal(pedidoData.precioTotal);
                } else {
                    console.log("No se encontraron pedidos para la mesa con ID:", mesaId);
                }
            }, error => {
                console.error("Error al obtener el pedido:", error);
            });

        const unsubscribeMenu = firestore()
            .collection('menu')
            .onSnapshot(snapshot => {
                const listaMenu = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setMenuItems(listaMenu);
            }, error => {
                console.error("Error al obtener el menú:", error);
            });

        return () => {
            
            unsubscribePedido();
            unsubscribeMenu();
        };
    }, [mesaId]);


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cuenta de la mesa {numeroMesa}</Text>
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
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: 'black',
    },
});

export default MostrarPedido;