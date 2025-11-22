interface NotificationData {
  id: number;
  "replaces-id": number;
  "app-name": string;
  "app-icon": string;
  summary: string;
  body: string;
  timeout: number;
  urgency: number;
  actions: [string, string][];
  "image-file": string | null;
  "image-pixmap":
    | [number, number, number, boolean, number, number, string]
    | null;
}

interface PywalColorScheme {
  wallpaper: string;
  alpha: string;
  special: {
    background: string;
    foreground: string;
    cursor: string;
  };
  colors: {
    color0: string;
    color1: string;
    color2: string;
    color3: string;
    color4: string;
    color5: string;
    color6: string;
    color7: string;
    color8: string;
    color9: string;
    color10: string;
    color11: string;
    color12: string;
    color13: string;
    color14: string;
    color15: string;
  };
}

interface Window {
  addEventListener(eventName: string, callback: any);
  removeEventListener(eventName: string, callback: any);
}
