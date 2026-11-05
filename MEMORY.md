# RUTEA — PROJECT MEMORY & STATE LOG

> **Purpose:** This file maintains the living context of architectural decisions (ADRs), the data lifecycle, and the progress of development phases so that the AI agent can resume any task without losing context or hallucinating.

---

## 1. FIRESTORE ORDER FLOW (`orders` COLLECTION)

An invoice passes through all 3 monorepo modules under a single Firestore document:

1. **Creation & Post-Creation Edit (Presales in `rutea-facturation`):**

   - The sales representative creates the order in the POS (`/facturation`) with `estado: 'PENDIENTE_ALISTAMIENTO'`, preserving original quantities (`cantidad`, `subtotal`) and `initialTotal` intact.
   - If the sales representative edits an existing invoice (`updateOrderFromFacturation`):
     - When `estado === 'PENDIENTE_ALISTAMIENTO'`, client, items, totals, `initialTotal`, and `lastSellerEdit` are updated directly.
     - When the order already has warehouse progress (`'EN_ALISTAMIENTO'` or `'ALISTADO'`), unchanged items keep their warehouse picking state intact (`pickingStatus`, `cantidadAlistada`, `pickerNote`, `lastPickedBy`), while added or quantity-modified items are marked with `pickingStatus: 'PENDIENTE_REVISION'`, `isAddedAfterCreation: true`, `previousQuantity`, and `addedAt`. The order transitions back to `'EN_ALISTAMIENTO'` with `hasPostPickingAdditions: true`.

2. **Warehouse Picking (`rutea-fulfillment`):**

   - Pickers in `/picking` see orders in real time (`onSnapshot`) across active and historical states (`'PENDIENTE_ALISTAMIENTO'`, `'EN_ALISTAMIENTO'`, `'ALISTADO'`, `'LISTO_PARA_REPARTO'`), grouped by `clientData.ciudad` (Population) and sorted by arrival time (`createdAt` FIFO).
   - When interacting with a product, the order transitions to `estado: 'EN_ALISTAMIENTO'`.
   - Each item records `pickingStatus` (`'ALISTADO' | 'PENDIENTE_LLEGADA' | 'AGOTADO'`), `cantidadAlistada` (adjusting actual units or decimal weights), `pickerNote`, and the `lastPickedBy` audit information.
   - The general observation (`generalObservation`) has its own checkbox (`generalObservationChecked` + `generalObservationAudit`).
   - When picking is completed (`completeOrderFulfillment`), the order transitions to `estado: 'ALISTADO'`, clears `hasPostPickingAdditions: false`, and calculates the `reliquidation` summary.
   - Pickers can reopen an `'ALISTADO'` order (`reopenOrderFulfillment`) back to `'EN_ALISTAMIENTO'` as long as it has not yet been approved as `'LISTO_PARA_REPARTO'`.

3. **Re-settlement and POS Printing (`rutea-facturation`):**

   - The invoicing clerk accesses `/facturation/invoices`, reviews the **Initial Version vs. Picked Version** comparison, prints the 80mm thermal receipt (`PosReceiptPrint`), and authorizes dispatch by changing the status to `'LISTO_PARA_REPARTO'`.

4. **Delivery and Cash Reconciliation (`rutea-delivery` — Future):**

   - Delivery personnel will process orders in `'LISTO_PARA_REPARTO'`, filtered by population, record payments (`EFECTIVO`, `TRANSFERENCIA`, `CREDITO`) and returns, and transition orders to `'ENTREGADO'`.

---

## 2. CURRENT `@rutea/shared` INVENTORY

Final directory structure and exports under `shared/` (`index.ts`):

- **`types/`**
  - `types/auth.ts`: `UserRole` (`'admin' | 'facturation' | 'picker' | 'delivery'`), `LoginCredentials`, `UserProfile`, `AuthResult`, `CreateUserData`, `UpdateUserData`, `LoginFormProps`
  - `types/order.ts`: `Order`, `OrderItem`, `OrderStatus`, `ItemPickingStatus`, `OrderItemPickingPatch`, `PickingAuditLog`, `PickingAuditUser`, `OrderSellerEditAudit`, `ClientOrderData`, `OrderReliquidationSummary`, `UpdateOrderFacturationPayload`, `CreateOrderData`
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
    - `orders.facturation.helpers.ts`: `normalizeClientOrderData`, `mergeOrderItemsForFacturationEdit`, `buildSellerEditAudit`, `buildFacturationEditPatch`
    - `orders.queries.service.ts`: `getOrderById`, `getOrders`, `subscribeOrders`, `subscribeToFulfillmentOrders`, `generateNextFacturaNumber`
    - `orders.facturation.service.ts`: `getOrderById`, `createOrder`, `updateOrderFromFacturation`, `subscribeToSellerOrders`, `approveOrderForDelivery`
    - `orders.fulfillment.service.ts`: `subscribeToFulfillmentOrders`, `updateOrderItemPicking`
    - `orders.fulfillment.complete.service.ts`: `completeOrderFulfillment`, `reopenOrderFulfillment`, `toggleGeneralObservationCheck`
    - `index.ts`: Barrel export for all order service submodules
- **`hooks/`**
  - `hooks/useEscapeKey.ts`: `useEscapeKey`
- **`components/`**
  - `components/auth/LoginForm.tsx`: `LoginForm` (parameterized by `allowedRoles`, `roleRedirects`, `defaultRedirect`, `onSuccess`, `unauthorizedMessage`)
  - `components/ui/Tooltip.tsx`: Portal-based `Tooltip`
  - `components/admin/users/`: `UsersView`, `UsersTable`, `UserModal`, `UserForm`, `DeleteUserDialog` (parameterized by `availableRoles?: readonly UserRole[]`)

---

## 3. CURRENT PROJECT STATUS & NEXT MODULE (`rutea-delivery`)

- **Current Status — Invoice Editing, Client Creation & Picking History/Reopen (Phase 1 of 5 Completed):**
  - Updated `/firestore.rules` to allow `facturation` and `admin` roles to create and update `clients/{clientId}` (`allow create, update: if isAdmin() || isFacturation();`) and allowed `hasPostPickingAdditions` in `isValidPickerOrderUpdate()`.
  - Extended `shared/types/order.ts` with `OrderSellerEditAudit`, `UpdateOrderFacturationPayload`, post-creation item tracking fields (`isAddedAfterCreation`, `previousQuantity`, `addedAt`), and order-level flags (`hasPostPickingAdditions`, `lastSellerEdit`).
  - Implemented `updateOrderFromFacturation` in `@rutea/shared` with smart item merging that preserves warehouse progress for unchanged items while flagging new/modified items as `'PENDIENTE_REVISION'`.
  - Updated `subscribeToFulfillmentOrders` to include `'ALISTADO'` and `'LISTO_PARA_REPARTO'`, updated `completeOrderFulfillment` to clear `hasPostPickingAdditions: false`, and implemented `reopenOrderFulfillment`.
- **Next Steps (Phases 2–5):**
  - Connect client creation and invoice editing UI in `rutea-facturation`, and picking history / reopen / post-picking addition badges in `rutea-fulfillment`.
