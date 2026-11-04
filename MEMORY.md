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

Final directory structure and exports under `shared/` (`index.ts`):

- **`types/`**
  - `types/auth.ts`: `UserRole` (`'admin' | 'facturation' | 'picker' | 'delivery'`), `LoginCredentials`, `UserProfile`, `AuthResult`, `CreateUserData`, `UpdateUserData`, `LoginFormProps`
  - `types/order.ts`: `Order`, `OrderItem`, `OrderStatus`, `ItemPickingStatus`, `OrderItemPickingPatch`, `PickingAuditLog`, `PickingAuditUser`, `ClientOrderData`, `OrderReliquidationSummary`, `CreateOrderData`
- **`schemas/`**
  - `schemas/auth.schema.ts`: `loginSchema`, `LoginFormInput`, `LoginFormOutput`, `LoginFormValues`
  - `schemas/user.schema.ts`: `createUserSchema`, `editUserSchema`, `CreateUserFormInput`, `CreateUserFormOutput`, `EditUserFormInput`, `EditUserFormOutput`, `UserFormValues`
- **`constants/`**
  - `constants/roles.ts`: `USER_ROLE_OPTIONS`, `ROLE_BADGE_CONFIG`, `RoleOption`, `RoleBadgeConfig`
- **`utils/`**
  - `utils/facturation.ts`: `calculateItemSubtotal`, `calculateQuantityAdjustment`, `calculateOrderTotals`, `mergeOrAddOrderItem`, `formatPosCurrency`
  - `utils/user.ts`: `getUserInitials`, `getUserFullName`, `formatRegistrationDate`
- **`services/`**
  - `services/firebase.ts`: Single Firebase SDK instance (`app`, `db`, `auth`, `firebaseConfig`)
  - `services/auth.service.ts`: `ALL_USER_ROLES`, `loginWithEmailAndPassword`, `getCurrentUserProfile`, `logout`
  - `services/users.service.ts`: Admin user CRUD and real-time subscriptions (`createUser`, `updateUser`, `deleteUser`, `getUsers`, `subscribeUsers`)
  - `services/orders.service.ts`: Barrel re-export of `services/orders/*`
  - `services/orders/`:
    - `orders.helpers.ts`: `ORDERS_COLLECTION`, `mapOrderDoc`, `roundCurrency`, `computePickingProgress`, `buildReliquidationSummary`, `sanitizeOrderItem`, `buildSyncedObsAudit`
    - `orders.picking.helpers.ts`: `resolvePickingAction`
    - `orders.queries.service.ts`: `getOrderById`, `getOrders`, `subscribeOrders`, `generateNextFacturaNumber`
    - `orders.facturation.service.ts`: `createOrder`, `subscribeToSellerOrders`, `approveOrderForDelivery`
    - `orders.fulfillment.service.ts`: `subscribeToFulfillmentOrders`, `updateOrderItemPicking`
    - `orders.fulfillment.complete.service.ts`: `completeOrderFulfillment`, `toggleGeneralObservationCheck`
    - `index.ts`: Barrel export for all order service submodules
- **`hooks/`**
  - `hooks/useEscapeKey.ts`: `useEscapeKey`
- **`components/`**
  - `components/auth/LoginForm.tsx`: `LoginForm` (parameterized by `allowedRoles`, `roleRedirects`, `defaultRedirect`, `onSuccess`, `unauthorizedMessage`)
  - `components/ui/Tooltip.tsx`: Portal-based `Tooltip`
  - `components/admin/users/`: `UsersView`, `UsersTable`, `UserModal`, `UserForm`, `DeleteUserDialog` (parameterized by `availableRoles?: readonly UserRole[]`)

---

## 3. CURRENT PROJECT STATUS & NEXT MODULE (`rutea-delivery`)

- **Current Status — Base Refactoring Completed (Phases 1–7):**
  - Centralized monorepo governance (`/AGENTS.md`, `/MEMORY.md`, `/.agents/skills/`) and unified the root `pnpm` workspace.
  - Extracted cross-cutting UI, hooks, schemas, constants, and the admin `users` module into `@rutea/shared`, and modularized `orders.service.ts` into cohesive domain submodules under `shared/services/orders/`.
  - Decomposed monolithic components across `rutea-facturation` and `rutea-fulfillment` into focused subcomponents (< 180 lines) and dedicated custom hooks.
  - Audited and hardened `/firestore.rules` (enforcing RBAC across `'admin'`, `'facturation'`, `'picker'`/`'alistador'`, and `'delivery'` roles and state transitions on `orders`) and `/firestore.indexes.json` (composite indexes for `estado + createdAt` and `id_vendedor + createdAt`).
- **Next Module — `rutea-delivery`:**
  - Scaffold Next.js App Router application connected to `@rutea/shared`.
  - Build delivery routes grouped by population (`clientData.ciudad`) for orders in `'LISTO_PARA_REPARTO'` and `'EN_RUTA'`.
  - Implement delivery confirmation (`'ENTREGADO'`), payment collection recording (`EFECTIVO`, `TRANSFERENCIA`, `CREDITO`), partial/full returns, and daily cash reconciliation.
