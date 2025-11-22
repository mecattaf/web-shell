# System Monitor - WebShell Example

A dashboard showing system resources in real-time using Svelte.

## What it demonstrates

- **System service**: CPU and memory monitoring
- **Power service**: Battery status and charging info
- **Clipboard operations**: Read and write clipboard content
- **Subscriptions**: Real-time updates for system metrics
- **Svelte framework**: Modern reactive UI

## Features

- CPU usage gauge with color-coded status
- Memory usage chart with formatted values
- Battery indicator with charging status
- Clipboard monitor with read/write operations
- Real-time updates via subscriptions
- Responsive grid layout

## Structure

```
system-monitor/
├── webshell.json        # App manifest
├── package.json         # Dependencies
├── vite.config.ts       # Build config
├── tsconfig.json        # TypeScript config
├── index.html           # Entry point
├── src/
│   ├── main.ts          # App entry
│   ├── app.css          # Global styles
│   ├── App.svelte       # Main component
│   └── components/
│       ├── CPUGauge.svelte
│       ├── MemoryChart.svelte
│       ├── BatteryIndicator.svelte
│       └── ClipboardMonitor.svelte
└── README.md
```

## Setup

Install dependencies:

```bash
cd examples/system-monitor
npm install
```

## Running

### Development mode

```bash
npm run dev
# Then run WebShell pointing to dev server
```

### Build for production

```bash
npm run build
# Then run with WebShell
```

## Code walkthrough

### 1. Subscriptions

Real-time updates without polling:

```typescript
// Subscribe to resource updates
const unsubscribe = webshell.system.subscribeToResourceUpdates((data) => {
  cpuUsage = data.cpu;
  memoryInfo = data.memory;
});

// Clean up on unmount
onDestroy(() => {
  unsubscribe();
});
```

### 2. System metrics

Access system information:

```typescript
// Get CPU usage
const cpu = await webshell.system.getCPUUsage();

// Get memory info
const memory = await webshell.system.getMemoryInfo();
// { total: 16GB, used: 8GB, available: 8GB }
```

### 3. Battery monitoring

Monitor power status:

```typescript
const battery = await webshell.power.getBatteryInfo();
// { level: 85, isCharging: true, timeToFull: 3600 }

// Subscribe to changes
webshell.power.subscribeToBatteryUpdates((data) => {
  console.log('Battery:', data.level);
});
```

### 4. Clipboard operations

Read and write clipboard:

```typescript
// Read current clipboard content
const text = await webshell.system.clipboard.readText();

// Write to clipboard
await webshell.system.clipboard.writeText('Hello!');
```

### 5. Svelte reactivity

Using Svelte 5 runes for reactive state:

```svelte
<script lang="ts">
  let cpuUsage = $state(0);
  let usedPercent = $derived((memory.used / memory.total) * 100);
</script>
```

## Customization

Try modifying:

- Update intervals for subscriptions
- Add more system metrics (disk usage, network)
- Add charts with Chart.js or similar
- Add historical data tracking
- Change color schemes and thresholds
- Add system notifications for alerts

## Next steps

- Check out `note-taker` for data persistence patterns
- Read the SDK docs for all available system APIs
- Explore the production `calendar` app for complex UI

## Dependencies

- **Svelte**: Modern reactive framework
- **Vite**: Fast build tool
- **TypeScript**: Type safety
