// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDzsXJSAx9RXgQ4S4D1h9JjIlPM6mi8cgA",
    authDomain: "tripler-fb8ef.firebaseapp.com",
    projectId: "tripler-fb8ef",
    storageBucket: "tripler-fb8ef.firebasestorage.app",
    messagingSenderId: "369238046184",
    appId: "1:369238046184:web:8b0f93352244fcc019205d",
    measurementId: "G-BWZEKZTJ0J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase: App initialized");
const analytics = getAnalytics(app);

// Export Auth and DB for use in the app
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
