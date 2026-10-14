/**
 * Agent UI is hosted on the migration appliance by default. When embedded in
 * console.redhat.com (SaaS), set `VITE_UI_HOSTING=saas` at build time to hide
 * appliance-only actions such as inventory export.
 */
export function isApplianceUi(): boolean {
  return import.meta.env.VITE_UI_HOSTING !== "saas";
}
