import { useEffect, useState } from "react";
import { useBridge } from "../contexts/BridgeContext";

export const PlayerProgress = () => {
  const bridge = useBridge();
  const [playerProgress, setPlayerProgress] = useState(1.0);
  const [playerLength, setPlayerLength] = useState(1.0);

  async function fetchProgress() {
    try {
      const metadataResult = await bridge.call('playerGetMetadata');
      const positionResult = await bridge.call('playerGetPosition');

      if (metadataResult?.success && metadataResult?.data?.length) {
        setPlayerLength(metadataResult.data.length);
      }
      if (positionResult?.success && positionResult?.data !== undefined) {
        setPlayerProgress(positionResult.data);
      }
    } catch (err) {
      console.error('Failed to fetch player progress:', err);
    }
  }

  useEffect(() => {
    fetchProgress();
    const id = setInterval(fetchProgress, 1000);
    return () => clearInterval(id);
  }, []);

  const fillColor = "var(--color-secondary)";
  const bgColor = "transparent";

  const gradientStyle = {
    background: `linear-gradient(to right, ${fillColor} ${
      (playerProgress / playerLength) * 100
    }%, ${bgColor} ${(playerProgress / playerLength) * 100}%)`,
  };

  return (
    <div
      className="absolute top-0 left-0 right-0 bottom-0 z-0 opacity-30"
      style={gradientStyle}
    ></div>
  );
};
