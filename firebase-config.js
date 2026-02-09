// ============================================
// FIREBASE KONFIGURĀCIJA (DROŠA VERSIJA)
// ============================================
// Izmanto environment variables no .env faila

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Pārbaude vai visi environment variables ir ielādēti
if (!firebaseConfig.apiKey) {
    console.error('❌ KĻŪDA: Firebase environment variables nav ielādēti!');
    console.error('Pārbaudi vai .env fails eksistē un satur pareizos datus.');
}

// Inicializē Firebase
firebase.initializeApp(firebaseConfig);

// Eksportē servisa references
const auth = firebase.auth();
const db = firebase.firestore();

// Firestore timestamp helper
const timestamp = firebase.firestore.FieldValue.serverTimestamp;

console.log('✅ Firebase inicializēts droši!');
