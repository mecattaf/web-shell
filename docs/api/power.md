# Power Module API

 

The Power Module provides battery monitoring and system power management capabilities.

 

## Overview

 

The Power Module (`webshell.power`) enables WebShell applications to:

 

- Monitor battery status and charging state

- Receive battery change notifications

- Execute system power actions (shutdown, restart, suspend, hibernate)

- Access battery time estimates

- Implement power-aware features

 

## Namespace

 

Access via: `webshell.power`

 

## Battery Monitoring

 

### `getBatteryStatus(): Promise<BatteryStatus>`

 

Retrieves the current battery status.

 

**Returns:** `Promise<BatteryStatus>` - Battery status information

 

**Throws:**

- `WebShellError` with code `POWER_OPERATION_FAILED` if battery status cannot be retrieved

 

**Example:**

```typescript

const battery = await webshell.power.getBatteryStatus();

 

console.log(`Battery Level: ${battery.level}%`);

console.log(`Charging: ${battery.charging ? 'Yes' : 'No'}`);

 

if (battery.charging && battery.timeToFull) {

  const hours = Math.floor(battery.timeToFull / 60);

  const minutes = battery.timeToFull % 60;

  console.log(`Time to full: ${hours}h ${minutes}m`);

}

 

if (!battery.charging && battery.timeToEmpty) {

  const hours = Math.floor(battery.timeToEmpty / 60);

  const minutes = battery.timeToEmpty % 60;

  console.log(`Time remaining: ${hours}h ${minutes}m`);

}

```

 

**BatteryStatus Fields:**

- `level` (number): Battery level percentage (0-100)

- `charging` (boolean): Whether battery is currently charging

- `timeToEmpty` (number, optional): Estimated minutes until battery empty (when discharging)

- `timeToFull` (number, optional): Estimated minutes until battery full (when charging)

 

**Notes:**

- Level is always a number between 0 and 100

- Time estimates may be undefined if unavailable

- Time estimates are in minutes

- Desktop systems without batteries return level 100, charging false

 

---

 

### `onBatteryChange(handler: EventHandler<BatteryStatus>): UnsubscribeFn`

 

Subscribes to battery status change notifications.

 

**Parameters:**

- `handler` (EventHandler<BatteryStatus>): Function called when battery status changes

 

