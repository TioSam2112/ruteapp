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
import type { CreateProductData, Product, UpdateProductData } from "@/types/product";

export async function createProduct(data: CreateProductData): Promise<Product> {
  const productsRef = collection(db, "products");
  const newDocRef = doc(productsRef);
  const now = new Date().toISOString();

  const product: Product = {
    id: newDocRef.id,
    sku: data.sku.trim().toUpperCase(),
    codigo: data.codigo ? data.codigo.trim() : data.sku.trim().toUpperCase(),
    nombre: data.nombre.trim(),
    categoria: data.categoria.trim(),
    unidadMedida: data.unidadMedida,
    permiteDecimales: Boolean(data.permiteDecimales),
    costoUnitario: Number(data.costoUnitario),
    precioVenta: Number(data.precioVenta),
    stockActual: Number(data.stockActual),
    ...(data.stockMinimo !== undefined && data.stockMinimo !== null
      ? { stockMinimo: Number(data.stockMinimo) }
      : {}),
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(newDocRef, product);
  return product;
}

export async function updateProduct(id: string, data: UpdateProductData): Promise<void> {
  const docRef = doc(db, "products", id);
  const payload: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };

  if (data.sku !== undefined) payload.sku = data.sku.trim().toUpperCase();
  if (data.codigo !== undefined) payload.codigo = data.codigo.trim();
  if (data.nombre !== undefined) payload.nombre = data.nombre.trim();
  if (data.categoria !== undefined) payload.categoria = data.categoria.trim();
  if (data.unidadMedida !== undefined) payload.unidadMedida = data.unidadMedida;
  if (data.permiteDecimales !== undefined) payload.permiteDecimales = Boolean(data.permiteDecimales);
  if (data.costoUnitario !== undefined) payload.costoUnitario = Number(data.costoUnitario);
  if (data.precioVenta !== undefined) payload.precioVenta = Number(data.precioVenta);
  if (data.stockActual !== undefined) payload.stockActual = Number(data.stockActual);
  if (data.stockMinimo !== undefined) {
    payload.stockMinimo = data.stockMinimo !== null ? Number(data.stockMinimo) : null;
  }

  await updateDoc(docRef, payload);
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, "products", id));
}

export async function getProducts(): Promise<Product[]> {
  const q = query(collection(db, "products"), orderBy("nombre", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Product, "id">),
  }));
}

export function subscribeProducts(
  onData: (products: Product[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, "products"), orderBy("nombre", "asc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const products = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Product, "id">),
      }));
      onData(products);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}
