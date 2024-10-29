import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const GerenteHome = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenido!</Text>

            <View style={styles.buttonContainer}>
                <Button
                    title="Cuentas"
                    onPress={() => navigation.navigate('ListarCuentas')}
                />
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="Categorias"
                    onPress={() => navigation.navigate('ListarCategoriag')}
                />
            </View>


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 40,
        color: '#333',
    },
    buttonContainer: {
        marginBottom: 20,
        width: '80%',
    },
});

export default GerenteHome;
