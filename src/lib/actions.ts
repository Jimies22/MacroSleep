"use client";

import { initializeFirebase } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile as updateFirebaseProfile,
  UserCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, addDoc, getDocs, Timestamp, query, where, orderBy, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { UserProfile, SleepLog, MacroLog } from "./types";
import { getStorage } from "firebase/storage";
import { setDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const { auth, firestore } = initializeFirebase();
const storage = getStorage();

// Auth Actions
export async function signUpWithEmail({ name, email, password }: { name: string, email: string, password: string }) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateFirebaseProfile(user, { displayName: name });
    
    const userProfile: UserProfile = {
      uid: user.uid,
      name: name,
      email: user.email,
      photoURL: user.photoURL,
    };
    const userDocRef = doc(firestore, "users", user.uid);
    setDocumentNonBlocking(userDocRef, userProfile, { merge: true });
    
    return { user: userProfile };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function signInWithEmail({ email, password }: { email: string, password: string }) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function signInWithGoogle(): Promise<{ user: UserCredential["user"] } | void> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    const userDocRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const userProfile: UserProfile = {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      };
      setDocumentNonBlocking(userDocRef, userProfile, { merge: true });
    }
    
    return { user };
  } catch (error: any) {
    console.error("Google Sign-In Error:", error);
    // Don't throw for popup closed by user, just return nothing.
    if (error.code !== 'auth/popup-closed-by-user') {
      throw error;
    }
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (error: any) {
    return { error: error.message };
  }
}

// Profile Actions
export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const userDocRef = doc(firestore, "users", uid);
  updateDocumentNonBlocking(userDocRef, data);
}

export async function uploadProfilePicture(uid: string, file: File) {
  const storageRef = ref(storage, `profilePictures/${uid}`);
  await uploadBytes(storageRef, file);
  const photoURL = await getDownloadURL(storageRef);
  
  await updateUserProfile(uid, { photoURL });
  
  if (auth.currentUser) {
    await updateFirebaseProfile(auth.currentUser, { photoURL });
  }
  
  return photoURL;
}


// Sleep Log Actions
export async function addSleepLog(uid: string, data: { startTime: Date, endTime: Date }) {
    const { startTime, endTime } = data;
    const totalMilliseconds = endTime.getTime() - startTime.getTime();
    const totalHours = totalMilliseconds / (1000 * 60 * 60);

    const sleepLog = {
      startTime: Timestamp.fromDate(startTime),
      endTime: Timestamp.fromDate(endTime),
      totalHours: parseFloat(totalHours.toFixed(2)),
      date: Timestamp.fromDate(new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate())),
    };

    addDocumentNonBlocking(collection(firestore, "users", uid, "sleep_logs"), sleepLog);
}

export async function getSleepLogs(uid: string): Promise<SleepLog[]> {
    const q = query(collection(firestore, "users", uid, "sleep_logs"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SleepLog));
}

// Macro Log Actions
export async function addMacroLog(uid: string, data: { mealName: string, calories: number, protein: number, carbs: number, fats: number }) {
    const macroLog = {
        ...data,
        createdAt: serverTimestamp(),
    };
    addDocumentNonBlocking(collection(firestore, "users", uid, "macro_logs"), macroLog);
}

export async function getTodaysMacroLogs(uid: string): Promise<MacroLog[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const q = query(
        collection(firestore, "users", uid, "macro_logs"),
        where("createdAt", ">=", Timestamp.fromDate(today)),
        where("createdAt", "<", Timestamp.fromDate(tomorrow)),
        orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MacroLog));
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDocRef = doc(firestore, "users", uid);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
}
