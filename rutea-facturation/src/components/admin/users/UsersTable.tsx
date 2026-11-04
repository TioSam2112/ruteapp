"use client";

import { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { deleteUser } from "@/services/users.service";
import { ROLE_BADGE_CONFIG } from "@/constants/roles";
import {
  getUserInitials,
  getUserFullName,
  formatRegistrationDate,
} from "@/utils/user";
import { DeleteUserDialog } from "@/components/admin/users/DeleteUserDialog";
import type { UserProfile } from "@rutea/shared";

interface UsersTableProps {
  users: UserProfile[];
  onEdit: (user: UserProfile) => void;
}

export function UsersTable({ users, onEdit }: UsersTableProps) {
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteUser(userToDelete.uid);
      setUserToDelete(null);
    } catch {
      setDeleteError("No se pudo eliminar el usuario. Inténtalo de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {users.map((user, index) => {
          const badge = ROLE_BADGE_CONFIG[user.rol] ?? ROLE_BADGE_CONFIG.delivery;
          const fullName = getUserFullName(user);

          return (
            <div
              key={user.uid || `user-${index}`}
              className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/60 p-4 shadow-sm backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent font-semibold text-xs text-foreground">
                    {getUserInitials(user)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {fullName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${badge.className}`}
                >
                  {badge.label}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-border/30 pt-3 text-xs text-muted-foreground">
                <span>Registrado: {formatRegistrationDate(user.createdAt)}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(user)}
                    aria-label={`Editar ${fullName}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Edit2 size={15} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => setUserToDelete(user)}
                    aria-label={`Eliminar ${fullName}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-accent/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="px-6 py-3.5">
                  Usuario
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Correo electrónico
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Rol
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Fecha de alta
                </th>
                <th scope="col" className="px-6 py-3.5 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {users.map((user, index) => {
                const badge = ROLE_BADGE_CONFIG[user.rol] ?? ROLE_BADGE_CONFIG.delivery;
                const fullName = getUserFullName(user);

                return (
                  <tr
                    key={user.uid || `user-row-${index}`}
                    className="transition-colors hover:bg-accent/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent font-semibold text-xs text-foreground">
                          {getUserInitials(user)}
                        </div>
                        <div className="min-w-0 font-medium text-foreground">
                          {fullName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {formatRegistrationDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(user)}
                          aria-label={`Editar ${fullName}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <Edit2 size={16} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setUserToDelete(user)}
                          aria-label={`Eliminar ${fullName}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 size={16} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteUserDialog
        user={userToDelete}
        isDeleting={isDeleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => !isDeleting && setUserToDelete(null)}
      />
    </>
  );
}
