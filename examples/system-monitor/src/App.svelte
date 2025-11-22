<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import CPUGauge from './components/CPUGauge.svelte';
  import MemoryChart from './components/MemoryChart.svelte';
  import BatteryIndicator from './components/BatteryIndicator.svelte';
  import ClipboardMonitor from './components/ClipboardMonitor.svelte';

  // WebShell SDK types
  declare const webshell: {
    ready: (callback: () => void) => void;
    system: {
      getCPUUsage: () => Promise<number>;
      getMemoryInfo: () => Promise<{ total: number; used: number; available: number }>;
      subscribeToResourceUpdates: (callback: (data: any) => void) => () => void;
    };
    power: {
      getBatteryInfo: () => Promise<{
        level: number;
        isCharging: boolean;
        timeToEmpty?: number;
        timeToFull?: number;
      }>;
      subscribeToBatteryUpdates: (callback: (data: any) => void) => () => void;
    };
  };

  let cpuUsage = $state(0);
  let memoryInfo = $state({ total: 0, used: 0, available: 0 });
  let batteryInfo = $state({ level: 0, isCharging: false });
  let isReady = $state(false);

  let unsubscribeResources: (() => void) | null = null;
  let unsubscribeBattery: (() => void) | null = null;

  onMount(() => {
    webshell.ready(async () => {
      isReady = true;

      // Initial data fetch
      try {
        cpuUsage = await webshell.system.getCPUUsage();
        memoryInfo = await webshell.system.getMemoryInfo();
        batteryInfo = await webshell.power.getBatteryInfo();
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }

      // Subscribe to updates
      unsubscribeResources = webshell.system.subscribeToResourceUpdates((data) => {
        if (data.cpu !== undefined) cpuUsage = data.cpu;
        if (data.memory) memoryInfo = data.memory;
      });

      unsubscribeBattery = webshell.power.subscribeToBatteryUpdates((data) => {
        batteryInfo = data;
      });
    });
  });

  onDestroy(() => {
    if (unsubscribeResources) unsubscribeResources();
    if (unsubscribeBattery) unsubscribeBattery();
  });
</script>

<div class="container">
  <h1>📊 System Monitor</h1>

  {#if !isReady}
    <p>Loading...</p>
  {:else}
    <div class="grid">
      <CPUGauge usage={cpuUsage} />
      <MemoryChart {memoryInfo} />
      <BatteryIndicator battery={batteryInfo} />
      <ClipboardMonitor />
    </div>
  {/if}
</div>
