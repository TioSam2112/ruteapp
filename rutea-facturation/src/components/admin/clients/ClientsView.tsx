"use client";

import { useEffect, useMemo, useState } from "react";
import {
  UserPlus,
  Users,
  Building2,
  MapPin,
  Search,
  Filter,
  Loader2,
  Store,
  X,
} from "lucide-react";
import { subscribeClients } from "@/services/clients.service";
import { ClientsTable } from "@/components/admin/clients/ClientsTable";
import { ClientModal } from "@/components/admin/clients/ClientModal";
import {
  extractClientCities,
  filterClients,
  calculateClientMetrics,
} from "@/utils/client";
import type { Client } from "@/types/client";

export function ClientsView() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("ALL");

  useEffect(() => {
    const unsubscribe = subscribeClients(
      (data) => {
        setClients(data);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const cities = useMemo(() => extractClientCities(clients), [clients]);

  const filteredClients = useMemo(
    () => filterClients(clients, searchTerm, selectedCity),
    [clients, searchTerm, selectedCity]
  );

  const metrics = useMemo(() => calculateClientMetrics(clients), [clients]);

  const handleCreate = () => {
    setClientToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setClientToEdit(null);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Directorio de Clientes
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Administra comercios, puntos de entrega y contactos para rutas de preventa.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary-hover active:scale-[0.99]"
        >
          <UserPlus size={16} strokeWidth={2} />
          <span>Nuevo cliente</span>
        </button>
      </div>

      {!loading && clients.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border/50 bg-card/60 p-4 shadow-2xs backdrop-blur-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Clientes</span>
              <Users size={16} className="text-primary" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground font-mono">
              {metrics.totalCount}
            </p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/60 p-4 shadow-2xs backdrop-blur-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Ciudades / Poblaciones</span>
              <MapPin size={16} className="text-emerald-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground font-mono">
              {metrics.citiesCount}
            </p>
          </div>

          <div className="rounded-2xl border border-border/50 bg-card/60 p-4 shadow-2xs backdrop-blur-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Comercios / Negocios</span>
              <Store size={16} className="text-indigo-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground font-mono">
              {metrics.businessesCount}
            </p>
          </div>
        </div>
      )}

      {!loading && clients.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, comercio, teléfono o dirección..."
              className="w-full rounded-xl border border-border bg-input pl-10 pr-9 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="rounded-xl border border-border bg-input px-3.5 py-2 text-xs text-foreground outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 shrink-0"
            >
              <option value="ALL">Todas las ciudades</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-border/40 bg-card/40">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs">Cargando directorio de clientes...</span>
          </div>
        </div>
      ) : clients.length === 0 ? (
        <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/30 p-8 text-center backdrop-blur-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-muted-foreground mb-4 shadow-inner">
            <Building2 size={28} strokeWidth={1.5} />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            No hay clientes registrados
          </h2>
          <p className="mt-1.5 max-w-sm text-xs text-muted-foreground leading-relaxed">
            Comienza registrando tu primer cliente o comercio para organizar las rutas
            de entrega y habilitar la facturación.
          </p>
          <button
            onClick={handleCreate}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary-hover active:scale-[0.99]"
          >
            <UserPlus size={14} strokeWidth={2} />
            <span>Registrar primer cliente</span>
          </button>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-border/40 bg-card/20 p-8 text-center">
          <Filter size={24} className="text-muted-foreground mb-2" />
          <h3 className="text-sm font-semibold text-foreground">
            No se encontraron clientes
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            No hay clientes que coincidan con los criterios de búsqueda.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCity("ALL");
            }}
            className="mt-3 text-xs text-primary font-medium hover:underline"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <ClientsTable clients={filteredClients} onEdit={handleEdit} />
      )}

      <ClientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        clientToEdit={clientToEdit}
      />
    </div>
  );
}
