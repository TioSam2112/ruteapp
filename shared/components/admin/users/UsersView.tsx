"use client";

import { useEffect, useState } from "react";
import { UserPlus, Users, Loader2 } from "lucide-react";
import { subscribeUsers } from "../../../services/users.service";
import { UsersTable } from "./UsersTable";
import { UserModal } from "./UserModal";
import type { UserProfile, UserRole } from "../../../types/auth";

interface UsersViewProps {
  availableRoles?: readonly UserRole[];
}

export function UsersView({ availableRoles }: UsersViewProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeUsers(
      (data) => {
        setUsers(data);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCreate = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: UserProfile) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUserToEdit(null);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Usuarios y Roles
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Administra los accesos y roles del personal en la plataforma.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary-hover active:scale-[0.99]"
        >
          <UserPlus size={16} strokeWidth={2} />
          <span>Nuevo usuario</span>
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-border/40 bg-card/40">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs">Cargando usuarios...</span>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/30 p-8 text-center backdrop-blur-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-muted-foreground mb-4 shadow-inner">
            <Users size={28} strokeWidth={1.5} />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            No hay usuarios registrados
          </h2>
          <p className="mt-1.5 max-w-sm text-xs text-muted-foreground leading-relaxed">
            Comienza registrando al primer usuario para habilitar el acceso a los módulos de facturación o reparto.
          </p>
          <button
            onClick={handleCreate}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary-hover active:scale-[0.99]"
          >
            <UserPlus size={14} strokeWidth={2} />
            <span>Agregar primer usuario</span>
          </button>
        </div>
      ) : (
        <UsersTable users={users} onEdit={handleEdit} />
      )}

      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userToEdit={userToEdit}
        availableRoles={availableRoles}
      />
    </div>
  );
}
