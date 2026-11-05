"use client";

import { X, Search, User, Check, UserPlus } from "lucide-react";
import { searchClients } from "@/utils/client";
import { useEscapeKey } from "@rutea/shared";
import type { Client } from "@/types/client";

interface ClientSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  selectedClientId: string;
  onSelectClient: (client: Client) => void;
  onResetToDefault: () => void;
  onOpenCreateModal: () => void;
}

export function ClientSearchModal({
  isOpen,
  onClose,
  clients,
  loading,
  search,
  onSearchChange,
  selectedClientId,
  onSelectClient,
  onResetToDefault,
  onOpenCreateModal,
}: ClientSearchModalProps) {
  useEscapeKey(isOpen, onClose);

  if (!isOpen) return null;

  const filteredClients = searchClients(clients, search);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-2xl transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div>
            <h3 className="text-base font-semibold text-foreground">Seleccionar Cliente de la Orden</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Elige un cliente registrado o mantén Consumidor Final.</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        <div className="pt-3 pb-2 space-y-2">
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar cliente por nombre, comercio o ciudad..."
              autoFocus
              className="w-full rounded-xl border border-border bg-input pl-9 pr-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onResetToDefault}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-accent/40 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent"
              >
                <User size={13} className="text-primary" />
                <span>Consumidor Final</span>
              </button>
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                <UserPlus size={13} />
                <span>+ Nuevo</span>
              </button>
            </div>
            <span className="text-[11px] text-muted-foreground">{filteredClients.length} clientes</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border/30 mt-2 pr-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Cargando directorio de clientes...</div>
          ) : filteredClients.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center px-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-muted-foreground mb-2">
                <Search size={18} />
              </div>
              <p className="text-xs font-medium text-foreground">No se encontraron clientes registrados</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">
                {search ? `No hay resultados para "${search}".` : "No hay clientes en el directorio."}
              </p>
              <button
                type="button"
                onClick={onOpenCreateModal}
                className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground shadow-xs transition-all hover:bg-primary/90 active:scale-95"
              >
                <UserPlus size={14} />
                <span>+ Registrar Nuevo Cliente</span>
              </button>
            </div>
          ) : (
            filteredClients.map((c) => {
              const isCurrent = selectedClientId === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectClient(c)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isCurrent ? "bg-primary/10 border border-primary/20" : "hover:bg-accent/40"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-xs text-foreground truncate">{c.nombreComercio || c.nombre}</p>
                      {c.nombreComercio && <span className="text-[11px] text-muted-foreground truncate">({c.nombre})</span>}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      <span>{c.ciudad}</span>
                      {c.telefono && <span>• {c.telefono}</span>}
                      {c.direccion && <span className="truncate">• {c.direccion}</span>}
                    </div>
                  </div>

                  {isCurrent ? (
                    <Check size={16} className="text-primary shrink-0 ml-2" />
                  ) : (
                    <button type="button" className="text-[11px] font-medium text-primary hover:underline shrink-0 ml-2">
                      Seleccionar
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
