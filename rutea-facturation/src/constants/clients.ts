import type { ClientOrderData } from "@rutea/shared";

export const DEFAULT_CONSUMIDOR_FINAL: ClientOrderData & { id: string } = {
  id: "CF-DEFAULT",
  nombre: "CONSUMIDOR FINAL",
  nit: "222222222222",
  telefono: "",
  direccion: "",
  ciudad: "",
};
