"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { createContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

interface AuthContextType {
  user: (FirebaseUser & UserProfile) | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(FirebaseUser & UserProfile) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Use onSnapshot to listen for real-time updates to the user profile
        const unsubSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userProfile = docSnap.data() as UserProfile;
            setUser({ ...firebaseUser, ...userProfile });
          } else {
            // If profile doesn't exist, just use firebase user
            setUser(firebaseUser as (FirebaseUser & UserProfile));
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user profile:", error);
          setUser(firebaseUser as (FirebaseUser & UserProfile));
          setLoading(false);
        });

        return () => unsubSnapshot(); // Cleanup snapshot listener

      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = { user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
