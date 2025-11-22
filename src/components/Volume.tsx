import { LucideVolume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useBridge } from "../contexts/BridgeContext";

export function Volume() {
  const bridge = useBridge();
  const [audioVolume, setAudioVolume] = useState(0.0);

  async function fetchVolume() {
    try {
      const result = await bridge.call('audioGetVolume');
      if (result?.success && result?.data !== undefined) {
        setAudioVolume(Math.round(result.data));
      }
    } catch (err) {
      console.error('Failed to fetch audio volume:', err);
    }
  }

  async function setVolume(volume: number) {
    try {
      await bridge.call('audioSetVolume', volume);
    } catch (err) {
      console.error('Failed to set audio volume:', err);
    }
  }

  useEffect(() => {
    // Listen for volume change events from bridge
    const handleVolumeChanged = (eventData: any) => {
      if (eventData?.volume !== undefined) {
        setAudioVolume(Math.round(eventData.volume));
      }
    };

    bridge.on('audioVolumeChanged', handleVolumeChanged);

    // Fetch initial volume
    fetchVolume();

    return () => {
      bridge.off('audioVolumeChanged', handleVolumeChanged);
    };
  }, []);

  return (
    <div
      className="flex flex-row gap-1.5"
      onWheel={(e) => {
        if (e.deltaY > 0) {
          setVolume(audioVolume - 5);
        } else if (e.deltaY < 0) {
          setVolume(audioVolume + 5);
        }
      }}
    >
      <LucideVolume2 className="stroke-primary stroke-2" size={22} />
      <span className="font-mono">{audioVolume}</span>
    </div>
  );
}