**Returns:** [`UnsubscribeFn`](../sdk-api-reference.md#unsubscribefn) - Function to unsubscribe

 

**Example:**

```typescript

const unsubscribe = webshell.power.onBatteryChange((status) => {

  console.log(`Battery: ${status.level}%`);

 

  // Low battery warning

  if (status.level < 20 && !status.charging) {

    webshell.notifications.send({

      title: 'Low Battery',

      message: `Battery at ${status.level}%. Please connect charger.`,

      urgency: 'critical'

    });

  }

 

  // Charging started

  if (status.charging) {

    console.log('Charging started');

  }

 

  // Fully charged

  if (status.level === 100 && status.charging) {

    webshell.notifications.send({

      title: 'Battery Charged',

      message: 'Battery is fully charged',

      urgency: 'low'

    });

  }

});

 

// Later: unsubscribe()

```

 

**Notes:**

- Called when battery level changes

- Called when charging state changes

- Update frequency depends on system battery reporting

- Clean up subscription when no longer needed

 

---

 

## Power Actions

 

### `shutdown(): Promise<void>`

 

Initiates system shutdown.

 

**Returns:** `Promise<void>` - Resolves when shutdown is initiated

 

**Throws:**

- `WebShellError` with code `PERMISSION_DENIED` if `power.shutdown` permission not granted

- `WebShellError` with code `POWER_OPERATION_FAILED` if shutdown fails

 

**Example:**

```typescript

async function confirmAndShutdown() {

  const confirmed = confirm('Shutdown the system now?');

 

  if (confirmed) {

    try {

      await webshell.power.shutdown();

      // System is shutting down...

    } catch (err) {

      if (err.code === 'PERMISSION_DENIED') {

        alert('Shutdown permission required');

      } else {

        alert('Shutdown failed: ' + err.message);

      }

    }

  }

}

```

 

**Notes:**

- **DANGEROUS**: This will shut down the entire system

- Always confirm with user before calling

- All unsaved data will be lost

- Requires `power.shutdown` permission

- May require elevated privileges on some systems

 

---

 

### `restart(): Promise<void>`

 

Initiates system restart.

 

**Returns:** `Promise<void>` - Resolves when restart is initiated

 

**Throws:**

- `WebShellError` with code `PERMISSION_DENIED` if `power.restart` permission not granted

- `WebShellError` with code `POWER_OPERATION_FAILED` if restart fails

 

**Example:**

```typescript

async function confirmAndRestart() {

  const confirmed = confirm('Restart the system now?');

 

  if (confirmed) {

    try {

      await webshell.power.restart();

      // System is restarting...

    } catch (err) {

      if (err.code === 'PERMISSION_DENIED') {

        alert('Restart permission required');

      } else {

        alert('Restart failed: ' + err.message);

      }

    }

  }

}

```

 

**Notes:**

- **DANGEROUS**: This will restart the entire system

- Always confirm with user before calling

- All unsaved data will be lost

- Requires `power.restart` permission

- May require elevated privileges on some systems

 

---

 

### `suspend(): Promise<void>`

 

Suspends the system (sleep mode).

 

**Returns:** `Promise<void>` - Resolves when suspend is initiated

 

**Throws:**

- `WebShellError` with code `PERMISSION_DENIED` if `power.suspend` permission not granted

- `WebShellError` with code `POWER_OPERATION_FAILED` if suspend fails

 

**Example:**

```typescript

async function sleepSystem() {

  try {

    // Save any important state

    await saveApplicationState();

 

    // Suspend system

    await webshell.power.suspend();

  } catch (err) {

    if (err.code === 'PERMISSION_DENIED') {

      console.error('Suspend permission required');

    } else {

      console.error('Suspend failed:', err.message);

    }

  }

}

```

 

**Notes:**

- Puts system into low-power sleep state

- RAM remains powered (fast resume)

- Network connections may be lost

- Requires `power.suspend` permission

- Apps should save state before suspending

 

---

 

### `hibernate(): Promise<void>`

 

Hibernates the system (save to disk and power off).

 

**Returns:** `Promise<void>` - Resolves when hibernation is initiated

 

**Throws:**

- `WebShellError` with code `PERMISSION_DENIED` if `power.hibernate` permission not granted

- `WebShellError` with code `POWER_OPERATION_FAILED` if hibernate fails

 

**Example:**

```typescript

async function hibernateSystem() {

  try {

    // Save application state

    await saveApplicationState();

 

    // Hibernate

    await webshell.power.hibernate();

  } catch (err) {

    if (err.code === 'PERMISSION_DENIED') {

      console.error('Hibernate permission required');

    } else if (err.code === 'POWER_OPERATION_FAILED') {

      console.error('Hibernation not supported or failed');

    }

  }

}

```

 

**Notes:**

- Saves RAM contents to disk and powers off

- Slower than suspend but uses no power

- Resume restores previous session

- Requires `power.hibernate` permission

- May not be available on all systems (requires swap space)

 

---

 

## Common Patterns

 

### Battery Level Indicator

 

Display battery status in UI:

 

```typescript

class BatteryIndicator {

  private element: HTMLElement;

  private unsubscribe?: () => void;

 

  constructor(element: HTMLElement) {

    this.element = element;

  }

 

  async init() {

    // Initial status

    await this.update();

 

    // Subscribe to changes

    this.unsubscribe = webshell.power.onBatteryChange(() => {

      this.update();

    });

  }

 

  async update() {

    const battery = await webshell.power.getBatteryStatus();

 

    // Update display

    this.element.textContent = `${battery.level}%`;

 

    // Update color based on level and charging state

    if (battery.charging) {

      this.element.className = 'battery charging';

    } else if (battery.level < 20) {

      this.element.className = 'battery low';

    } else if (battery.level < 50) {

      this.element.className = 'battery medium';

    } else {

      this.element.className = 'battery high';

    }

 

    // Show icon

    const icon = battery.charging ? '⚡' : '🔋';

    this.element.innerHTML = `${icon} ${battery.level}%`;

  }

 

  destroy() {

    if (this.unsubscribe) {

      this.unsubscribe();

    }

  }

}

 

// Usage

const indicator = new BatteryIndicator(

  document.getElementById('battery-indicator')

);

await indicator.init();

```

 

### Low Battery Notifications

 

Alert user when battery is low:

 

```typescript

class BatteryMonitor {

  private warningLevels = [20, 10, 5];

  private warned = new Set<number>();

 

  async start() {

    // Check initial status

    await this.check();

 

    // Monitor changes

    webshell.power.onBatteryChange(() => this.check());

  }

 

  async check() {

    const battery = await webshell.power.getBatteryStatus();

 

    // Don't warn if charging

    if (battery.charging) {

      this.warned.clear();

      return;

    }

 

    // Check warning levels

    for (const level of this.warningLevels) {

      if (battery.level <= level && !this.warned.has(level)) {

        this.warned.add(level);

        await this.sendWarning(battery);

      }

    }

  }

 

  async sendWarning(battery: BatteryStatus) {

    const urgency = battery.level <= 5 ? 'critical' : 'normal';

    const timeLeft = battery.timeToEmpty

      ? ` (${Math.floor(battery.timeToEmpty / 60)}h ${battery.timeToEmpty % 60}m remaining)`

      : '';

 

    await webshell.notifications.send({

      title: 'Low Battery Warning',

      message: `Battery at ${battery.level}%${timeLeft}. Please connect charger.`,

      urgency,

      icon: 'battery-low'

    });

  }

}

 

// Start monitoring

const monitor = new BatteryMonitor();

await monitor.start();

```

 

### Power-Aware Features

 

Adjust app behavior based on battery:

 

```typescript

class PowerAwareApp {

  private powerSaveMode = false;

 

  async init() {

    await this.checkBattery();

 

    webshell.power.onBatteryChange(() => {

      this.checkBattery();

    });

  }

 

  async checkBattery() {

    const battery = await webshell.power.getBatteryStatus();

 

    // Enable power save mode when low battery and not charging

    const shouldSave = battery.level < 30 && !battery.charging;

 

    if (shouldSave !== this.powerSaveMode) {

      this.powerSaveMode = shouldSave;

      this.applyPowerMode();

    }

  }

 

  applyPowerMode() {

    if (this.powerSaveMode) {

      console.log('Enabling power save mode');

 

      // Reduce update frequency

      this.setUpdateInterval(60000); // 1 minute

 

      // Disable animations

      document.body.classList.add('reduced-motion');

 

      // Pause non-essential background tasks

      this.pauseBackgroundSync();

 

      // Notify user

      webshell.notifications.send({

        title: 'Power Save Mode',

        message: 'App features reduced to conserve battery',

        urgency: 'low'

      });

    } else {

      console.log('Disabling power save mode');

 

      // Restore normal operation

      this.setUpdateInterval(5000); // 5 seconds

      document.body.classList.remove('reduced-motion');

      this.resumeBackgroundSync();

    }

  }

 

  setUpdateInterval(ms: number) { /* ... */ }

  pauseBackgroundSync() { /* ... */ }

  resumeBackgroundSync() { /* ... */ }

}

```

 

### Power Menu Widget

 

Create a power management menu:

 

```typescript

async function createPowerMenu() {

  const menu = document.createElement('div');

  menu.className = 'power-menu';

 

  // Battery status

  const battery = await webshell.power.getBatteryStatus();

  const batteryDiv = document.createElement('div');

  batteryDiv.className = 'battery-status';

  batteryDiv.textContent = `Battery: ${battery.level}% ${battery.charging ? '(Charging)' : ''}`;

  menu.appendChild(batteryDiv);

 

  // Power actions

  const actions = [

    { label: 'Suspend', action: () => webshell.power.suspend() },

    { label: 'Hibernate', action: () => webshell.power.hibernate() },

    { label: 'Restart', action: () => confirmAction('restart', webshell.power.restart) },

    { label: 'Shutdown', action: () => confirmAction('shutdown', webshell.power.shutdown) }

  ];

 

  actions.forEach(({ label, action }) => {

    const button = document.createElement('button');

    button.textContent = label;

    button.onclick = action;

    menu.appendChild(button);

  });

 

  return menu;

}

 

async function confirmAction(action: string, fn: () => Promise<void>) {

  const confirmed = confirm(`Are you sure you want to ${action} the system?`);

  if (confirmed) {

    try {

      await fn();

    } catch (err) {

      alert(`Failed to ${action}: ${err.message}`);

    }

  }

}

 

// Usage

const powerMenu = await createPowerMenu();

document.body.appendChild(powerMenu);

```

 

### Battery Saver Scheduler

 

Automatically suspend when battery is low:

 

```typescript

class BatterySaver {

  private suspendThreshold = 5; // 5%

  private warned = false;

 

  async start() {

    webshell.power.onBatteryChange(async (battery) => {

      if (battery.charging) {

        this.warned = false;

        return;

      }

 

      if (battery.level <= this.suspendThreshold) {

        if (!this.warned) {

          this.warned = true;

          await this.showSuspendWarning(battery);

        }

      }

    });

  }

 

  async showSuspendWarning(battery: BatteryStatus) {

    const timeLeft = battery.timeToEmpty || 5;

 

    await webshell.notifications.send({

      title: 'Critical Battery Level',

      message: `Battery at ${battery.level}%. System will suspend in ${timeLeft} minutes to prevent data loss.`,

      urgency: 'critical',

      timeout: -1,

      actions: [

        { id: 'cancel', label: 'Cancel Auto-Suspend' },

        { id: 'suspend-now', label: 'Suspend Now' }

      ]

    });

 

    // Auto-suspend after timeLeft

    setTimeout(async () => {

      const current = await webshell.power.getBatteryStatus();

      if (!current.charging && current.level <= this.suspendThreshold) {

        await this.emergencySuspend();

      }

    }, timeLeft * 60 * 1000);

  }

 

  async emergencySuspend() {

    console.log('Emergency suspend due to critical battery');

 

    // Save all app state

    await this.saveAllState();

 

    // Notify other apps

    await webshell.shell.broadcast('system.emergency-suspend', {

      reason: 'low-battery'

    });

 

    // Suspend

    await webshell.power.suspend();

  }

 

  async saveAllState() { /* Save app state */ }

}

```

 

### Laptop Lid Detection

 

Combine with system events for lid detection:

 

```typescript

// Note: This requires system-level event integration

webshell.system.onEvent('lid-closed', async () => {

  const battery = await webshell.power.getBatteryStatus();

 

  if (!battery.charging) {

    // On battery: suspend

    await webshell.power.suspend();

  } else {

    // Plugged in: do nothing or lock screen

    console.log('Lid closed while charging');

  }

});

 

webshell.system.onEvent('lid-opened', () => {

  console.log('Lid opened, system resuming');

});

```

 

### Battery History Tracking

 

Track battery usage over time:

 

```typescript

interface BatteryReading {

  timestamp: number;

  level: number;

  charging: boolean;

}

 

class BatteryHistory {

  private readings: BatteryReading[] = [];

  private maxReadings = 1000;

 

  async start() {

    // Record initial reading

    await this.record();

 

    // Record on changes

    webshell.power.onBatteryChange(() => this.record());

 

    // Periodic recording (every 5 minutes)

    setInterval(() => this.record(), 5 * 60 * 1000);

  }

 

  async record() {

    const battery = await webshell.power.getBatteryStatus();

 

    this.readings.push({

      timestamp: Date.now(),

      level: battery.level,

      charging: battery.charging

    });

 

    // Limit history size

    if (this.readings.length > this.maxReadings) {

      this.readings.shift();

    }

 

    // Persist to storage

    localStorage.setItem('battery-history', JSON.stringify(this.readings));

  }

 

  getAverageDrainRate(): number {

    // Calculate drain rate in %/hour

    const nonChargingReadings = this.readings.filter(r => !r.charging);

    if (nonChargingReadings.length < 2) return 0;

 

    const first = nonChargingReadings[0];

    const last = nonChargingReadings[nonChargingReadings.length - 1];

 

    const levelDiff = first.level - last.level;

    const timeDiff = (last.timestamp - first.timestamp) / (1000 * 60 * 60); // hours

 

    return timeDiff > 0 ? levelDiff / timeDiff : 0;

  }

 

  getEstimatedTimeRemaining(currentLevel: number): number {

    const drainRate = this.getAverageDrainRate();

    if (drainRate <= 0) return 0;

 

    // Minutes until empty

    return (currentLevel / drainRate) * 60;

  }

}

```

 

## Permissions

 

The Power Module requires specific permissions based on operations:

 

```json

{

  "name": "power-manager-app",

  "permissions": [

    "power.read",

    "power.suspend",

    "power.hibernate",

    "power.restart",

    "power.shutdown"

  ],

  "entry": "index.html"

}

```

 

**Permission Levels:**

- `power.read`: Required for battery status (default, usually granted)

- `power.suspend`: Required for suspend operation

- `power.hibernate`: Required for hibernate operation

- `power.restart`: Required for restart operation

- `power.shutdown`: Required for shutdown operation

 

**Security Note:** Restart and shutdown permissions are **dangerous** and should only be requested by system utilities.

 

## Platform Considerations

 

### Linux

- Battery info from `/sys/class/power_supply/`

- Power actions via systemd or UPower

- Hibernate requires swap partition/file

- May require PolicyKit authentication

 

### Desktop vs Laptop

- Desktop systems report level 100%, charging false

- Battery monitoring only meaningful on laptops

- Power actions work on all systems

 

### Permission Elevation

- Power actions may require elevated privileges

- User may be prompted for authentication

- Operations may fail if user denies authentication

 

## Error Handling

 

Handle power operation errors appropriately:

 

```typescript

import { WebShellError } from 'webshell-sdk';

 

async function safeSuspend() {

  try {

    await webshell.power.suspend();

  } catch (err) {

    if (err instanceof WebShellError) {

      switch (err.code) {

        case 'PERMISSION_DENIED':

          console.error('Suspend permission not granted');

          alert('This app needs suspend permission');

          break;

        case 'POWER_OPERATION_FAILED':

          console.error('Suspend operation failed');

          alert('Failed to suspend system');

          break;

        default:

          console.error('Power error:', err.message);

      }

    }

  }

}

```

 

## Best Practices

 

### Always Confirm Dangerous Actions

 

```typescript

async function safeShutdown() {

  const confirmed = confirm(

    'Are you sure you want to shut down the system? All unsaved work will be lost.'

  );

 

  if (!confirmed) return;

 

  try {

    await webshell.power.shutdown();

  } catch (err) {

    alert('Shutdown failed: ' + err.message);

  }

}

```

 

### Save State Before Power Actions

 

```typescript

async function suspendWithSave() {

  // Save application state

  await saveAppState();

 

  // Notify user

  webshell.notifications.send({

    title: 'Suspending',

    message: 'Saving state and suspending system...',

    urgency: 'low'

  });

 

  // Suspend

  await webshell.power.suspend();

}

```

 

### Graceful Battery Monitoring

 

```typescript

// Handle systems without battery gracefully

async function getBatteryIfAvailable() {

  try {

    return await webshell.power.getBatteryStatus();

  } catch (err) {

    if (err.code === 'POWER_OPERATION_FAILED') {

      // Desktop system, no battery

      return null;

    }

    throw err;

  }

}

```

 

## Related Documentation

 

- [System Module](./system.md) - System information and resources

- [Notifications Module](./notifications.md) - Battery notifications

- [Power Management Guide](../guides/power-management.md)

- [Security Considerations](../security.md) - Power action permissions

 
