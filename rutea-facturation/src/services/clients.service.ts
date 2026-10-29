import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@rutea/shared";
import type { Client, CreateClientData, UpdateClientData } from "@/types/client";

export async function createClient(data: CreateClientData): Promise<Client> {
  const clientsRef = collection(db, "clients");
  const newDocRef = doc(clientsRef);
  const now = new Date().toISOString();

  const client: Client = {
    id: newDocRef.id,
    nombre: data.nombre.trim(),
    telefono: data.telefono.trim(),
    direccion: data.direccion.trim(),
    ciudad: data.ciudad.trim(),
    ...(data.nombreComercio ? { nombreComercio: data.nombreComercio.trim() } : {}),
    ...(data.correo ? { correo: data.correo.trim().toLowerCase() } : {}),
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(newDocRef, client);
  return client;
}

export async function updateClient(id: string, data: UpdateClientData): Promise<void> {
  const docRef = doc(db, "clients", id);
  const payload: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (data.nombre !== undefined) payload.nombre = data.nombre.trim();
  if (data.telefono !== undefined) payload.telefono = data.telefono.trim();
  if (data.direccion !== undefined) payload.direccion = data.direccion.trim();
  if (data.ciudad !== undefined) payload.ciudad = data.ciudad.trim();
  if (data.nombreComercio !== undefined) {
    payload.nombreComercio = data.nombreComercio ? data.nombreComercio.trim() : null;
  }
  if (data.correo !== undefined) {
    payload.correo = data.correo ? data.correo.trim().toLowerCase() : null;
  }

  await updateDoc(docRef, payload);
}

export async function deleteClient(id: string): Promise<void> {
  await deleteDoc(doc(db, "clients", id));
}

export async function getClients(): Promise<Client[]> {
  const q = query(collection(db, "clients"), orderBy("nombre", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Client, "id">),
  }));
}

export function subscribeClients(
  onData: (clients: Client[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, "clients"), orderBy("nombre", "asc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const clients = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Client, "id">),
      }));
      onData(clients);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}
