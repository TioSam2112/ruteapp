export const DEFAULT_CATEGORIES = [
  "Abarrotes",
  "Bebidas",
  "Carnicería y Charcutería",
  "Lácteos",
  "Ferretería y Herramientas",
  "Aseo y Limpieza",
  "Panadería",
  "Snacks y Golosinas",
  "Frutas y Verduras",
  "Droguería y Cuidado Personal",
] as const;

export type DefaultCategory = (typeof DEFAULT_CATEGORIES)[number];
