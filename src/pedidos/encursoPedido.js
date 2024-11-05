import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, Image, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const EnCursoPedido = ({ route, navigation }) => {
    const { mesaId, pedidoId } = route.params;
    const [pedido, setPedido] = useState({ items: [] }); // Inicializar pedido con un array vacío
    const [menuItems, setMenuItems] = useState([]);
    const [filteredMenuItems, setFilteredMenuItems] = useState([]); // Inicialmente vacío
    const [numeroMesa, setNumeroMesa] = useState(null);
    const [precioTotal, setPrecioTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

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

        const obtenerPedidoPorId = async () => {
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
            } catch (error) {
                console.error("Error al obtener el pedido:", error);
            }
        };

        const obtenerMenu = () => {
            return firestore()
                .collection('menu')
                .onSnapshot(snapshot => {
                    const listaMenu = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setMenuItems(listaMenu);
                    setFilteredMenuItems([]); // Inicialmente mostrar todos los menús
                }, error => {
                    console.error("Error al obtener el menú:", error);
                });
        };

        // Ejecuta las funciones para obtener datos
        obtenerNumeroMesa();
        obtenerPedidoPorId();
        const unsubscribeMenu = obtenerMenu();

        return () => {
            unsubscribeMenu();
        };
    }, [mesaId, pedidoId]);


    const handleSearch = (text) => {
        setSearchTerm(text);
        if (text.trim() === '') {
            setFilteredMenuItems([]); // No mostrar nada si el campo de búsqueda está vacío
        } else {
            const filtered = menuItems.filter(item => item.nombre.toLowerCase().includes(text.toLowerCase()));
            setFilteredMenuItems(filtered); // Actualizar solo con los menús filtrados
        }
    };

    const agregarItemPedido = (menuItem) => {
        setPedido(prevItems => {
            const existingItem = prevItems.items.find(item => item.menuId.id === menuItem.id);
            if (existingItem) {
                existingItem.cantidad += 1; // Aumentar la cantidad
            } else {
                prevItems.items.push({ menuId: firestore().collection('menu').doc(menuItem.id), cantidad: 1 });
            }
            return { ...prevItems }; // Retornar el pedido actualizado
        });
        setPrecioTotal(prevTotal => prevTotal + menuItem.precio);
    };

    const disminuirItemPedido = (menuItem) => {
        setPedido(prevItems => {
            const existingItem = prevItems.items.find(item => item.menuId.id === menuItem.id);
            if (existingItem) {
                if (existingItem.cantidad > 1) {
                    existingItem.cantidad -= 1; // Disminuir la cantidad
                } else {
                    // Si la cantidad es 1, eliminar el item del pedido
                    prevItems.items = prevItems.items.filter(item => item.menuId.id !== menuItem.id);
                }
            }
            return { ...prevItems }; // Retornar el pedido actualizado
        });
        setPrecioTotal(prevTotal => prevTotal - menuItem.precio); // Actualizar el total
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
                    status: 1, // Cambiar el estado a en curso
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
                placeholderTextColor="black" // Establecer el color del texto del placeholder a negro
                value={searchTerm}
                onChangeText={handleSearch}
                selectionColor="black" // Cambiar el color del cursor a negro
            />
            <FlatList
                data={filteredMenuItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.menuItem}>
                        <View style={styles.menuInfo}>
                            <Text style={styles.menuText}>{item.nombre} - GS {item.precio}</Text>
                            <Text style={styles.menuDescription}>{item.descripcion}</Text>
                        </View>
                        <Button title="Agregar" onPress={() => agregarItemPedido(item)} />
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
                                            <View style={styles.quantityContainer}>
                                                <Button title="-" onPress={() => disminuirItemPedido(menuItem)} />
                                                <Button title="+" onPress={() => agregarItemPedido(menuItem)} />
                                            </View>
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
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 60,
        height: 40,
        justifyContent: 'space-around',
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