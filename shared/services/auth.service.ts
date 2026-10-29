import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { AuthResult, UserProfile, UserRole } from "../types/auth";

export const ALL_USER_ROLES: UserRole[] = ["admin", "facturation", "picker", "delivery"];

export async function loginWithEmailAndPassword(
  email: string,
  password: string,
  allowedRoles: UserRole[] = ALL_USER_ROLES
): Promise<AuthResult> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const { uid } = credential.user;

  const userDoc = await getDoc(doc(db, "users", uid));

  if (!userDoc.exists()) {
    await signOut(auth);
    throw new Error("Usuario no encontrado en la base de datos.");
  }

  const data = userDoc.data();
  const rol = data?.rol as UserRole;

  if (!ALL_USER_ROLES.includes(rol)) {
    await signOut(auth);
    throw new Error("Rol de usuario no válido.");
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(rol)) {
    await signOut(auth);
    throw new Error("UNAUTHORIZED_ROLE");
  }

  return {
    profile: {
      uid,
      email: credential.user.email ?? email,
      rol,
      nombre: data?.nombre,
      apellido: data?.apellido,
      createdAt: data?.createdAt,
    },
  };
}

export function getCurrentUserProfile(
  allowedRoles: UserRole[] = ALL_USER_ROLES
): Promise<UserProfile | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (!user) return resolve(null);

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) return resolve(null);

        const data = userDoc.data();
        const rol = data?.rol as UserRole;
        if (!ALL_USER_ROLES.includes(rol)) return resolve(null);
        if (allowedRoles.length > 0 && !allowedRoles.includes(rol)) return resolve(null);

        resolve({
          uid: user.uid,
          email: user.email ?? "",
          rol,
          nombre: data?.nombre,
          apellido: data?.apellido,
          createdAt: data?.createdAt,
        });
      } catch {
        resolve(null);
      }
    });
  });
}

export async function logout(): Promise<void> {
  await signOut(auth);
}
