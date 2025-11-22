<script lang="ts">
  type Props = {
    usage: number;
  };

  let { usage }: Props = $props();

  function getColor(value: number): string {
    if (value < 50) return '#22c55e';
    if (value < 80) return '#f59e0b';
    return '#ef4444';
  }
</script>

<div class="card">
  <h2>🔥 CPU Usage</h2>
  <div class="metric">
    <span class="metric-label">Current</span>
    <span class="metric-value" style="color: {getColor(usage)}">{usage.toFixed(1)}%</span>
  </div>
  <div class="progress-bar">
    <div class="progress-fill" style="width: {usage}%; background: {getColor(usage)}"></div>
  </div>
</div>
