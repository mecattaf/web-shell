import { LucideKeyboard } from "lucide-react";
import { useState, useEffect } from "react";
import { useBridge } from "../contexts/BridgeContext";

export function Workspaces() {
  const bridge = useBridge();
  const [activeWorkspace, setActiveWorkspace] = useState(0);
  const [workspaces, setWorkspaces] = useState<number[]>([]);

  async function fetchWorkspaces() {
    try {
      const workspacesResult = await bridge.call('hyprlandSendCommand', 'j/workspaces');
      const activeResult = await bridge.call('hyprlandSendCommand', 'j/activeworkspace');

      if (workspacesResult?.success && workspacesResult?.data) {
        const wsIds = workspacesResult.data.map((ws: any) => ws.id).sort((a: number, b: number) => a - b);
        setWorkspaces(wsIds);
      }

      if (activeResult?.success && activeResult?.data) {
        setActiveWorkspace(activeResult.data.id);
      }
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
    }
  }

  async function switchWorkspace(id: number) {
    try {
      await bridge.call('hyprlandSendCommand', `dispatch workspace ${id}`);
    } catch (err) {
      console.error('Failed to switch workspace:', err);
    }
  }

  async function scrollWorkspace(direction: 'next' | 'prev') {
    try {
      await bridge.call('hyprlandSendCommand', `dispatch workspace ${direction === 'next' ? '+1' : '-1'}`);
    } catch (err) {
      console.error('Failed to scroll workspace:', err);
    }
  }

  useEffect(() => {
    fetchWorkspaces();

    const handleActiveWorkspace = (eventData: any) => {
      if (eventData?.workspaceId !== undefined) {
        setActiveWorkspace(eventData.workspaceId);
      }
    };

    const handleCreateWorkspace = (eventData: any) => {
      if (eventData?.workspaceId !== undefined) {
        setWorkspaces((prev) =>
          [...new Set([...prev, eventData.workspaceId])].sort((a, b) => a - b),
        );
      }
    };

    const handleDestroyWorkspace = (eventData: any) => {
      if (eventData?.workspaceId !== undefined) {
        setWorkspaces((prev) => prev.filter((id) => id !== eventData.workspaceId));
      }
    };

    bridge.on('hyprlandActiveWorkspace', handleActiveWorkspace);
    bridge.on('hyprlandCreateWorkspace', handleCreateWorkspace);
    bridge.on('hyprlandDestroyWorkspace', handleDestroyWorkspace);

    return () => {
      bridge.off('hyprlandActiveWorkspace', handleActiveWorkspace);
      bridge.off('hyprlandCreateWorkspace', handleCreateWorkspace);
      bridge.off('hyprlandDestroyWorkspace', handleDestroyWorkspace);
    };
  }, []);

  return (
    <div
      onWheel={(e) => {
        if (e.deltaY > 0) {
          scrollWorkspace('next');
        } else if (e.deltaY < 0) {
          scrollWorkspace('prev');
        }
      }}
      className="workspaces flex flex-row"
    >
      {workspaces.map((workspaceId) => (
        <div
          key={workspaceId}
          className={`workspace-item text-center rounded-[2px] border-solid border border-primary transition-all m-[0.1rem] w-7 cursor-pointer ${
            workspaceId === activeWorkspace ? "bg-primary text-background" : ""
          }`}
          onClick={() => switchWorkspace(workspaceId)}
        >
          {workspaceId}
        </div>
      ))}
    </div>
  );
}

export const Language: React.FC<{
  keyboard: string;
  formatter: (language: string) => string;
}> = ({ keyboard = ".*", formatter = (lang) => lang }) => {
  const bridge = useBridge();
  const [language, setLanguage] = useState<React.ReactNode>(formatter(""));

  useEffect(() => {
    const re = new RegExp(keyboard);

    async function fetchDevices() {
      try {
        const result = await bridge.call('hyprlandSendCommand', 'j/devices');
        if (result?.success && result?.data?.keyboards) {
          const matchingKeyboard = result.data.keyboards.find((kb: any) => re.test(kb.name));
          if (matchingKeyboard?.active_keymap) {
            setLanguage(formatter(matchingKeyboard.active_keymap));
          }
        }
      } catch (err) {
        console.error('Failed to fetch devices:', err);
      }
    }

    const handleActiveLayout = (eventData: any) => {
      if (
        !(
          typeof eventData?.keyboard === "string" &&
          typeof eventData?.language === "string" &&
          re.test(eventData.keyboard)
        )
      )
        return;
      setLanguage(formatter(eventData.language));
    };

    bridge.on('hyprlandActiveLayout', handleActiveLayout);
    fetchDevices();

    return () => {
      bridge.off('hyprlandActiveLayout', handleActiveLayout);
    };
  }, []);

  return (
    <>
      <LucideKeyboard className="stroke-primary stroke-2" size={22} />
      <span className="font-mono">{language}</span>
    </>
  );
};
