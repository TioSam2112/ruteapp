# RUTEA — PROJECT MEMORY & STATE LOG

> **Purpose:** This file maintains the living context of architectural decisions (ADRs), the data lifecycle, and the structural organization of each module so that the AI agent can resume any task without losing context or hallucinating.

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

4. **Dispatch Assignment & Crew Delivery (`rutea-delivery`):**
   - Logistics administrators in `/admin/dispatch` group `'LISTO_PARA_REPARTO'` orders by population, audit picked vs. original quantities in read-only mode, and create a `delivery_sessions` document (`createDeliverySession`) assigning a crew of delivery personnel (`assignedCrew`), which atomically transitions the selected orders to `estado: 'EN_RUTA'` with `deliverySessionId` and `deliverySessionCode`.
   - Any member of the assigned crew opening `/delivery` automatically receives the shared route session in real time (`subscribeToUserDeliverySession`), transitions the session to `'EN_CURSO'`, views their crew companions and route progress, and processes the session's invoices (`subscribeToSessionOrders`) grouped by population.

---

## 2. CURRENT `@rutea/shared` INVENTORY

Final directory structure and exports under `shared/` (`index.ts`):

- **`types/`**
  - `types/auth.ts`: `UserRole` (`'admin' | 'facturation' | 'picker' | 'delivery'`), `LoginCredentials`, `UserProfile`, `AuthResult`, `CreateUserData`, `UpdateUserData`, `LoginFormProps`
  - `types/order.ts`: `Order` (including optional `deliverySessionId` and `deliverySessionCode`), `OrderItem`, `OrderStatus`, `ItemPickingStatus`, `OrderItemPickingPatch`, `PickingAuditLog`, `PickingAuditUser`, `OrderSellerEditAudit`, `ClientOrderData`, `OrderReliquidationSummary`, `UpdateOrderFacturationPayload`, `CreateOrderData`
  - `types/delivery-session.ts`: `DeliverySessionStatus` (`'ASIGNADA' | 'EN_CURSO' | 'LIQUIDADA'`), `DeliveryCrewMember`, `DeliverySession`, `CreateDeliverySessionPayload`
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
  - `services/delivery-sessions.service.ts`: Logistics delivery session management (`DELIVERY_SESSIONS_COLLECTION`, `subscribeToReadyOrders`, `createDeliverySession`, `subscribeToActiveSessions`, `subscribeToUserDeliverySession`, `subscribeToSessionOrders`, `updateDeliverySessionStatus`)
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

## 3. CURRENT `rutea-facturation` INVENTORY & ORGANIZATION

Next.js application (`rutea-facturation/src/`) dedicated to presales POS, invoice editing, re-settlement, 80mm thermal printing, and catalog/client administration. It must strictly preserve this layered organization:

- **`app/` (Routes & Protected Layouts)**
  - `app/page.tsx`: Login view consuming `@rutea/shared` `LoginForm` for `'admin'` and `'facturation'` roles.
  - `app/facturation/`: Collapsible sidebar layout (`layout.tsx`), POS terminal supporting both new order creation and existing order editing via `?editOrderId=...` (`page.tsx`), and seller invoice management/re-settlement (`invoices/page.tsx`).
  - `app/admin/`: Admin layout (`layout.tsx`), dashboard (`page.tsx`), clients CRUD (`clients/page.tsx`), products CRUD (`products/page.tsx`), and shared users CRUD (`users/page.tsx`).
- **`components/`**
  - `components/admin/`: `Sidebar.tsx`, `clients/` (`ClientsView`, `ClientsTable`, `ClientModal`, `ClientForm`, `DeleteClientDialog`), and `products/` (`ProductsView`, `ProductsTable`, `ProductModal`, `ProductForm`, `DeleteProductDialog`).
  - `components/facturation/`:
    - **POS & Direct Client Creation/Editing:** `FacturationPosView.tsx` (handles `?editOrderId` loading and client state updates), `PosInterface.tsx` (displays Apple HIG edit-mode banner with warehouse status and cancel action), `ClientSelectorFact.tsx` (includes `+ Nuevo Cliente` trigger and `ClientModal` integration with automatic selection), `PosProductSearchBar.tsx`, `PosOrderItemsList.tsx`, `PosOrderSummaryCard.tsx` (adapts primary action label for edit mode), `PosOrderSuccessModal.tsx` (includes return navigation to `/facturation/invoices`), and `ProductOptionsModal.tsx`.
    - **Seller Invoices & Re-settlement Comparison:** `SellerInvoicesView.tsx`, `SellerInvoicesToolbar.tsx`, `SellerInvoicesList.tsx`, `SellerInvoicesCityGroup.tsx`, `SellerInvoiceCard.tsx` (includes `"Editar / Añadir"` action for non-dispatched orders), `InvoiceComparisonDetail.tsx`, `InvoiceComparisonHeader.tsx` (includes `"Editar / Añadir"`, print, and dispatch approval actions), `InvoiceClientInfoSection.tsx`, `InvoiceComparisonTable.tsx`, `InvoiceComparisonItemCard.tsx`, `InvoiceItemChangeBadge.tsx`, and `InvoiceTotalsComparisonCard.tsx`.
    - **80mm Thermal Receipt Printing:** `PosReceiptPrint.tsx`, `PosReceiptTicket.tsx`.
