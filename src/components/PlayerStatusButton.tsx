import styled from "styled-components";
import { useState, useEffect } from "react";
import { LucidePause, LucidePlay } from "lucide-react";
import { useBridge } from "../contexts/BridgeContext";

const PlayerStatusButton = () => {
  const bridge = useBridge();
  const [isChecked, setIsChecked] = useState(true);

  async function fetchPlayerStatus() {
    try {
      const result = await bridge.call('playerGetStatus');
      if (result?.success && result?.data !== undefined) {
        setIsChecked(result.data === 'playing');
      }
    } catch (err) {
      console.error('Failed to fetch player status:', err);
    }
  }

  async function handlePlayPause() {
    try {
      await bridge.call('playerPlayPause');
    } catch (err) {
      console.error('Failed to toggle play/pause:', err);
    }
  }

  useEffect(() => {
    const handlePlay = () => setIsChecked(true);
    const handlePause = () => setIsChecked(false);

    bridge.on('playerPlay', handlePlay);
    bridge.on('playerPause', handlePause);

    // Fetch initial state
    fetchPlayerStatus();

    return () => {
      bridge.off('playerPlay', handlePlay);
      bridge.off('playerPause', handlePause);
    };
  }, []);

  return (
    <StyledWrapper>
      <label className="container bg-primary p-1 active:scale-95 transition-all rounded-[2px] flex justify-center items-center cursor-pointer select-none">
        <input
          type="checkbox"
          className="absolute cursor-pointer opacity-0 w-0 h-0"
          checked={isChecked}
          onChange={handlePlayPause}
        />
        <LucidePlay className="play" size={18} />
        <LucidePause className="pause" size={18} />
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .container .play {
    animation: keyframes-fill 0.3s;
  }

  .container .pause {
    display: none;
    animation: keyframes-fill 0.3s;
  }

  .container input:checked ~ .play {
    display: none;
  }

  .container input:checked ~ .pause {
    display: block;
  }

  @keyframes keyframes-fill {
    0% {
      transform: scale(0);
      opacity: 0;
    }

    50% {
      transform: scale(1.1);
    }
  }
`;

export default PlayerStatusButton;
