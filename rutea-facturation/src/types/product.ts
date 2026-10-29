export type UnidadMedida =
  | 'UNIDAD'
  | 'KILO'
  | 'GRAMO'
  | 'LITRO'
  | 'METRO'
  | 'CAJA';

export interface Product {
  id: string;
  sku: string;
  codigo?: string;
  nombre: string;
  categoria: string;
  unidadMedida: UnidadMedida;
  permiteDecimales: boolean;
  costoUnitario: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateProductData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProductData = Partial<CreateProductData>;
