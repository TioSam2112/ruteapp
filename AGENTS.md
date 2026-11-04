# RUTEA MONOREPO — AGENT CONSTITUTION & ARCHITECTURE GUIDE

You are a Principal Software Engineer working on the **Rutea** production monorepo (B2B Platform for Presales, Warehouse Picking, and Logistics Delivery). Before modifying or creating any file, you **MUST** read this document, review `/MEMORY.md`, and apply the skills located in `/.agents/skills/`.

---

## 1. MONOREPO TOPOLOGY

The workspace is managed with `pnpm` from the root directory and shares a single Firebase database (`ruteapp-48f10`):

- `/shared` (`@rutea/shared`): Shared core (single Firebase SDK instance, authentication, global types, shared schemas, order/user services, and cross-cutting UI primitives).
- `/rutea-facturation`: Next.js App Router application for Sales Representatives/Invoicing Clerks (presales POS terminal `/facturation`, invoice re-settlement and 80mm thermal printing `/facturation/invoices`, and `/admin` catalog/customer dashboard).
- `/rutea-fulfillment`: Next.js App Router application for Warehouse Staff/Pickers (touch-friendly workspace `/picking` grouped by population and FIFO arrival order, and warehouse `/admin` dashboard).
- `/rutea-delivery`: (Upcoming module) Next.js application for Delivery Personnel (routes by population, delivery confirmation, collections, and cash reconciliation).

---

## 2. STRICT ARCHITECTURE AND DECOUPLING RULES

**Creating monolithic components ("God Components") is STRICTLY FORBIDDEN.** All code must be strictly divided into the following layers:

1. **`src/types/` (or `shared/types/`)**: TypeScript interfaces and types only. The use of `any` or `unknown` without type guards is prohibited.
2. **`src/schemas/`**: Validation schemas using `zod` and their inferred types (`z.infer`). Never define Zod schemas inside a `.tsx` file.
3. **`src/constants/`**: Static lists, label dictionaries, navigation configurations, and fixed catalogs. Declaring static configuration arrays inside components is prohibited.
4. **`src/utils/`**: Pure, synchronous, deterministic functions (monetary calculations, grouping by city, formatters, filters). No side effects or Firebase calls.
5. **`src/services/`**: The only layer authorized to communicate with Firebase Auth and Firestore (`getDocs`, `onSnapshot`, `updateDoc`, etc.). No UI component or hook may import `firebase/firestore` directly.
6. **`src/hooks/`**: Custom Hooks to encapsulate complex state logic, real-time subscriptions (`useEffect` + `onSnapshot`), or extensive form controllers.
7. **`src/components/`**: Purely declarative components focused on UI/UX.
   - **File size limit:** No `.tsx` file may exceed **180–200 lines**. If a component grows beyond this limit, extract atomic subcomponents or move its state into a Custom Hook under `src/hooks/`.

---

## 3. UI/UX STANDARDS (APPLE HIG & MOBILE-FIRST)

- **Aesthetics:** Strictly inspired by the **Apple Human Interface Guidelines (iCloud / iPadOS / macOS)**. Clean, minimalist interface, thin borders (`border-border/40`), translucent surfaces (`backdrop-blur-md`), and clear typography.
- **System Variables:** Use exclusively Tailwind CSS semantic classes connected to `globals.css` (`bg-background`, `bg-card`, `bg-sidebar`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-primary`). Hardcoded hexadecimal colors are prohibited whenever a semantic variable is available.
- **Mobile-First & Touch Targets:** Design starting with mobile screens (`< md` using card-based views), scaling up to tablets and desktops (`>= md` / `>= lg` using tables or Master-Detail layouts). Every functional interactive button must have a minimum touch target of `44x44px`.

---

## 4. SKILLS USAGE AND MEMORY PROTOCOL

1. **Skills (`.agents/skills/`):** Always apply the Next.js App Router, strict TypeScript, Tailwind, and Firebase security rules defined in the workspace skills.
2. **Phase-Based Execution:** Strictly limit your work to the scope explicitly requested by the user in the current prompt. Do not modify unrelated modules.
3. **Updating `MEMORY.md`:** Upon completing each phase or refactoring task, update the current status section in `/MEMORY.md` concisely.