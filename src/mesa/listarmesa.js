import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Text, FlatList } from 'react-native';
import firestore from '@react-native-firebase/firestore';

const ListarMesas = () => {
    const [filtroStatus, setFiltroStatus] = useState(null); // null muestra todas, 0 libres, 1 ocupadas
    const [loading, setLoading] = useState(true);
    const [mesas, setMesas] = useState([]);

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

    // Filtrar mesas según el estado
    const mesasFiltradas = filtroStatus === null
        ? mesas
        : mesas.filter(mesa => mesa.status === filtroStatus);

    if (loading) {
        return <Text>Cargando...</Text>; // Mensaje de carga
    }


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
                    </View>
                )}
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
});

export default ListarMesas;
