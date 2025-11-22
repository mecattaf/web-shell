import { useEffect, useState } from "react";
import { roundAndPad, Separator } from "./Common";
import { LucideCpu, LucideMemoryStick } from "lucide-react";
import { useBridge } from "../contexts/BridgeContext";

export function SystemStats() {
  const bridge = useBridge();
  const [stats, setStats] = useState({ ram: 0.0, cpu: 0.0 });

  async function fetchStats() {
    try {
      const result = await bridge.call('fetchSystemStats');
      if (result?.success && result?.data) {
        setStats({
          ram: result.data.ram || 0.0,
          cpu: result.data.cpu || 0.0
        });
      }
    } catch (err) {
      console.error('Failed to fetch system stats:', err);
    }
  }

  useEffect(() => {
    const id = setInterval(fetchStats, 1000);
    fetchStats();
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <LucideMemoryStick className="stroke-primary stroke-2" size={22} />
      <span className="font-mono">{roundAndPad(stats.ram)}</span>
      <Separator />
      <LucideCpu className="stroke-primary stroke-2" size={22} />
      <span className="font-mono">{roundAndPad(stats.cpu)}</span>
    </>
  );
}
