import { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useUserStore } from "@/store/userStore";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUser: setUserStore } = useUserStore();

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setUserStore(
        firebaseUser
          ? {
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              premium: false,
            }
          : null
      );
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUserStore]);

  const signIn = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    await signOut(auth);
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
  };
}

