import React, { useState, useEffect } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { Input, Button, Text } from '@rneui/themed';
import { Picker } from '@react-native-picker/picker';
import firestore from '@react-native-firebase/firestore';

const EditarMenu = ({ route, navigation }) => {
    const { item } = route.params;
    const [nombre, setNombre] = useState(item.nombre);
    const [descripcion, setDescripcion] = useState(item.descripcion);
    const [precio, setPrecio] = useState(item.precio.toString());
    const [categoriaId, setCategoriaId] = useState(item.categoriaId);
    const [categoriaActual, setCategoriaActual] = useState(null);
    const [categorias, setCategorias] = useState([]);

    useEffect(() => {
        // Cargar categorías
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

                // Establecer la categoría inicial
                if (item.categoriaId  && item.categoriaId.path) {
                    // Obtener el ID de la referencia actual
                    const categoriaActualId = item.categoriaId.path.split('/')[1];
                    setCategoriaId(categoriaActualId);
                }
            } catch (error) {
                console.error('Error al cargar categorías:', error);
                Alert.alert('Error', 'No se pudieron cargar las categorías');
            }
        };

        cargarCategorias();
    }, [item.categoriaId]);

    const handleEditar = async () => {
        try {
            // Crear una referencia específica a la categoría usando firestore.doc()
            const categoriaRef = firestore().collection('categorias').doc(categoriaId);

            const menuData = {
                nombre,
                descripcion,
                precio: parseFloat(precio),
                categoriaId: categoriaRef  // Esto guardará la referencia completa
            };

            console.log('Actualizando menú con datos:', menuData); // Para debugging

            await firestore()
                .collection('menu')
                .doc(item.id)
                .update(menuData);

            Alert.alert('Éxito', 'Menú actualizado correctamente');
            navigation.goBack();
        } catch (error) {
            console.error('Error al actualizar:', error);
            Alert.alert('Error', 'No se pudo actualizar el menú');
        }
    };

    const handleEliminar = async () => {
        Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que deseas eliminar este menú?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Eliminar',
                    onPress: async () => {
                        try {
                            await firestore()
                                .collection('menu')
                                .doc(item.id)
                                .delete();
                            Alert.alert('Éxito', 'Menú eliminado correctamente');
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar el menú');
                        }
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
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
                            // Establecer como seleccionada si es la categoría actual
                            selected={categoria.id === categoriaActual}
                        />
                    ))}
                </Picker>
            </View>

            <Button
                title="Guardar Cambios"
                onPress={handleEditar}
                buttonStyle={styles.saveButton}
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
        backgroundColor: '#8ecae6',
    },
    picker: {
        height: 50,
    },
    saveButton: {
        backgroundColor: '#2089dc',
        marginBottom: 10,
    },
    deleteButton: {
        backgroundColor: '#ff3b30',
        marginTop: 10,
    },
});

export default EditarMenu;