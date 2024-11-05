import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, Modal, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';

const CrearPedidos = () => {
    const [mesas, setMesas] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedMesa, setSelectedMesa] = useState(null);
    const [pedidoItems, setPedidoItems] = useState([]);
    const [precioTotal, setPrecioTotal] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const unsubscribeMesas = firestore()
            .collection('mesa')
            .where('status', '==', 0) // Solo mesas disponibles
            .onSnapshot(snapshot => {
                const listaMesas = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setMesas(listaMesas);
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
            unsubscribeMesas();
            unsubscribeMenu();
        };
    }, []);

    const agregarItemPedido = (menuItem) => {
        setPedidoItems(prevItems => {
            const existingItem = prevItems.find(item => item.menuId === menuItem.id);
            if (existingItem) {
                existingItem.cantidad += 1;
                return [...prevItems]; // Retornar el mismo array con la cantidad actualizada
            } else {
                return [...prevItems, { menuId: menuItem.id, cantidad: 1 }];
            }
        });
        setPrecioTotal(prevTotal => prevTotal + menuItem.precio);
    };

    const disminuirItemPedido = (menuItem) => {
        setPedidoItems(prevItems => {
            const existingItem = prevItems.find(item => item.menuId === menuItem.id);
            if (existingItem && existingItem.cantidad > 0) {
                existingItem.cantidad -= 1;
                if (existingItem.cantidad === 0) {
                    return prevItems.filter(item => item.menuId !== menuItem.id);
                }
            }
            return [...prevItems]; // Retornar el mismo array con la cantidad actualizada
        });
        setPrecioTotal(prevTotal => prevTotal - menuItem.precio);
    };

    const enviarACocina = () => {
        if (!selectedMesa) {
            Alert.alert("Error", "Por favor, selecciona una mesa.");
            return;
        }
        setModalVisible(true); // Mostrar modal para confirmar el envío a cocina
    };

    const confirmarEnvioACocina = async () => {
        const nuevoPedido = {
            items: pedidoItems.map(item => ({
                menuId: firestore().collection('menu').doc(item.menuId), // Guardar como referencia
                cantidad: item.cantidad,
            })),
            mesaId: firestore().collection('mesa').doc(selectedMesa), // Guardar como referencia
            precioTotal: precioTotal,
            status: 1 // Estado en curso
        };

        try {
            await firestore().collection('pedidos').add(nuevoPedido);
            // Cambiar el estado de la mesa a ocupada
            await firestore().collection('mesa').doc(selectedMesa).update({ status: 1 });
            Alert.alert("Pase en caja", "El pedido ha sido finalizado.");
            setPedidoItems([]);
            setPrecioTotal(0);
            setSelectedMesa(null);
            setModalVisible(false);
        } catch (error) {
            console.error("Error al crear el pedido:", error);
            Alert.alert("Error", "No se pudo crear el pedido.");
        }
    };

    const marcarEnCurso = async () => {

        if (!selectedMesa) {
            Alert.alert("Error", "Por favor, selecciona una mesa.");
            return;
        }

        const nuevoPedido = {
            items: pedidoItems.map(item => ({
                menuId: firestore().collection('menu').doc(item.menuId), // Guardar como referencia
                cantidad: item.cantidad,
            })),
            mesaId: firestore().collection('mesa').doc(selectedMesa), // Guardar como referencia
            precioTotal: precioTotal,
            status: 1 // Estado en curso
        };

        try {
            await firestore().collection('pedidos').add(nuevoPedido);
            // Cambiar el estado de la mesa a ocupada
            await firestore().collection('mesa').doc(selectedMesa).update({ status: 1 });
            Alert.alert("Mesa en curso", "La mesa ha sido marcada como ocupada.");

            // Limpiar los campos después de la operación
            setPedidoItems([]);
            setPrecioTotal(0);
            setSelectedMesa(null);
        } catch (error) {
            console.error("Error al marcar la mesa como en curso:", error);
            Alert.alert("Error", "No se pudo marcar la mesa como en curso.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Selecciona una Mesa</Text>
            <Picker
                selectedValue={selectedMesa}
                onValueChange={(itemValue) => setSelectedMesa(itemValue)}
                style={styles.picker}
            >
                <Picker.Item label="Seleccione una mesa" value={null} />
                {mesas.map((mesa) => (
                    <Picker.Item key={mesa.id} label={`Mesa ${mesa.numero}`} value={mesa.id} />
                ))}
            </Picker>
            <Text style={styles.title}>Menú</Text>
            <FlatList
                data={menuItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const existingItem = pedidoItems.find(pedido => pedido.menuId === item.id);
                    return (
                        <View style={styles.menuItem}>
                            {item.image && (
                                <Image
                                    source={{ uri: item.image }}
                                    style={styles.menuImage}
                                />
                            )}
                            <View style={styles.menuInfo}>
                                <Text style={styles.menuText}>{item.nombre} - GS {item.precio}</Text>
                                <Text style={styles.menuDescription}>{item.descripcion}</Text>
                                <View style={styles.buttonContainer}>
                                    <Button title="-" onPress={() => disminuirItemPedido(item)} />

                                    <Text style={styles.quantityText}>{existingItem ? existingItem.cantidad : 0}</Text>
                                    <Button title="+" onPress={() => agregarItemPedido(item)} />
                                </View>
                            </View>
                        </View>
                    );
                }}
            />
            <Text style={styles.total}>Total: GS {precioTotal}</Text>
            <View style={styles.buttonContainer}>
                <Button title="Finalizar Pedido" onPress={enviarACocina} />
                <Button title="En Curso" onPress={marcarEnCurso} />
            </View>

            {/* Modal para confirmar el envío a cocina */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <Text style={styles.title}>¿Confirmar envío a cocina?</Text>
                    <Button title="Confirmar" onPress={confirmarEnvioACocina} />
                    <Button title="Cancelar" onPress={() => setModalVisible(false)} />
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
    picker: {
        height: 50,
        width: '100%',
        marginBottom: 20,
        color: '#666',
        backgroundColor: '#f8f8f8',
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
        justifyContent: 'space-around',
        marginTop: 20,
    },
    quantityText: {
        marginHorizontal: 10,
        fontSize: 16,
        color: '#666',
    },
    total: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        color: 'black',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        color: '#666',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
});

export default CrearPedidos;
