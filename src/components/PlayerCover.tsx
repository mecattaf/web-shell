import { useState, useEffect } from "react";
import { useBridge } from "../contexts/BridgeContext";

export const PlayerCover = () => {
  const bridge = useBridge();
  const [playerCoverUrl, setPlayerCoverUrl] = useState("");

  async function fetchMetadata() {
    try {
      const result = await bridge.call('playerGetMetadata');
      if (result?.success && result?.data?.artUrl) {
        setPlayerCoverUrl(result.data.artUrl);
      }
    } catch (err) {
      console.error('Failed to fetch player cover:', err);
    }
  }

  useEffect(() => {
    const handleMetadataChanged = () => {
      fetchMetadata();
    };

    bridge.on('playerMetadataChanged', handleMetadataChanged);
    fetchMetadata();

    return () => {
      bridge.off('playerMetadataChanged', handleMetadataChanged);
    };
  }, []);

  return (
    <img
      className="player-cover w-8 bg-no-repeat bg-cover"
      src={playerCoverUrl}
    ></img>
  );
};
