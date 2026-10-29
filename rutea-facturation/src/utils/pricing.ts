export interface ProfitCalculation {
  gananciaBruta: number;
  margenPorcentaje: string | null;
}

export function calculateProfitAndMargin(
  costoUnitario: unknown,
  precioVenta: unknown
): ProfitCalculation {
  const costo = Number(costoUnitario) || 0;
  const precio = Number(precioVenta) || 0;
  const gananciaBruta = precio - costo;
  const margenPorcentaje =
    costo > 0 ? ((gananciaBruta / costo) * 100).toFixed(1) : null;

  return { gananciaBruta, margenPorcentaje };
}

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("es-CO", { minimumFractionDigits: 2 })}`;
}
