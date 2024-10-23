// src/firebaseConnection.js

import firebase from '@react-native-firebase/app';

const firebaseConfig = {
    apiKey: 'AIzaSyAKy6LKcfzuhv0ZOVBKtmES1Wv25FT-kA0', // Tu clave de API
    authDomain: 'fpune2024.firebaseapp.com', // No es necesario para autenticación con correo
    projectId: 'fpune2024-237c8', // Tu ID de proyecto
    storageBucket: 'fpune2024.appspot.com', // No es necesario si no usas almacenamiento
    messagingSenderId: '793825014632', // Tu número de proyecto
    appId: '1:793825014632:android:7a52d96dd9edea9d905cdd', // ID de la app
};

// Inicializa Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export default firebase;
