# RUTEA FULFILLMENT — SUB-APP AGENT DIRECTIVE

> **MANDATORY:** Before modifying or creating any file in this sub-application, you **MUST** read [`../AGENTS.md`](../AGENTS.md) and [`../MEMORY.md`](../MEMORY.md) at the monorepo root, and apply the skills located in [`../.agents/skills/`](../.agents/skills/).

## Scope & Handled Routes

This Next.js App Router application serves **Warehouse Staff & Pickers** and exclusively manages the following route groups:

- **`/picking`**: Touch-friendly real-time order picking workspace grouped by population and FIFO arrival order.
- **`/admin`**: Warehouse operations and user management dashboard.
