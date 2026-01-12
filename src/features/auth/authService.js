import { auth, db } from "../../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const authService = {
  async createAccount(email, password, profileData) {
    try {
      // Ensure persistence is set before creating account
      await setPersistence(auth, browserLocalPersistence);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const payload = {
        fullName: profileData.fullName,
        phone: profileData.phone,
        email: email,
        role: profileData.role || "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", user.uid), payload);
      return { success: true, user };
    } catch (error) {
      console.error("Error creating account:", error);
      throw error;
    }
  },

  async login(email, password) {
    try {
      // Ensure persistence is set before logging in
      await setPersistence(auth, browserLocalPersistence);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        const fallbackPayload = {
          email: user.email,
          fullName: "Restored User",
          role: "user",
          createdAt: new Date().toISOString(),
          restoredAccount: true,
        };
        await setDoc(doc(db, "users", user.uid), fallbackPayload);
        return { success: true, user, userData: fallbackPayload };
      }

      return { success: true, user, userData: userDoc.data() };
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  },

  async forgotPassword(email, actionCodeSettings = null) {
    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      return { success: true };
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  },

  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  },
};
