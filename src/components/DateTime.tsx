import { useEffect, useState } from "react";
import { LucideMoon, LucideSun } from "lucide-react";
import { useBridge } from "../contexts/BridgeContext";

export function DateTime() {
  const bridge = useBridge();
  const [hours, setHours] = useState("12");
  const [minutes, setMinutes] = useState("00");
  const [amPm, setAmPm] = useState("AM");

  async function fetchTime() {
    try {
      // Try to get time from bridge
      const result = await bridge.call('formatTimeString', '%I %M %p');
      if (result?.success && result?.data) {
        const [h, m, ap] = result.data.split(' ');
        setHours(h);
        setMinutes(m);
        setAmPm(ap);
      } else {
        // Fallback to local time
        const now = new Date();
        const h = now.getHours() % 12 || 12;
        const m = now.getMinutes();
        const ap = now.getHours() >= 12 ? "PM" : "AM";
        setHours(h.toString().padStart(2, "0"));
        setMinutes(m.toString().padStart(2, "0"));
        setAmPm(ap);
      }
    } catch (err) {
      console.error('Failed to fetch time from bridge:', err);
      // Fallback to local time
      const now = new Date();
      const h = now.getHours() % 12 || 12;
      const m = now.getMinutes();
      const ap = now.getHours() >= 12 ? "PM" : "AM";
      setHours(h.toString().padStart(2, "0"));
      setMinutes(m.toString().padStart(2, "0"));
      setAmPm(ap);
    }
  }

  useEffect(() => {
    const id = setInterval(fetchTime, 1000);
    fetchTime();

    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-row items-center bg-background h-full px-3 border-[1px] rounded-[2px] border-primary/40">
      {hours}
      <span className="m-1.5">
        {amPm === "PM" ? (
          <LucideMoon className="stroke-2 stroke-primary" size={20} />
        ) : (
          <LucideSun className="stroke-2 stroke-primary" size={20} />
        )}
      </span>
      {minutes}
    </div>
  );
}
