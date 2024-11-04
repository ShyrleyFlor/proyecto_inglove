import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, Modal, Image, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const EnCursoPedido = ({ route, navigation }) => {
    const { mesaId } = route.params; // Obtener el ID de la mesa desde los parámetros de la ruta
    const [pedido, setPedido] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [filteredMenuItems, setFilteredMenuItems] = useState([]); // Inicialmente vacío
    const [modalVisible, setModalVisible] = useState(false);
    const [numeroMesa, setNumeroMesa] = useState(null);
    const [precioTotal, setPrecioTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMenuItem, setSelectedMenuItem] = useState(null);
    const [cantidad, setCantidad] = useState(1); // Cantidad por defecto

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
                    const doc = snapshot.docs[0];
                    const pedidoData = {
                        id: doc.id,
                        ...doc.data(),
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
                setFilteredMenuItems(listaMenu); // Inicialmente mostrar todos los menús
            }, error => {
                console.error("Error al obtener el menú:", error);
            });

        return () => {
            unsubscribePedido();
            unsubscribeMenu();
        };
    }, [mesaId]);

    const handleSearch = (text) => {
        setSearchTerm(text);
        const filtered = menuItems.filter(item => item.nombre.toLowerCase().includes(text.toLowerCase()));
        setFilteredMenuItems(filtered); // Actualizar solo con los menús filtrados
    };

    const agregarItemPedido = () => {
        if (selectedMenuItem) {
            setPedido(prevItems => {
                const existingItem = prevItems.items.find(item => item.menuId.id === selectedMenuItem.id);
                if (existingItem) {
                    existingItem.cantidad += cantidad; // Aumentar la cantidad
                } else {
                    prevItems.items.push({ menuId: firestore().collection('menu').doc(selectedMenuItem.id), cantidad });
                }
                return { ...prevItems }; // Retornar el pedido actualizado
            });
            setPrecioTotal(prevTotal => prevTotal + (selectedMenuItem.precio * cantidad));
            setModalVisible(false); // Cerrar el modal
            setSelectedMenuItem(null); // Reiniciar selección
            setCantidad(1); // Reiniciar cantidad
        }
    };

    const finalizarPedido = async () => {
        if (pedido) {
            try {
                console.log("ID del pedido:", pedido.id);
                await firestore().collection('pedidos').doc(pedido.id).update({
                    items: pedido.items,
                    precioTotal: precioTotal,
                    status: 0, // Cambiar el estado a finalizado
                });

                // Actualizar el estado de la mesa a disponible (0)
                await firestore().collection('mesa').doc(mesaId).update({
                    status: 0, // Cambiar el estado de la mesa a disponible
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
                    items: pedido.items,
                    precioTotal: precioTotal,
                    status: 1, // Cambiar el estado a finalizado
                });

                // Actualizar el estado de la mesa a ocupada (1)
                await firestore().collection('mesa').doc(mesaId).update({
                    status: 1, // Cambiar el estado de la mesa a ocupada
                });
                Alert.alert("Pedido en curso", "El pedido ha sido marcado como en curso.");
                navigation.goBack(); // Regresar a la pantalla de lista después de actualizar
            } catch (error) {
                console.error("Error al marcar el pedido como en curso:", error);
                Alert.alert("Error", "No se pudo actualizar el estado del pedido.");
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pedido en Curso para Mesa {numeroMesa}</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Buscar menú..."
                value={searchTerm}
                onChangeText={handleSearch}
            />
            <FlatList
                data={filteredMenuItems} // Solo mostrar los menús filtrados
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.menuItem}>
                        <View style={styles.menuInfo}>
                            <Text style={styles.menuText}>{item.nombre} - GS {item.precio}</Text>
                            <Text style={styles.menuDescription}>{item.descripcion}</Text>
                        </View>
                        <Button title="Agregar" onPress={() => {
                            setSelectedMenuItem(item);
                            setModalVisible(true);
                        }} />
                    </View>
                )}
            />
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

            {/* Modal para seleccionar cantidad */}
            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Agregar {selectedMenuItem?.nombre}</Text>
                    <View style={styles.quantityContainer}>
                        <Button title="-" onPress={() => setCantidad(Math.max(1, cantidad - 1))} />
                        <Text>{cantidad}</Text>
                        <Button title="+" onPress={() => setCantidad(cantidad + 1)} />
                    </View>
                    <Button title="Agregar al Pedido" onPress={agregarItemPedido} />
                    <Button title="Cerrar" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>
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
    searchInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'white',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
});

export default EnCursoPedido;