const STORAGE_KEY = "pocketdiet_pushClientId_v1";

export function getOrCreatePushClientId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id || id.length < 8) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `pd-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return `pd-${Date.now()}`;
  }
}
