export interface Client {
  id: string;
  nombre: string;
  nombreComercio?: string;
  telefono: string;
  correo?: string;
  direccion: string;
  ciudad: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateClientData = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateClientData = Partial<CreateClientData>;
