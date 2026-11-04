import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db, firebaseConfig } from "./firebase";
import type {
  CreateUserData,
  UpdateUserData,
  UserProfile,
} from "../types/auth";

export async function createUser(data: CreateUserData): Promise<UserProfile> {
  const secondaryAppName = `admin-user-create-${Date.now()}`;
  const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      data.email.trim(),
      data.password
    );
    const uid = credential.user.uid;

    const userProfile: UserProfile = {
      uid,
      nombre: data.nombre.trim(),
      apellido: data.apellido.trim(),
      email: data.email.trim().toLowerCase(),
      rol: data.rol,
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "users", uid), userProfile);
    return userProfile;
  } finally {
    try {
      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);
    } catch {}
  }
}

export async function updateUser(uid: string, data: UpdateUserData): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    nombre: data.nombre.trim(),
    apellido: data.apellido.trim(),
    rol: data.rol,
  });
}

export async function deleteUser(uid: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid));
}

export async function getUsers(): Promise<UserProfile[]> {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((d) => ({
    uid: d.id,
    ...(d.data() as Omit<UserProfile, "uid">),
  }));
}

export function subscribeUsers(
  onData: (users: UserProfile[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    collection(db, "users"),
    (snapshot) => {
      const users = snapshot.docs.map((d) => ({
        uid: d.id,
        ...(d.data() as Omit<UserProfile, "uid">),
      }));
      onData(users);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}
