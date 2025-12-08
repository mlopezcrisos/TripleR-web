import { createContext, useContext, useEffect, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function loginWithGoogle() {
        return signInWithPopup(auth, googleProvider);
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        console.log("AuthContext: Setting up auth listener");
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("AuthContext: Auth state changed", currentUser);
            setUser(currentUser);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        user,
        signup,
        login,
        loginWithGoogle,
        logout
    };

    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center', marginTop: '20px' }}>Cargando autenticación...</div>;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