- **`hooks/`**
  - `usePosCart.ts` (cart state management and `loadOrderForEdit(order, availableClients)`), `usePosCheckout.ts` (handles `createOrder` and `updateOrderFromFacturation` when `editingOrder` is active), `useInvoiceApproval.ts`.
- **`services/`, `schemas/`, `constants/`, `types/`, `utils/`**
  - `services/`: `clients.service.ts`, `products.service.ts`.
  - `schemas/`: `client.schema.ts`, `product.schema.ts`.
  - `constants/`: `categories.ts`, `cities.ts`, `clients.ts`, `invoice-comparison.ts`, `navigation.ts`, `pos-receipt.ts`, `seller-invoices.ts`, `units.ts`.
  - `types/`: `client.ts`, `product.ts`, `invoice-comparison.ts`.
  - `utils/`: `audit-format.ts`, `client.ts`, `facturation.ts`, `pos-receipt.ts`, `pricing.ts`, `product.ts`, `reliquidation.ts`.

---

## 4. CURRENT `rutea-fulfillment` INVENTORY & ORGANIZATION

Next.js application (`rutea-fulfillment/src/`) dedicated to real-time warehouse picking, post-creation addition tracking, picking history, and warehouse administration. It must strictly preserve this layered organization:

- **`app/` (Routes & Protected Layouts)**
  - `app/page.tsx`: Login view consuming `@rutea/shared` `LoginForm` for `'admin'` and `'picker'` roles.
  - `app/picking/`: Protected header layout (`layout.tsx`) and Master-Detail real-time picking workspace (`page.tsx`).
  - `app/admin/`: Admin layout (`layout.tsx`), warehouse overview (`page.tsx`), and shared users management (`users/page.tsx`).
- **`components/`**
  - `components/admin/`: `Sidebar.tsx`.
  - `components/picking/`:
    - `PickingWorkspace.tsx`: Master-Detail container synchronizing active and historical orders.
    - `InvoiceQueueList.tsx` & `InvoiceQueueCard.tsx`: FIFO population-grouped queue with 5 filter tabs (`Hoy`, `Por Alistar`, `Con Añadidos` with `countModifiedOrders` alert badge, `Con Pendientes`, and `Historial Alistadas`), displaying status badges (`"Añadido / Editado"`, `"Alistada"`, `"En Despacho"`).
    - `InvoicePickingDetail.tsx` & `PickingOrderHeaderCard.tsx`: Displays client metadata, seller edit audit banner (`lastSellerEdit.summary` + timestamp), general observation checkbox, `"Finalizar Alistamiento"` action for active orders, read-only inspection mode for completed orders (`'ALISTADO'` / `'LISTO_PARA_REPARTO'`), and `"Retomar / Corregir Alistamiento"` button (`handleReopenOrder`) for `'ALISTADO'` orders.
    - `PickingItemRow.tsx`, `PickingItemStatusActions.tsx`, `PickingItemNoteBox.tsx`: Per-item picking controls with decimal/unit adjustments, `"NUEVO AÑADIDO"` and `"Antes: X → Ahora: Y"` quantity change badges, 3 status actions (`ALISTADO`, `PENDIENTE_LLEGADA`, `AGOTADO`), warehouse note input, and audit micro-logs.
- **`hooks/`, `constants/`, `utils/`**
  - `hooks/useOrderPickingActions.ts`: Async handlers for item picking updates, general observation check, order completion, and order reopening (`handleReopenOrder`, `isReopening`).
  - `constants/`: `navigation.ts`, `picking.ts` (`QueueFilter`, `QUEUE_FILTER_OPTIONS`).
  - `utils/fulfillment.ts`: Pure functions for population grouping, progress calculation, queue filtering (`filterFulfillmentOrders`, `filterModifiedFulfillmentOrders`, `filterHistoryFulfillmentOrders`), and state helpers (`countModifiedOrders`, `hasOrderPostPickingAdditions`, `isOrderCompletedByFulfillment`).

---

