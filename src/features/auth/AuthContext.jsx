import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";

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
        // Real-time listener for user profile
        const userRef = doc(db, "users", user.uid);
        const unsubscribeUser = onSnapshot(
          userRef,
          async (docSnapshot) => {
            if (docSnapshot.exists()) {
              setUserData(docSnapshot.data());
            } else {
              // User authenticated fallback profile
              console.warn(
                "User authenticated but no profile found in Firestore. Creating fallback profile",
              );
              const fallbackPayload = {
                email: user.email,
                fullName: "Restored User",
                role: "user",
                createdAt: new Date().toISOString(),
                restoredAccount: true,
              };
              try {
                await setDoc(userRef, fallbackPayload);
                setUserData(fallbackPayload);
              } catch (error) {
                console.error("Error creating fallback profile:", error);
                setUserData(null);
              }
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching user data:", error);
            setLoading(false);
          },
        );

        return () => {
          unsubscribeUser();
        };
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    const timeout = setTimeout(() => setLoading(false), 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
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
    logout,
  };

  return (

    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
