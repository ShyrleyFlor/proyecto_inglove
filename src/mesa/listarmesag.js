import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { Icon, FAB, Button } from '@rneui/themed';
import EditarMesa from './editarMesa';
import CrearMesa from './crearmesa';

const ListarMesas = () => {
    const [mesas, setMesas] = useState([]);
    const [mesaEditar, setMesaEditar] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filtroStatus, setFiltroStatus] = useState(null); // null muestra todas, 0 libres, 1 ocupadas
    const navigation = useNavigation();
    const [modalCrearVisible, setModalCrearVisible] = useState(false);

    useEffect(() => {
        const unsubscribe = firestore()
            .collection('mesa')
            .onSnapshot(snapshot => {
                const listaMesas = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setMesas(listaMesas);
                setLoading(false);
            }, error => {
                console.error("Error al obtener las mesas:", error);
                setLoading(false);
            });

        return () => unsubscribe();
    }, []);

    const eliminarMesa = async (mesaId, numeroMesa) => {
        Alert.alert(
            "Confirmar eliminación",
            `¿Está seguro que desea eliminar la mesa ${numeroMesa}?`,
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
                                .collection('mesa')  // Cambiado de 'mesas' a 'mesa'
                                .doc(mesaId)
                                .delete();
                            console.log('Mesa eliminada con éxito');
                        } catch (error) {
                            console.error('Error al eliminar la mesa:', error);
                            Alert.alert("Error", "No se pudo eliminar la mesa");
                        }
                    }
                }
            ]
        );
    };

    const cambiarEstadoMesa = async (mesaId, nuevoStatus) => {
        try {
            await firestore()
                .collection('mesa') // Cambia 'mesas' por 'mesa' para que coincida con la colección usada en useEffect
                .doc(mesaId)
                .update({
                    status: nuevoStatus
                });
        } catch (error) {
            console.error('Error al actualizar el estado de la mesa:', error);
            Alert.alert("Error", "No se pudo actualizar el estado de la mesa");
        }
    };

    const mesasFiltradas = filtroStatus === null
        ? mesas
        : mesas.filter(mesa => mesa.status === filtroStatus);

    return (
        <View style={styles.container}>
            <View style={styles.filtrosContainer}>
                <Button
                    title="Todas"
                    type={filtroStatus === null ? "solid" : "outline"}
                    onPress={() => setFiltroStatus(null)}
                    buttonStyle={styles.filtroButton}
                />
                <Button
                    title="Disponibles"
                    type={filtroStatus === 0 ? "solid" : "outline"}
                    onPress={() => setFiltroStatus(0)}
                    buttonStyle={styles.filtroButton}
                />
                <Button
                    title="Ocupadas"
                    type={filtroStatus === 1 ? "solid" : "outline"}
                    onPress={() => setFiltroStatus(1)}
                    buttonStyle={styles.filtroButton}
                />
            </View>

            <FlatList
                data={mesasFiltradas}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.mesaContainer}>
                        <View style={styles.mesaInfo}>
                            <Text style={styles.mesaNumero}>Mesa {item.numero}</Text>
                            <Text style={[
                                styles.mesaStatus,
                                { color: item.status === 0 ? '#4CAF50' : '#F44336' }
                            ]}>
                                {item.status === 0 ? 'Disponible' : 'Ocupada'}
                            </Text>
                        </View>
                        <View style={styles.botonesContainer}>
                            <TouchableOpacity
                                style={styles.botonAccion}
                                onPress={() => {
                                    setMesaEditar(item);  // Guarda la mesa seleccionada
                                    setModalVisible(true); // Abre el modal
                                }}
                            >
                                <Icon
                                    name="edit" // Cambia el icono a uno de editar
                                    size={24}
                                    color="#4CAF50"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.botonAccion}
                                onPress={() => cambiarEstadoMesa(item.id, item.status === 0 ? 1 : 0)}
                            >
                                <Icon
                                    name={item.status === 0 ? "check" : "close"}
                                    size={24}
                                    color={item.status === 0 ? "#4CAF50" : "#4CAF50"}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.botonAccion}
                                onPress={() => eliminarMesa(item.id, item.numero)}
                            >
                                <Icon
                                    name="delete"
                                    size={24}
                                    color="#ff0000"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
            <FAB
                icon={{ name: 'add', color: 'white' }}
                color="#2089dc"
                placement="right"
                style={styles.fab}
                onPress={() => setModalCrearVisible(true)} // Abre el modal para crear mesa
            />

            <CrearMesa
                visible={modalCrearVisible}
                onClose={() => setModalCrearVisible(false)}
            />
            <EditarMesa
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setMesaEditar(null);
                }}
                mesa={mesaEditar}
            />
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
    mesaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        elevation: 2,
    },
    mesaInfo: {
        flex: 1,
    },
    mesaNumero: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    mesaStatus: {
        fontSize: 16,
        marginTop: 5,
    },
    botonesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    botonAccion: {
        padding: 5,
        marginLeft: 10,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});

export default ListarMesas;