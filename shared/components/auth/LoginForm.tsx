"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginWithEmailAndPassword } from "../../services/auth.service";
import { loginSchema, type LoginFormValues } from "../../schemas/auth.schema";
import type { LoginFormProps } from "../../types/auth";

export function LoginForm({
  allowedRoles,
  roleRedirects = {},
  defaultRedirect = "/dashboard",
  onSuccess,
  unauthorizedMessage = "No tienes permisos para acceder a esta aplicación.",
}: LoginFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const { profile } = await loginWithEmailAndPassword(
        values.email,
        values.password,
        allowedRoles
      );

      if (onSuccess) {
        onSuccess(profile);
        return;
      }

      const destination = roleRedirects[profile.rol] ?? defaultRedirect;
      router.push(destination);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHORIZED_ROLE") {
        setError("root", {
          message: unauthorizedMessage,
        });
        return;
      }

      setError("root", {
        message: "Correo o contraseña incorrectos. Inténtalo de nuevo.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full space-y-4">
      <div className="space-y-1">
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Correo electrónico"
          disabled={isSubmitting}
          {...register("email")}
          className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
        {errors.email && (
          <p className="px-1 text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Contraseña"
          disabled={isSubmitting}
          {...register("password")}
          className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
        {errors.password && (
          <p className="px-1 text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {errors.root && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive">{errors.root.message}</p>
        </div>
      )}

      <button
        id="login-submit"
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
