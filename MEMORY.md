# RUTEA — PROJECT MEMORY & STATE LOG

> **Purpose:** This file maintains the living context of architectural decisions (ADRs), the data lifecycle, and the progress of development phases so that the AI agent can resume any task without losing context or hallucinating.

---

## 1. FIRESTORE ORDER FLOW (`orders` COLLECTION)

An invoice passes through all 3 monorepo modules under a single Firestore document:

1. **Creation (Presales in `rutea-facturation`):**

   - The sales representative creates the order in the POS (`/facturation`).
   - It is saved with `estado: 'PENDIENTE_ALISTAMIENTO'`, preserving the original quantities (`cantidad`, `subtotal`) and `initialTotal` intact.

2. **Warehouse Picking (`rutea-fulfillment`):**

   - Pickers in `/picking` see orders in real time (`onSnapshot`), grouped by `clientData.ciudad` (Population) and sorted by arrival time (`createdAt` FIFO).
   - When interacting with a product, the order transitions to `estado: 'EN_ALISTAMIENTO'`.
   - Each item records `pickingStatus` (`'ALISTADO' | 'PENDIENTE_LLEGADA' | 'AGOTADO'`), `cantidadAlistada` (adjusting actual units or decimal weights), `pickerNote`, and the `lastPickedBy` audit information (who performed the action and at what time).
   - The general observation (`generalObservation`) has its own checkbox (`generalObservationChecked` + `generalObservationAudit`).
   - When picking is completed, the order transitions to `estado: 'ALISTADO'` and calculates the `reliquidation` summary.

3. **Re-settlement and POS Printing (`rutea-facturation`):**

   - The invoicing clerk accesses `/facturation/invoices`, reviews the **Initial Version vs. Picked Version** comparison, prints the 80mm thermal receipt (`PosReceiptPrint`), and authorizes dispatch by changing the status to `'LISTO_PARA_REPARTO'`.

4. **Delivery and Cash Reconciliation (`rutea-delivery` — Future):**

   - Delivery personnel will process orders in `'LISTO_PARA_REPARTO'`, filtered by population, record payments (`EFECTIVO`, `TRANSFERENCIA`, `CREDITO`) and returns, and transition orders to `'ENTREGADO'`.

---

## 2. CURRENT `@rutea/shared` INVENTORY

- **Currently exported from `shared/`:**
  - `services/firebase.ts` (`app`, `db`, `auth`)
  - `services/auth.service.ts` (`loginUser`, `logout`, `getCurrentUserProfile`)
  - `services/orders.service.ts` (CRUD operations and real-time order subscriptions)
  - `components/auth/LoginForm.tsx` (Login form parameterized by `allowedRoles` and `redirectMap`)
  - `schemas/auth.schema.ts`, `schemas/user.schema.ts`, `types/auth.ts`, `types/order.ts`, `utils/facturation.ts`, `utils/user.ts`
  - `services/users.service.ts` (admin user CRUD), `constants/roles.ts`, `hooks/useEscapeKey.ts`, `components/ui/Tooltip.tsx`
  - `components/admin/users/` (`UsersView`, `UsersTable`, `UserModal`, `UserForm`, `DeleteUserDialog`; `availableRoles?: readonly UserRole[]` prop filters selectable roles, defaults to all). The picker role id is `'picker'`.

---

## 3. ACTIVE REFACTORING ROADMAP

- [x] **Phase 1:** Create `/AGENTS.md` and `/MEMORY.md`, and centralize `/.agents/skills/` at the root.
- [x] **Phase 2:** Unify the PNPM Workspace (remove duplicate `pnpm-lock.yaml` and `pnpm-workspace.yaml` files from sub-apps and clean up redundant `auth` re-exports).
- [x] **Phase 3:** Extract duplicated code (`Tooltip`, `useEscapeKey`, and the entire admin `users` module) into `@rutea/shared`.
- [ ] **Phase 4:** Internally modularize `shared/services/orders.service.ts` into domain-specific submodules.
- [ ] **Phase 5:** Break down large components in `rutea-facturation` (`PosInterface`, `InvoiceComparisonDetail`, `PosReceiptPrint`, `SellerInvoicesList`).
- [ ] **Phase 6:** Break down large components in `rutea-fulfillment` (`InvoicePickingDetail`, `PickingItemRow`, `InvoiceQueueList`).
- [ ] **Phase 7:** Audit `firestore.rules`, composite indexes, and global build validation.
