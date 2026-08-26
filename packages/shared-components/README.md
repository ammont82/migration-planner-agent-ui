# @openshift-migration-advisor/shared-components

Shared React UI components for Migration Advisor applications (agent UI and cloud assessment UI).

Includes:

- PatternFly form field wrappers (`react-hook-form`)
- Guest OS support-tier helpers and badges
- Operating Systems distribution card
- Report chart primitives (`MigrationDonutChart`) via the `/charts` subpath

## Installation

```bash
# Yarn workspace (migration-planner-ui)
yarn workspace @openshift-migration-advisor/agent-ui add @openshift-migration-advisor/shared-components@workspace:*

# npm (migration-planner-ui-app)
npm install @openshift-migration-advisor/shared-components
```

## Usage

Forms and OS report widgets (no PatternFly Charts):

```tsx
import {
  OSDistribution,
  SupportTierBadge,
  TextInputFormGroup,
} from "@openshift-migration-advisor/shared-components";
```

Donut charts import Victory from `@patternfly/react-charts/victory`. That lives in this package’s `MigrationDonutChart` — consumers must provide `@patternfly/react-charts` **v8+** (optional peer) and import the charts entry:

```tsx
import {
  MigrationDonutChart,
  type MigrationDonutChartProps,
} from "@openshift-migration-advisor/shared-components/charts";
```

Do not import charts from the main entry: that would force every consumer (including ui-app on Charts v7) to resolve Victory.

Components are SDK-agnostic: pass already-shaped props (for example `OSDistributionEntry` maps). Map `agent-sdk` / `planner-sdk` models at the app boundary.

## Development

```bash
yarn workspace @openshift-migration-advisor/shared-components build
yarn workspace @openshift-migration-advisor/shared-components typecheck
yarn workspace @openshift-migration-advisor/shared-components test
yarn workspace @openshift-migration-advisor/shared-components check
```

## Publishing

The package is published to npm under `@openshift-migration-advisor/shared-components` via GitHub Actions, using the same OIDC Trusted Publishing flow as `@openshift-migration-advisor/ioc`.

**Workflow:** [`.github/workflows/release-shared-components.yaml`](../../.github/workflows/release-shared-components.yaml)

| Trigger | Result |
|---|---|
| Push to `main` / `stable` changing `packages/shared-components/**` | Prerelease: `{latestTag}-{12-char-sha}` |
| Tag `vX.Y.Z` | Release: `X.Y.Z` |

### One-time npm setup (required before first publish)

On [npmjs.com](https://www.npmjs.com/) for the `@openshift-migration-advisor` org, create the package (or claim the name) and configure a **Trusted Publisher**:

- **Repository:** `kubev2v/migration-planner-agent-ui` (or the current GitHub repo name)
- **Workflow:** `release-shared-components.yaml`
- **Environment:** leave empty unless you use GitHub Environments

No npm token is stored in the repo; publish uses OIDC (`id-token: write`).

## License

[Apache 2.0](LICENSE)