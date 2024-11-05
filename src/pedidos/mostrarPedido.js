import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, Modal, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';


const MostrarPedido = ({ route }) => {
    const { mesaId, pedidoId } = route.params; // Obtener el ID de la mesa desde los parámetros de la ruta
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

        const obtenerDatos = async () => {
            try {
                const docRef = firestore().collection('pedidos').doc(pedidoId);
                const docSnapshot = await docRef.get();

                if (docSnapshot.exists) {
                    const pedidoData = {
                        id: docSnapshot.id,
                        ...docSnapshot.data(),
                    };
                    console.log("Datos del pedido:", pedidoData);
                    setPedido(pedidoData);
                    setPrecioTotal(pedidoData.precioTotal);
                } else {
                    console.log("No se encontró el pedido con el ID:", pedidoId);
                }


                const menuSnapshot = await firestore().collection('menu').get();
                const listaMenu = menuSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setMenuItems(listaMenu);
            } catch (error) {
                console.error("Error al obtener los datos:", error);
            }
        };

        obtenerDatos();
    }, [mesaId, pedidoId]);


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