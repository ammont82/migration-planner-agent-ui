# Report export menu architecture

The export dropdown on the virtual machines overview is built from two layers: a **presentation** package (`@openshift-migration-advisor/shared-components`) and **composition** in each app (`agent-ui`, `ui-app`, etc.).

## Option C: consumer composes options

Shared components render a menu from data the app supplies. Shared code does **not** decide:

- which export formats exist (CSV, JSON ZIP, PDF, …),
- section titles or product copy.

Those choices live in the app that embeds the menu.

### Presentation (shared)

- **`ReportExportMenu`** — PatternFly dropdown, grouped sections, dividers, loading state on the toggle.
- **`ReportExportOption`** — one row: `key`, `label`, optional `description`, `onSelect`, optional `section` (`{ id, label }`).
- **`standardReportExportOptions`** (optional) — convenience helper for chart assessment formats (PDF, HTML, PNG). Apps may use it or build equivalent rows themselves.

Grouping: consecutive options with the same `section.id` are rendered under one `DropdownGroup` titled with `section.label`. A divider is inserted between groups.

### Composition (agent-ui)

- **`buildOverviewExportOptions`** (`apps/agent-ui/.../reportExportOptions.ts`) — builds the full option list for the overview header: inventory block, then assessment formats from chart export handlers.
- **`OverviewReportHeader`** — wires `useChartExport()` and inventory callbacks, then passes the resulting array to `ReportExportMenu`.

### Composition (ui-app, separate repository)

The SaaS console app composes its own option list (typically assessment formats only) and uses the same `ReportExportMenu` from shared-components. It does not ship from this repo, so agent-ui does not need a hosting env var—inventory export is always part of the appliance overview when `showExport` is true.

### Data flow (agent-ui overview)

```text
VirtualMachinesOverviewPage
  → inventory handlers (modal, JSON ZIP download)
OverviewReportHeader
  → useChartExport() for PDF / HTML / PNG
  → buildOverviewExportOptions(...)
ReportExportMenu (shared)
  → renders grouped dropdown
```

### Adding a new export format

1. Implement the handler in the app (API call, modal, chart export, etc.).
2. Append a `ReportExportOption` in the app’s builder (or inline before calling `ReportExportMenu`).
3. Change shared only if the **menu UI** itself needs new behavior (not for new product actions).

### Alternatives we did not use

| Approach | Why not |
|----------|---------|
| Growing callback API on shared (`onExportCsv`, …) | Shared becomes a catalog of every product export. |
| Capability flags on shared (`inventory: true`) | Duplicates “omit handler ⇒ hide row” and couples hosting rules to the package. |
| `enableInventoryExports` in a shared builder | Product/hosting rules belong in the app, not the design system. |

### Related files

| Location | Role |
|----------|------|
| `packages/shared-components/src/report/ReportExportMenu.tsx` | Menu UI |
| `packages/shared-components/src/report/reportExportOptions.ts` | Types + optional `standardReportExportOptions` |
| `apps/agent-ui/.../reportExportOptions.ts` | Overview menu composition |
| `apps/agent-ui/.../ReportPageHeader.tsx` | Header wiring |
