const DEFAULT_DM_KEY = "party-tracker-dm";

export function getConfiguredDmKey(): string {
  return process.env["PARTY_TRACKER_DM_KEY"] || DEFAULT_DM_KEY;
}

export function isAuthorizedDm(dmKey: string | undefined): boolean {
  if (!dmKey) return false;
  return dmKey === getConfiguredDmKey();
}

