"use client";

import { useState } from "react";
import { User, Store, MapPin, Phone, RotateCcw, Users, UserPlus } from "lucide-react";
import { getClients } from "@/services/clients.service";
import { DEFAULT_CONSUMIDOR_FINAL } from "@/constants/clients";
import { ClientModal } from "@/components/admin/clients/ClientModal";
import { ClientSearchModal } from "@/components/facturation/ClientSearchModal";
import type { Client } from "@/types/client";
import type { ClientOrderData } from "@rutea/shared";

export { DEFAULT_CONSUMIDOR_FINAL };

interface ClientSelectorFactProps {
  selectedClient: ClientOrderData & { id: string };
  onSelectClient: (client: ClientOrderData & { id: string }) => void;
  onClientCreated?: (newClient: Client) => void;
  initialClients?: Client[];
  onClientsLoaded?: (clients: Client[]) => void;
}

export function ClientSelectorFact({
  selectedClient,
  onSelectClient,
  onClientCreated,
  initialClients,
  onClientsLoaded,
}: ClientSelectorFactProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>(initialClients ?? []);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const isDefault = selectedClient.id === DEFAULT_CONSUMIDOR_FINAL.id;

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    setSearch("");
    if (clients.length === 0) {
      setLoading(true);
      try {
        const data = await getClients();
        setClients(data);
        onClientsLoaded?.(data);
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

  const handleClientCreated = (newClient?: Client) => {
    if (!newClient) return;

    setClients((prev) => [newClient, ...prev.filter((c) => c.id !== newClient.id)]);
    onSelectClient({
      id: newClient.id,
      nombre: newClient.nombreComercio ? `${newClient.nombreComercio} (${newClient.nombre})` : newClient.nombre,
      nit: "",
      telefono: newClient.telefono,
      direccion: newClient.direccion,
      ciudad: newClient.ciudad,
    });
    onClientCreated?.(newClient);
    setIsCreateModalOpen(false);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/50 bg-card/60 p-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {isDefault ? <User size={18} /> : <Store size={18} />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground truncate">{selectedClient.nombre}</span>
              {isDefault ? (
                <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">NIT: {selectedClient.nit}</span>
              ) : selectedClient.ciudad && (
                <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">{selectedClient.ciudad}</span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 truncate">
              {selectedClient.telefono && <span className="flex items-center gap-1"><Phone size={11} /> {selectedClient.telefono}</span>}
              {selectedClient.direccion && <span className="flex items-center gap-1 truncate"><MapPin size={11} /> {selectedClient.direccion}</span>}
              {isDefault && <span>Venta general en mostrador</span>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {!isDefault && (
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1 rounded-xl border border-border/80 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95"
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

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 active:scale-95"
            title="Crear un nuevo cliente"
          >
            <UserPlus size={14} />
            <span>+ Nuevo Cliente</span>
          </button>
        </div>
      </div>

      <ClientSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clients={clients}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        selectedClientId={selectedClient.id}
        onSelectClient={handleSelect}
        onResetToDefault={handleResetToDefault}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      <ClientModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleClientCreated}
      />
    </>
  );
}
