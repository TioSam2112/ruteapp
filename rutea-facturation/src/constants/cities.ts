export const COMMON_CITIES = [
  "Bogotá",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Bucaramanga",
  "Pereira",
  "Manizales",
  "Cúcuta",
  "Ibagué",
  "Santa Marta",
  "Villavicencio",
  "Pasto",
  "Montería",
  "Valledupar",
] as const;

export type CommonCity = (typeof COMMON_CITIES)[number];
