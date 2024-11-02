import React, { useState, useEffect } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';

const CrearMenu = ({ route, navigation }) => {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precio, setPrecio] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [categorias, setCategorias] = useState([]);

    useEffect(() => {
        const cargarCategorias = async () => {
            try {
                const categoriasSnapshot = await firestore()
                    .collection('categorias')
                    .get();
                
                const categoriasData = categoriasSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCategorias(categoriasData);

                // Si hay categorías, seleccionar la primera por defecto
                if (categoriasData.length > 0) {
                    setCategoriaId(categoriasData[0].id);
                }
            } catch (error) {
                console.error('Error al cargar categorías:', error);
                Alert.alert('Error', 'No se pudieron cargar las categorías');
            }
        };

        cargarCategorias();
    }, []);

    const handleCrear = async () => {
        if (!nombre || !descripcion || !precio || !categoriaId) {
            Alert.alert('Error', 'Por favor complete todos los campos');
            return;
        }

        try {
            // Crear referencia a la categoría seleccionada
            const categoriaRef = firestore().collection('categorias').doc(categoriaId);

            const menuData = {
                nombre,
                descripcion,
                precio: parseFloat(precio),
                categoriaId: categoriaRef // Guardamos la referencia completa
            };

            await firestore()
                .collection('menu')
                .add(menuData);

            Alert.alert('Éxito', 'Menú creado correctamente');
            navigation.goBack();
        } catch (error) {
            console.error('Error al crear menú:', error);
            Alert.alert('Error', 'No se pudo crear el menú');
        }
    };

    return (
        <View style={styles.container}>
            <Text h4 style={styles.title}>Crear Nuevo Menú</Text>

            <Input
                placeholder="Nombre del plato"
                value={nombre}
                onChangeText={setNombre}
            />

            <Input
                placeholder="Descripción"
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
            />

            <Input
                placeholder="Precio"
                value={precio}
                onChangeText={setPrecio}
                keyboardType="numeric"
            />

            <Text style={styles.label}>Categoría:</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={categoriaId}
                    onValueChange={(itemValue) => setCategoriaId(itemValue)}
                    style={styles.picker}
                >
                    {categorias.map((categoria) => (
                        <Picker.Item 
                            key={categoria.id} 
                            label={categoria.nombre} 
                            value={categoria.id}
                        />
                    ))}
                </Picker>
            </View>

            <Button
                title="Crear Menú"
                onPress={handleCrear}
                buttonStyle={styles.createButton}
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
    title: {
        textAlign: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        marginLeft: 10,
        color: '#86939e',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#86939e',
        borderRadius: 5,
        marginBottom: 20,
        marginHorizontal: 10,
        backgroundColor: '#f9f9f9',
    },
    picker: {
        height: 50,
        color: '#000',
    },
    createButton: {
        backgroundColor: '#2089dc',
        marginBottom: 10,
    },
});

export default CrearMenu;