<script lang="ts">
  type Props = {
    memoryInfo: {
      total: number;
      used: number;
      available: number;
    };
  };

  let { memoryInfo }: Props = $props();

  function formatBytes(bytes: number): string {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(2) + ' GB';
  }

  let usedPercent = $derived(
    memoryInfo.total > 0 ? (memoryInfo.used / memoryInfo.total) * 100 : 0
  );
</script>

<div class="card">
  <h2>💾 Memory</h2>
  <div class="metric">
    <span class="metric-label">Used</span>
    <span class="metric-value">{formatBytes(memoryInfo.used)}</span>
  </div>
  <div class="metric">
    <span class="metric-label">Total</span>
    <span class="metric-value">{formatBytes(memoryInfo.total)}</span>
  </div>
  <div class="progress-bar">
    <div class="progress-fill" style="width: {usedPercent}%"></div>
  </div>
  <div style="margin-top: 0.5rem; text-align: center; color: var(--color-text-secondary);">
    {usedPercent.toFixed(1)}% used
  </div>
</div>
