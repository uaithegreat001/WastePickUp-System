import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    } else {
                        // Fallback if user doc doesn't exist yet (shouldn't happen if flow is correct)
                        setUserData({
                            fullName: user.displayName || 'User',
                            email: user.email,
                            role: 'user'
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
            setCurrentUser(null);
            setUserData(null);
        } catch (error) {
            console.error("Error during logout:", error);
            throw error;
        }
    };

    const value = {
        currentUser,
        userData,
        loading,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
