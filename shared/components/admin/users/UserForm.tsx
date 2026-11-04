"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUser, updateUser } from "../../../services/users.service";
import {
  createUserSchema,
  editUserSchema,
  type UserFormValues,
} from "../../../schemas/user.schema";
import { USER_ROLE_OPTIONS } from "../../../constants/roles";
import { ALL_USER_ROLES } from "../../../services/auth.service";
import type { UserProfile, UserRole } from "../../../types/auth";

interface UserFormProps {
  userToEdit?: UserProfile | null;
  availableRoles?: readonly UserRole[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({
  userToEdit,
  availableRoles = ALL_USER_ROLES,
  onSuccess,
  onCancel,
}: UserFormProps) {
  const isEdit = Boolean(userToEdit);
  const roleOptions = USER_ROLE_OPTIONS.filter(
    (option) =>
      availableRoles.includes(option.value) || option.value === userToEdit?.rol
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(isEdit ? editUserSchema : createUserSchema),
    defaultValues: {
      nombre: userToEdit?.nombre ?? "",
      apellido: userToEdit?.apellido ?? "",
      email: userToEdit?.email ?? "",
      rol: userToEdit?.rol ?? "delivery",
      password: "",
    },
  });

  useEffect(() => {
    if (userToEdit) {
      reset({
        nombre: userToEdit.nombre ?? "",
        apellido: userToEdit.apellido ?? "",
        email: userToEdit.email ?? "",
        rol: userToEdit.rol,
        password: "",
      });
    } else {
      reset({
        nombre: "",
        apellido: "",
        email: "",
        rol: "delivery",
        password: "",
      });
    }
  }, [userToEdit, reset]);

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (isEdit && userToEdit) {
        await updateUser(userToEdit.uid, {
          nombre: values.nombre,
          apellido: values.apellido,
          rol: values.rol,
        });
      } else {
        await createUser({
          nombre: values.nombre,
          apellido: values.apellido,
          email: values.email,
          rol: values.rol,
          password: values.password!,
        });
      }
      onSuccess();
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error?.code === "auth/email-already-in-use") {
        setError("email", { message: "Este correo electrónico ya está registrado." });
      } else {
        setError("root", {
          message: error?.message || "Ocurrió un error al procesar el usuario. Inténtalo de nuevo.",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="nombre" className="text-xs font-medium text-foreground">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            placeholder="Juan"
            disabled={isSubmitting}
            {...register("nombre")}
            className="w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
          {errors.nombre && (
            <p className="px-1 text-xs text-destructive">{errors.nombre.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="apellido" className="text-xs font-medium text-foreground">
            Apellido
          </label>
          <input
            id="apellido"
            type="text"
            placeholder="Pérez"
            disabled={isSubmitting}
            {...register("apellido")}
            className="w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
          {errors.apellido && (
            <p className="px-1 text-xs text-destructive">{errors.apellido.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-medium text-foreground">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          placeholder="juan.perez@empresa.com"
          disabled={isSubmitting || isEdit}
          {...register("email")}
          className="w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted/10 disabled:opacity-60"
        />
        {errors.email && (
          <p className="px-1 text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {!isEdit && (
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-medium text-foreground">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            disabled={isSubmitting}
            {...register("password")}
            className="w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
          {errors.password && (
            <p className="px-1 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="rol" className="text-xs font-medium text-foreground">
          Rol de usuario
        </label>
        <select
          id="rol"
          disabled={isSubmitting}
          {...register("rol")}
          className="w-full rounded-xl border border-border bg-input px-3.5 py-2.5 text-sm text-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        >
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.rol && (
          <p className="px-1 text-xs text-destructive">{errors.rol.message}</p>
        )}
      </div>

      {errors.root && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3.5 py-2.5">
          <p className="text-xs text-destructive">{errors.root.message}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-3">
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
              : "Creando..."
            : isEdit
            ? "Guardar cambios"
            : "Crear usuario"}
        </button>
      </div>
    </form>
  );
}
