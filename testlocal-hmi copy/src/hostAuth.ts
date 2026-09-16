/** Host auth: same-origin getter first, postMessage only for localhost:5175. */

export const HMI_AUTH_TYPE = "nv-auth";
export const HMI_AUTH_REQUEST_TYPE = "nv-hmi-auth-request";

export const HOST_ORIGINS = [
  "http://localhost:4200",
  "http://127.0.0.1:4200",
] as const;

export type HostAuthMessage = {
  type: typeof HMI_AUTH_TYPE;
  token: string;
  orgId?: string;
};

export type HmiHostAuthApi = {
  getAccessToken: () => Promise<string>;
  getOrgId: () => string;
};

declare global {
  interface Window {
    __neuraverse_hmi_auth__?: HmiHostAuthApi;
  }
}

export function isEmbeddedInHost(): boolean {
  return typeof window !== "undefined" && window.parent !== window;
}

export function isAllowedHostOrigin(origin: string): boolean {
  return (HOST_ORIGINS as readonly string[]).includes(origin);
}

export function parseHostAuth(data: unknown): HostAuthMessage | null {
  if (typeof data !== "object" || data === null) return null;
  const message = data as Record<string, unknown>;
  if (message.type !== HMI_AUTH_TYPE) return null;
  if (typeof message.token !== "string" || !message.token.trim()) return null;
  return {
    type: HMI_AUTH_TYPE,
    token: message.token,
    orgId: typeof message.orgId === "string" ? message.orgId : "",
  };
}

export function requestHostAuth(): void {
  if (!isEmbeddedInHost()) return;
  for (const origin of HOST_ORIGINS) {
    window.parent.postMessage({ type: HMI_AUTH_REQUEST_TYPE }, origin);
  }
}

function isAuthApi(value: unknown): value is HmiHostAuthApi {
  if (typeof value !== "object" || value === null) return false;
  const api = value as HmiHostAuthApi;
  return typeof api.getAccessToken === "function" && typeof api.getOrgId === "function";
}

/** Same-origin host page or parent iframe. Cross-origin parent access throws. */
export function getSameOriginHostAuth(): HmiHostAuthApi | null {
  if (typeof window === "undefined") return null;
  if (isAuthApi(window.__neuraverse_hmi_auth__)) return window.__neuraverse_hmi_auth__;
  if (!isEmbeddedInHost()) return null;
  try {
    const parentAuth = window.parent.__neuraverse_hmi_auth__;
    return isAuthApi(parentAuth) ? parentAuth : null;
  } catch {
    return null;
  }
}
