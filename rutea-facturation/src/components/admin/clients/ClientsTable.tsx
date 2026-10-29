"use client";

import { useState } from "react";
import {
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Building,
  User,
} from "lucide-react";
import { deleteClient } from "@/services/clients.service";
import { getClientInitials } from "@/utils/client";
import { DeleteClientDialog } from "@/components/admin/clients/DeleteClientDialog";
import type { Client } from "@/types/client";

interface ClientsTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
}

export function ClientsTable({ clients, onEdit }: ClientsTableProps) {
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteClient(clientToDelete.id);
      setClientToDelete(null);
    } catch {
      setDeleteError("No se pudo eliminar el cliente. Inténtalo de nuevo.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {clients.map((client) => {
          return (
            <div
              key={client.id}
              className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-card/60 p-4 shadow-xs backdrop-blur-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent font-semibold text-xs text-foreground">
                    {getClientInitials(client)}
                  </div>
                  <div className="min-w-0">
                    {client.nombreComercio ? (
                      <>
                        <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
                          {client.nombreComercio}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                          <User size={12} />
                          {client.nombre}
                        </p>
                      </>
                    ) : (
                      <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
                        {client.nombre}
                      </h3>
                    )}
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary shrink-0">
                  <Building size={11} />
                  {client.ciudad}
                </span>
              </div>

              <div className="rounded-xl bg-accent/20 p-2.5 border border-border/30 space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                    <Phone size={13} className="text-primary shrink-0" />
                    <a
                      href={`tel:${client.telefono}`}
                      className="font-mono text-foreground hover:underline"
                    >
                      {client.telefono}
                    </a>
                  </div>

                  {client.correo && (
                    <div className="flex items-center gap-1.5 text-muted-foreground truncate max-w-[160px]">
                      <Mail size={13} className="shrink-0" />
                      <span className="truncate">{client.correo}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-1.5 text-muted-foreground pt-1 border-t border-border/20">
                  <MapPin size={13} className="text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground text-[11px] leading-tight">
                    {client.direccion}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 border-t border-border/30 pt-2 text-xs">
                <button
                  onClick={() => onEdit(client)}
                  aria-label={`Editar ${client.nombreComercio || client.nombre}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Edit2 size={15} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setClientToDelete(client)}
                  aria-label={`Eliminar ${client.nombreComercio || client.nombre}`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 size={15} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-accent/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="px-5 py-3.5">
                  Cliente / Comercio
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Teléfono
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Correo
                </th>
                <th scope="col" className="px-5 py-3.5">
                  Dirección
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Ciudad
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {clients.map((client) => {
                return (
                  <tr
                    key={client.id}
                    className="transition-colors hover:bg-accent/40"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent font-semibold text-xs text-foreground">
                          {getClientInitials(client)}
                        </div>
                        <div className="min-w-0">
                          {client.nombreComercio ? (
                            <>
                              <p className="font-semibold text-foreground truncate max-w-[200px]">
                                {client.nombreComercio}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {client.nombre}
                              </p>
                            </>
                          ) : (
                            <p className="font-semibold text-foreground truncate max-w-[200px]">
                              {client.nombre}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <a
                        href={`tel:${client.telefono}`}
                        className="font-mono text-xs text-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
                      >
                        <Phone size={13} className="text-muted-foreground" />
                        {client.telefono}
                      </a>
                    </td>

                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {client.correo ? (
                        <span className="truncate max-w-[180px] block">
                          {client.correo}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 max-w-[240px]">
                        <MapPin size={13} className="text-muted-foreground shrink-0" />
                        <span className="truncate text-foreground">
                          {client.direccion}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        <Building size={11} />
                        {client.ciudad}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEdit(client)}
                          aria-label={`Editar ${client.nombreComercio || client.nombre}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <Edit2 size={16} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setClientToDelete(client)}
                          aria-label={`Eliminar ${client.nombreComercio || client.nombre}`}
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

      <DeleteClientDialog
        client={clientToDelete}
        isDeleting={isDeleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={() => !isDeleting && setClientToDelete(null)}
      />
    </>
  );
}
