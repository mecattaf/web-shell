import { LucideSkipBack, LucideSkipForward } from "lucide-react";
import { useBridge } from "../contexts/BridgeContext";

const PlayerNextButton = () => {
  const bridge = useBridge();

  const handleNext = async () => {
    try {
      await bridge.call('playerNext');
    } catch (err) {
      console.error('Failed to skip to next track:', err);
    }
  };

  return (
    <div
      className="p-1 active:scale-95 transition-all rounded-[2px] cursor-pointer"
      onClick={handleNext}
    >
      <LucideSkipForward size={18} />
    </div>
  );
};

const PlayerPreviousButton = () => {
  const bridge = useBridge();

  const handlePrevious = async () => {
    try {
      await bridge.call('playerPrevious');
    } catch (err) {
      console.error('Failed to skip to previous track:', err);
    }
  };

  return (
    <div
      className="p-1 active:scale-95 transition-all rounded-[2px] cursor-pointer"
      onClick={handlePrevious}
    >
      <LucideSkipBack size={18} />
    </div>
  );
};

export { PlayerNextButton, PlayerPreviousButton };