## 5. CURRENT `rutea-delivery` INVENTORY & ORGANIZATION

Next.js application (`rutea-delivery/src/`) dedicated to last-mile delivery routes by population, delivery confirmation, collections, cash reconciliation, and logistics administration. It must strictly preserve this layered organization:

- **End-to-End Session Flow (Admin Dispatch -> Crew Workspace):**
  - **Session Creation (`/admin/dispatch`):** The administrator selects one or more populations with `'LISTO_PARA_REPARTO'` invoices, inspects warehouse reliquidation in read-only mode (`ReadOnlyInvoiceDetailModal`), and assigns a delivery crew (`assignedCrew`) via `CreateRouteSessionModal`. `createDeliverySession` writes a `delivery_sessions` document (`RUTA-YYYYMMDD-XX`) and batch-updates every included order with `deliverySessionId`, `deliverySessionCode`, and `estado: 'EN_RUTA'`.
  - **Crew Reception (`/delivery`):** When any assigned crew member logs into `/delivery`, `useDeliveryWorkspace` subscribes reactively to their active session via `subscribeToUserDeliverySession(uid)`, automatically promotes `'ASIGNADA'` sessions to `'EN_CURSO'` (`updateDeliverySessionStatus`), and subscribes to the session's exclusive orders (`subscribeToSessionOrders`). All crewmates simultaneously see the same route header, companion avatars (`DeliverySessionHeader`), route progress, and population-grouped touch cards (`AssignedRouteInvoicesList`).
- **`app/` (Routes & Protected Layouts)**
  - `app/page.tsx`: Login view consuming `@rutea/shared` `LoginForm` for `'admin'` and `'delivery'` roles (`'admin' -> '/admin'`, `'delivery' -> '/delivery'`).
  - `app/delivery/`: Protected header layout (`layout.tsx`) verifying `'admin'` or `'delivery'` roles, and reactive crew delivery workspace (`page.tsx`).
  - `app/admin/`: Admin layout (`layout.tsx`), delivery operations overview dashboard (`page.tsx`), dispatch & route assignment workspace (`dispatch/page.tsx` rendering `DispatchDashboard`), routes shortcut redirect (`routes/page.tsx`), and shared users management (`users/page.tsx`) consuming `UsersView` directly from `@rutea/shared`.
- **`components/`**
  - `components/admin/`: `Sidebar.tsx` (collapsible sidebar consuming `Tooltip` and `logout` from `@rutea/shared`), and `dispatch/` (`DispatchDashboard.tsx`, `DispatchCityGroupCard.tsx`, `DispatchStickyBottomBar.tsx`, `ActiveSessionsPanel.tsx`, `ReadOnlyInvoiceDetailModal.tsx`, `ReadOnlyInvoiceItemsList.tsx`, `CreateRouteSessionModal.tsx`).
  - `components/delivery/`: `DeliverySessionHeader.tsx` (Apple HIG empty state when unassigned, or route header with `EN_CURSO` badge, shared crew avatars/companions summary, and delivery/collection progress), and `AssignedRouteInvoicesList.tsx` (population filter pills and population-grouped touch invoice cards prepared for payment collection, delivery confirmation, and read-only item inspection).
- **`hooks/`, `constants/`, `types/`, `utils/`**
  - `hooks/`: `useDispatchDashboard.ts`, `useCreateRouteSession.ts`, `useDeliveryWorkspace.ts`.
  - `constants/`: `navigation.ts` (`ADMIN_NAV_GROUPS`), `dispatch.ts` (`DISPATCH_TAB_OPTIONS`, `SESSION_STATUS_META`, `ITEM_PICKING_STATUS_META`), `delivery.ts` (`ALL_ROUTE_CITIES_FILTER`, `DELIVERY_PAYMENT_METHODS`, `ROUTE_ORDER_STATUS_META`).
  - `types/`: `dispatch.ts` (`DispatchTabMode`, `CityDispatchGroup`, `DispatchSelectionSummary`, `ReadOnlyItemComparisonRow`, `ReadOnlyOrderAuditView`), `delivery.ts` (`DeliveryPaymentMethod`, `DeliveryCrewDisplayMember`, `DeliveryRouteProgress`, `AssignedCityInvoiceGroup`).
  - `utils/`: `dispatch.ts` (`groupReadyOrdersByCity`, `calculateDispatchSelectionSummary`, `buildReadOnlyOrderAuditView`, `resolveOrderExpectedAmount`, `buildSuggestedRouteName`), `delivery.ts` (`getCrewMemberInitials`, `buildCrewDisplayList`, `formatCompanionsSummary`, `calculateDeliveryRouteProgress`, `groupSessionOrdersByCity`).