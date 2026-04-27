// lib/deviceInfo.ts
export interface DeviceHints {
  ua:       string;
  platform: string | null;   // 'Windows', 'macOS', 'Linux', 'Android', 'iOS'
  model:    string | null;   // 'Dell XPS 15', 'iPhone' — Chromium only
  mobile:   boolean | null;
}

export async function collectDeviceHints(): Promise<DeviceHints> {
  const ua = navigator.userAgent;

  // navigator.userAgentData is Chromium-only
  const uad = (navigator as any).userAgentData;
  if (!uad) {
    return { ua, platform: null, model: null, mobile: null };
  }

  try {
    const high = await uad.getHighEntropyValues(['model', 'platform']);
    return {
      ua,
      platform: high.platform  || null,
      model:    high.model     || null,   // often blank on desktop
      mobile:   uad.mobile     ?? null,
    };
  } catch {
    return { ua, platform: uad.platform || null, model: null, mobile: uad.mobile ?? null };
  }
}