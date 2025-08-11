export function getCalOrigin(): string {
  // Try to get from window.Cal if available
  if (typeof window !== "undefined" && window.Cal && window.Cal.__config?.calOrigin) {
    return window.Cal.__config.calOrigin;
  }

  // Fallback to environment variable or default
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_WEBAPP_URL) {
    return process.env.NEXT_PUBLIC_WEBAPP_URL;
  }

  // Default to production URL
  return "https://app.cal.com";
}

export function isCalcomUrl(url: string): boolean {
  const calOrigin = getCalOrigin();

  // Parse the base domain from calOrigin
  try {
    const originUrl = new URL(calOrigin);
    const originHost = originUrl.hostname;
    const originPort = originUrl.port;

    const checkUrl = new URL(url);
    const checkHost = checkUrl.hostname;
    const checkPort = checkUrl.port;

    // Check if ports match (if specified)
    if (originPort && checkPort && originPort !== checkPort) {
      return false;
    }

    // Extract base domain (e.g., "cal.com" from "app.cal.com")
    const baseDomain = originHost.split(".").slice(-2).join(".");

    // Check if it's the exact origin or a subdomain of it
    return checkHost === originHost || checkHost.endsWith(`.${baseDomain}`);
  } catch (e) {
    // Fallback to simple string matching
    return url.includes("cal.com") || url.includes("cal.dev");
  }
}

export function getBaseCalDomain(): string {
  const calOrigin = getCalOrigin();
  try {
    const url = new URL(calOrigin);
    // Extract base domain (e.g., "cal.remote:3000" from "app.cal.remote:3000")
    const parts = url.hostname.split(".");
    if (parts.length >= 2) {
      const baseDomain = parts.slice(-2).join(".");
      return url.port ? `${baseDomain}:${url.port}` : baseDomain;
    }
    return url.host;
  } catch (e) {
    return "cal.com";
  }
}
