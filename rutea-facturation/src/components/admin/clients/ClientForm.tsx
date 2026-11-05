"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Store,
  Phone,
  Mail,
  MapPin,
  Building,
} from "lucide-react";
import { createClient, updateClient } from "@/services/clients.service";
import {
  clientSchema,
  type ClientFormInput,
  type ClientFormOutput,
} from "@/schemas/client.schema";
import { COMMON_CITIES } from "@/constants/cities";
import type { Client } from "@/types/client";

interface ClientFormProps {
  clientToEdit?: Client | null;
  onSuccess: (client?: Client) => void;
  onCancel: () => void;
}

export function ClientForm({
  clientToEdit,
  onSuccess,
  onCancel,
}: ClientFormProps) {
  const isEdit = Boolean(clientToEdit);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormInput, unknown, ClientFormOutput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nombre: clientToEdit?.nombre ?? "",
      nombreComercio: clientToEdit?.nombreComercio ?? "",
      telefono: clientToEdit?.telefono ?? "",
      correo: clientToEdit?.correo ?? "",
      direccion: clientToEdit?.direccion ?? "",
      ciudad: clientToEdit?.ciudad ?? "",
    },
  });

  useEffect(() => {
    if (clientToEdit) {
      reset({
        nombre: clientToEdit.nombre,
        nombreComercio: clientToEdit.nombreComercio ?? "",
        telefono: clientToEdit.telefono,
        correo: clientToEdit.correo ?? "",
        direccion: clientToEdit.direccion,
        ciudad: clientToEdit.ciudad,
      });
    } else {
      reset({
        nombre: "",
        nombreComercio: "",
        telefono: "",
        correo: "",
        direccion: "",
        ciudad: "",
      });
    }
  }, [clientToEdit, reset]);

  const onSubmit = async (values: ClientFormOutput) => {
    try {
      if (isEdit && clientToEdit) {
        await updateClient(clientToEdit.id, {
          nombre: values.nombre,
          nombreComercio: values.nombreComercio || undefined,
          telefono: values.telefono,
          correo: values.correo || undefined,
          direccion: values.direccion,
          ciudad: values.ciudad,
        });
      } else {
        const createdClient = await createClient({
          nombre: values.nombre,
          nombreComercio: values.nombreComercio || undefined,
          telefono: values.telefono,
          correo: values.correo || undefined,
          direccion: values.direccion,
          ciudad: values.ciudad,
        });
        onSuccess(createdClient);
        return;
      }
      onSuccess();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError("root", {
        message:
          error?.message ||
          "Ocurrió un error al guardar el cliente. Inténtalo de nuevo.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="nombre" className="text-xs font-medium text-foreground">
            Nombre del contacto / cliente <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <User size={15} />
            </span>
            <input
              id="nombre"
              type="text"
              placeholder="Ej. Carlos Rodríguez"
              disabled={isSubmitting}
              {...register("nombre")}
              className="w-full rounded-xl border border-border bg-input pl-9 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>
          {errors.nombre && (
            <p className="px-1 text-xs text-destructive">{errors.nombre.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="nombreComercio"
              className="text-xs font-medium text-foreground"
            >
              Nombre del Comercio / Negocio
            </label>
            <span className="text-[11px] text-muted-foreground">Opcional</span>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Store size={15} />
            </span>
            <input
              id="nombreComercio"
              type="text"
              placeholder="Ej. Supermercado El Ahorro, Ferretería Central..."
              disabled={isSubmitting}
              {...register("nombreComercio")}
              className="w-full rounded-xl border border-border bg-input pl-9 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>
          {errors.nombreComercio && (
            <p className="px-1 text-xs text-destructive">
              {errors.nombreComercio.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="telefono" className="text-xs font-medium text-foreground">
            Teléfono / Celular <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Phone size={15} />
            </span>
            <input
              id="telefono"
              type="tel"
              placeholder="Ej. +57 310 123 4567"
              disabled={isSubmitting}
              {...register("telefono")}
              className="w-full rounded-xl border border-border bg-input pl-9 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 font-mono"
            />
          </div>
          {errors.telefono && (
            <p className="px-1 text-xs text-destructive">{errors.telefono.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="correo" className="text-xs font-medium text-foreground">
              Correo Electrónico
            </label>
            <span className="text-[11px] text-muted-foreground">Opcional</span>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Mail size={15} />
            </span>
            <input
              id="correo"
              type="email"
              placeholder="cliente@ejemplo.com"
              disabled={isSubmitting}
              {...register("correo")}
              className="w-full rounded-xl border border-border bg-input pl-9 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>
          {errors.correo && (
            <p className="px-1 text-xs text-destructive">{errors.correo.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="direccion" className="text-xs font-medium text-foreground">
            Dirección de Entrega <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <MapPin size={15} />
            </span>
            <input
              id="direccion"
              type="text"
              placeholder="Ej. Calle 45 # 22 - 15, Barrio Centro"
              disabled={isSubmitting}
              {...register("direccion")}
              className="w-full rounded-xl border border-border bg-input pl-9 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>
          {errors.direccion && (
            <p className="px-1 text-xs text-destructive">{errors.direccion.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="ciudad" className="text-xs font-medium text-foreground">
            Ciudad / Población <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Building size={15} />
            </span>
            <input
              id="ciudad"
              type="text"
              list="cities-list"
              placeholder="Ej. Bogotá, Medellín, Girardot..."
              disabled={isSubmitting}
              {...register("ciudad")}
              className="w-full rounded-xl border border-border bg-input pl-9 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
            <datalist id="cities-list">
              {COMMON_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          {errors.ciudad && (
            <p className="px-1 text-xs text-destructive">{errors.ciudad.message}</p>
          )}
        </div>
      </div>

      {errors.root && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3.5 py-2.5">
          <p className="text-xs text-destructive">{errors.root.message}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-xl border border-border/80 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? isEdit
              ? "Actualizando..."
              : "Guardando..."
            : isEdit
            ? "Guardar cambios"
            : "Registrar cliente"}
        </button>
      </div>
    </form>
  );
}
