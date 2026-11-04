"use client";

import { useState } from "react";
import {
  User,
  Store,
  MapPin,
  Phone,
  Search,
  X,
  Check,
  RotateCcw,
  Users,
} from "lucide-react";
import { getClients } from "@/services/clients.service";
import { searchClients } from "@/utils/client";
import { useEscapeKey } from "@rutea/shared";
import { DEFAULT_CONSUMIDOR_FINAL } from "@/constants/clients";
import type { Client } from "@/types/client";
import type { ClientOrderData } from "@rutea/shared";

export { DEFAULT_CONSUMIDOR_FINAL };

interface ClientSelectorFactProps {
  selectedClient: ClientOrderData & { id: string };
  onSelectClient: (client: ClientOrderData & { id: string }) => void;
}

export function ClientSelectorFact({
  selectedClient,
  onSelectClient,
}: ClientSelectorFactProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const isDefault = selectedClient.id === DEFAULT_CONSUMIDOR_FINAL.id;

  useEscapeKey(isModalOpen, () => setIsModalOpen(false));

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    setSearch("");
    if (clients.length === 0) {
      setLoading(true);
      try {
        const data = await getClients();
        setClients(data);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelect = (c: Client) => {
    onSelectClient({
      id: c.id,
      nombre: c.nombreComercio ? `${c.nombreComercio} (${c.nombre})` : c.nombre,
      nit: "",
      telefono: c.telefono,
      direccion: c.direccion,
      ciudad: c.ciudad,
    });
    setIsModalOpen(false);
  };

  const handleResetToDefault = () => {
    onSelectClient(DEFAULT_CONSUMIDOR_FINAL);
    setIsModalOpen(false);
  };

  const filteredClients = searchClients(clients, search);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/50 bg-card/60 p-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {isDefault ? <User size={18} /> : <Store size={18} />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground truncate">
                {selectedClient.nombre}
              </span>
              {isDefault ? (
                <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  NIT: {selectedClient.nit}
                </span>
              ) : (
                selectedClient.ciudad && (
                  <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {selectedClient.ciudad}
                  </span>
                )
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 truncate">
              {selectedClient.telefono && (
                <span className="flex items-center gap-1">
                  <Phone size={11} /> {selectedClient.telefono}
                </span>
              )}
              {selectedClient.direccion && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin size={11} /> {selectedClient.direccion}
                </span>
              )}
              {isDefault && (
                <span>Venta general en mostrador</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isDefault && (
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1 rounded-xl border border-border/80 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Restablecer a Consumidor Final"
            >
              <RotateCcw size={13} />
              <span>C. Final</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent/80 active:scale-95"
          >
            <Users size={14} className="text-primary" />
            <span>{isDefault ? "Asignar Cliente" : "Cambiar"}</span>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-2xl transition-all"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Seleccionar Cliente de la Orden
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Elige un cliente registrado o mantén Consumidor Final.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <div className="pt-3 pb-2 space-y-2">
              <div className="relative">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar cliente por nombre, comercio o ciudad..."
                  autoFocus
                  className="w-full rounded-xl border border-border bg-input pl-9 pr-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-accent/40 px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent"
                >
                  <User size={13} className="text-primary" />
                  <span>Usar Consumidor Final (222222222222)</span>
                </button>
                <span className="text-[11px] text-muted-foreground">
                  {filteredClients.length} clientes encontrados
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-border/30 mt-2 pr-1">
              {loading ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Cargando directorio de clientes...
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No se encontraron clientes registrados con ese término.
                </div>
              ) : (
                filteredClients.map((c) => {
                  const isCurrent = selectedClient.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelect(c)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                        isCurrent
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-accent/40"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-xs text-foreground truncate">
                            {c.nombreComercio || c.nombre}
                          </p>
                          {c.nombreComercio && (
                            <span className="text-[11px] text-muted-foreground truncate">
                              ({c.nombre})
                            </span>
                          )}
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
                        <button
                          type="button"
                          className="text-[11px] font-medium text-primary hover:underline shrink-0 ml-2"
                        >
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
      )}
    </>
  );
}
