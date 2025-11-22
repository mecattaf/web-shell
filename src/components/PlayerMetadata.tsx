import { useState, useEffect } from "react";
import { useBridge } from "../contexts/BridgeContext";

export const PlayerMetadata = () => {
  const bridge = useBridge();
  const [playerTitle, setPlayerTitle] = useState("Homanland");
  const [playerArtist, setPlayerArtist] = useState("Homan");

  const fetchMetadata = async () => {
    try {
      const titleResult = await bridge.call('playerGetTitle');
      const artistResult = await bridge.call('playerGetArtist');

      if (titleResult?.success && titleResult?.data) {
        setPlayerTitle(titleResult.data);
      }
      if (artistResult?.success && artistResult?.data) {
        setPlayerArtist(artistResult.data);
      }
    } catch (err) {
      console.error('Failed to fetch player metadata:', err);
    }
  };

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
    <div className="player-metadata flex flex-col justify-center items-start">
      <div className="player-title text-[16px] -my-1  text-ellipsis max-w-32 text-nowrap overflow-hidden">
        {playerTitle}
      </div>
      <div className="player-artist text-[12px] -my-0.5 text-secondary  text-ellipsis max-w-32 text-nowrap overflow-hidden">
        {playerArtist}
      </div>
    </div>
  );
};
