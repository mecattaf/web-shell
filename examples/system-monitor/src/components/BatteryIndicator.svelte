<script lang="ts">
  type Props = {
    battery: {
      level: number;
      isCharging: boolean;
      timeToEmpty?: number;
      timeToFull?: number;
    };
  };

  let { battery }: Props = $props();

  function formatTime(seconds?: number): string {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  let statusClass = $derived(
    battery.isCharging ? 'status-charging' : battery.level < 20 ? 'status-discharging' : 'status-full'
  );

  let statusText = $derived(
    battery.isCharging ? 'Charging' : battery.level === 100 ? 'Full' : 'Discharging'
  );
</script>

<div class="card">
  <h2>🔋 Battery</h2>
  <div class="metric">
    <span class="metric-label">Level</span>
    <span class="metric-value">{battery.level}%</span>
  </div>
  <div class="progress-bar">
    <div class="progress-fill" style="width: {battery.level}%"></div>
  </div>
  <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
    <span class="status-badge {statusClass}">{statusText}</span>
    <span style="color: var(--color-text-secondary); font-size: 0.85rem;">
      {#if battery.isCharging && battery.timeToFull}
        {formatTime(battery.timeToFull)} to full
      {:else if !battery.isCharging && battery.timeToEmpty}
        {formatTime(battery.timeToEmpty)} remaining
      {/if}
    </span>
  </div>
</div>
