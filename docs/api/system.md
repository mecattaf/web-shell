# System Module API

 

The System Module provides access to system information, resource monitoring, clipboard operations, and process execution.

 

## Overview

 

The System Module (`webshell.system`) enables WebShell applications to:

 

- Query system information (platform, architecture, OS version)

- Monitor system resources (CPU, memory, disk usage)

- Check system uptime

- Access clipboard (read/write text)

- Execute system commands

- Monitor system resource changes

 

## Namespace

 

Access via: `webshell.system`

 

## System Information

 

### `getInfo(): Promise<SystemInfo>`

 

Retrieves comprehensive system information.

 

**Returns:** `Promise<SystemInfo>` - System information object

 

**Throws:**

- `WebShellError` with code `SYSTEM_CALL_FAILED` if system info cannot be retrieved

 

**Example:**

```typescript

const info = await webshell.system.getInfo();

 

console.log(`Platform: ${info.platform}`);

console.log(`Architecture: ${info.arch}`);

console.log(`Hostname: ${info.hostname}`);

console.log(`OS Version: ${info.osVersion}`);

console.log(`Kernel: ${info.kernelVersion}`);

console.log(`Total Memory: ${(info.totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`);

console.log(`CPU Cores: ${info.cpuCount}`);

```

 

**SystemInfo Fields:**

- `platform` (string): Operating system platform (e.g., "linux", "darwin", "win32")

- `arch` (string): CPU architecture (e.g., "x64", "arm64")

- `hostname` (string): System hostname

- `osVersion` (string): Operating system version

- `kernelVersion` (string): Kernel version

- `totalMemory` (number): Total system memory in bytes

- `cpuCount` (number): Number of CPU cores

 

**Notes:**

- Information is current at call time

- Memory value is total physical RAM

- CPU count includes logical cores (hyperthreading)

 

---

 

### `getUptime(): Promise<number>`

 

Retrieves system uptime in seconds.

 

**Returns:** `Promise<number>` - System uptime in seconds

 

**Throws:**

- `WebShellError` with code `SYSTEM_CALL_FAILED` if uptime cannot be retrieved

 

**Example:**

```typescript

const uptime = await webshell.system.getUptime();

 

const days = Math.floor(uptime / 86400);

const hours = Math.floor((uptime % 86400) / 3600);

const minutes = Math.floor((uptime % 3600) / 60);

 

console.log(`System uptime: ${days}d ${hours}h ${minutes}m`);

```

 

**Notes:**

- Returns seconds since system boot

- Useful for monitoring system stability

- Resets to 0 on reboot

 

---

 

## Resource Monitoring

 

### `getCPUUsage(): Promise<number>`

 

Retrieves current CPU usage percentage.

 

**Returns:** `Promise<number>` - CPU usage from 0 to 100

 

**Throws:**

- `WebShellError` with code `SYSTEM_CALL_FAILED` if CPU usage cannot be retrieved

 

**Example:**

```typescript

const cpu = await webshell.system.getCPUUsage();

console.log(`CPU usage: ${cpu.toFixed(1)}%`);

 

if (cpu > 80) {

  console.warn('High CPU usage detected');

}

```

 

**Notes:**

- Returns average across all CPU cores

- Value is instantaneous, not averaged over time

- May spike briefly during intensive tasks

- Call multiple times and average for smoother readings

 

---

 

### `getMemoryUsage(): Promise<MemoryInfo>`

 

Retrieves current memory usage information.

 

**Returns:** `Promise<MemoryInfo>` - Memory usage details

 

**Throws:**

- `WebShellError` with code `SYSTEM_CALL_FAILED` if memory info cannot be retrieved

 

**Example:**

```typescript

const mem = await webshell.system.getMemoryUsage();

 

console.log(`Total: ${(mem.total / 1024 / 1024 / 1024).toFixed(2)} GB`);

console.log(`Used: ${(mem.used / 1024 / 1024 / 1024).toFixed(2)} GB`);

console.log(`Free: ${(mem.free / 1024 / 1024 / 1024).toFixed(2)} GB`);

console.log(`Available: ${(mem.available / 1024 / 1024 / 1024).toFixed(2)} GB`);

console.log(`Usage: ${mem.usedPercent.toFixed(1)}%`);

 

if (mem.usedPercent > 90) {

  console.warn('Low memory available');

}

```

 

**MemoryInfo Fields:**

- `total` (number): Total physical memory in bytes

- `used` (number): Used memory in bytes

- `free` (number): Free memory in bytes

- `available` (number): Available memory in bytes (free + reclaimable)

- `usedPercent` (number): Percentage of memory used (0-100)

 

**Notes:**

- `available` is more accurate than `free` for available memory

- Includes buffers and cache in calculations

- Values in bytes for precision

 

---

 

### `getDiskUsage(): Promise<DiskInfo[]>`

 

Retrieves disk usage for all mounted filesystems.

 

**Returns:** `Promise<DiskInfo[]>` - Array of disk usage information

 

**Throws:**

- `WebShellError` with code `SYSTEM_CALL_FAILED` if disk info cannot be retrieved

 

**Example:**

```typescript

const disks = await webshell.system.getDiskUsage();

 

disks.forEach(disk => {

  console.log(`\nDevice: ${disk.device}`);

  console.log(`Mount: ${disk.path}`);

  console.log(`Type: ${disk.fstype}`);

  console.log(`Total: ${(disk.total / 1024 / 1024 / 1024).toFixed(2)} GB`);

  console.log(`Used: ${(disk.used / 1024 / 1024 / 1024).toFixed(2)} GB`);

  console.log(`Free: ${(disk.free / 1024 / 1024 / 1024).toFixed(2)} GB`);

  console.log(`Usage: ${disk.usedPercent.toFixed(1)}%`);

 

  if (disk.usedPercent > 90) {

    console.warn(`Disk ${disk.path} is almost full!`);

  }

});

```

 

**DiskInfo Fields:**

- `path` (string): Mount point path

- `device` (string): Device identifier (e.g., "/dev/sda1")

- `fstype` (string): Filesystem type (e.g., "ext4", "ntfs")

- `total` (number): Total disk space in bytes

- `used` (number): Used disk space in bytes

- `free` (number): Free disk space in bytes

- `usedPercent` (number): Percentage of disk used (0-100)

 

**Notes:**

- Returns all mounted filesystems

- Excludes virtual filesystems (proc, sysfs, etc.)

- Values in bytes for precision

 

---

 

## Clipboard Operations

 

The `clipboard` sub-module provides text clipboard access.

 

### `clipboard.readText(): Promise<string>`

 

Reads text content from the system clipboard.

 

**Returns:** `Promise<string>` - Clipboard text content

 

**Throws:**

- `WebShellError` with code `PERMISSION_DENIED` if `clipboard.read` permission not granted

- `WebShellError` with code `CLIPBOARD_OPERATION_FAILED` if read fails

 

**Example:**

```typescript

try {

  const text = await webshell.system.clipboard.readText();

  console.log(`Clipboard contains: ${text}`);

 

  // Use clipboard content

  if (text.startsWith('http')) {

    console.log('Clipboard contains a URL');

  }

} catch (err) {

  if (err.code === 'PERMISSION_DENIED') {

    console.error('Clipboard read permission required');

  }

}

```

 

**Notes:**

- Returns empty string if clipboard is empty

- Only supports text content (not images or files)

- May return stale data if clipboard changed externally

- Requires `clipboard.read` permission

 

---

 

### `clipboard.writeText(text: string): Promise<void>`

 

Writes text content to the system clipboard.

 

**Parameters:**

- `text` (string): Text to write to clipboard

 

**Returns:** `Promise<void>` - Resolves when text is written

 

**Throws:**

- `WebShellError` with code `PERMISSION_DENIED` if `clipboard.write` permission not granted

- `WebShellError` with code `CLIPBOARD_OPERATION_FAILED` if write fails

 

**Example:**

```typescript

try {

  await webshell.system.clipboard.writeText('Hello, World!');

  console.log('Text copied to clipboard');

 

  // Show confirmation

  webshell.notifications.send({

    title: 'Copied',

    message: 'Text copied to clipboard',

    urgency: 'low',

    timeout: 2000

  });

} catch (err) {

  if (err.code === 'PERMISSION_DENIED') {

    console.error('Clipboard write permission required');

  }

}

```

 

**Notes:**

- Replaces existing clipboard content

- Only supports text content

- Content persists after app closes

- Requires `clipboard.write` permission

 

---

 

### `clipboard.clear(): Promise<void>`

 

Clears the clipboard content.

 

**Returns:** `Promise<void>` - Resolves when clipboard is cleared

 

**Throws:**

- `WebShellError` with code `CLIPBOARD_OPERATION_FAILED` if clear fails

 

**Example:**

```typescript

await webshell.system.clipboard.clear();

console.log('Clipboard cleared');

```

 

**Notes:**

- Makes clipboard empty

- Does not require permissions (non-destructive operation)

- Silent if clipboard is already empty

 

---

 

## Command Execution

 

### `exec(command: string, args: string[]): Promise<ExecResult>`

 

Executes a system command and returns the result.

 

**Parameters:**

- `command` (string): Command to execute (must be in PATH or absolute path)

- `args` (string[]): Array of command arguments

 

**Returns:** `Promise<ExecResult>` - Execution result

 

**Throws:**

- `WebShellError` with code `PERMISSION_DENIED` if `system.exec` permission not granted

- `WebShellError` with code `SYSTEM_CALL_FAILED` if command execution fails

 

**Example:**

```typescript

try {

  const result = await webshell.system.exec('ls', ['-la', '/tmp']);

 

  console.log(`Exit code: ${result.exitCode}`);

  console.log(`Success: ${result.success}`);

 

  if (result.success) {

    console.log('Output:');

    console.log(result.stdout);

  } else {

    console.error('Error:');

    console.error(result.stderr);

  }

} catch (err) {

  if (err.code === 'PERMISSION_DENIED') {

    console.error('System exec permission required');

  }

}

```

 

**ExecResult Fields:**

- `stdout` (string): Standard output from command

- `stderr` (string): Standard error from command

- `exitCode` (number): Process exit code (0 = success)

- `success` (boolean): Whether command succeeded (exitCode === 0)

 

**Notes:**

- **DANGEROUS**: Can execute arbitrary system commands

- Requires `system.exec` permission

- Command runs with app's privileges

- Blocks until command completes

- stdout and stderr are captured

- Use with extreme caution

 

---

 

## Common Patterns

 

### System Monitor Widget

 

Display system resource usage:

 

```typescript

class SystemMonitor {

  private container: HTMLElement;

  private updateInterval: number;

 

  constructor(container: HTMLElement, intervalMs = 2000) {

    this.container = container;

    this.updateInterval = intervalMs;

  }

 

  async start() {

    await this.update();

    setInterval(() => this.update(), this.updateInterval);

  }

 

  async update() {

    const [cpu, memory, disks] = await Promise.all([

      webshell.system.getCPUUsage(),

      webshell.system.getMemoryUsage(),

      webshell.system.getDiskUsage()

    ]);

 

    this.container.innerHTML = `

      <div class="system-monitor">

        <div class="metric">

          <span class="label">CPU:</span>

          <span class="value">${cpu.toFixed(1)}%</span>

          <div class="bar" style="width: ${cpu}%"></div>

        </div>

 

        <div class="metric">

          <span class="label">Memory:</span>

          <span class="value">${memory.usedPercent.toFixed(1)}%</span>

          <div class="bar" style="width: ${memory.usedPercent}%"></div>

        </div>

 

        ${disks.map(disk => `

          <div class="metric">

            <span class="label">${disk.path}:</span>

            <span class="value">${disk.usedPercent.toFixed(1)}%</span>

            <div class="bar" style="width: ${disk.usedPercent}%"></div>

          </div>

        `).join('')}

      </div>

    `;

  }

}

 

// Usage

const monitor = new SystemMonitor(

  document.getElementById('system-monitor')

);

await monitor.start();

```

 

### System Information Display

 

Show detailed system info:

 

```typescript

async function displaySystemInfo() {

  const info = await webshell.system.getInfo();

  const uptime = await webshell.system.getUptime();

 

  const days = Math.floor(uptime / 86400);

  const hours = Math.floor((uptime % 86400) / 3600);

 

  const infoHTML = `

    <div class="system-info">

      <h3>System Information</h3>

      <table>

        <tr><th>Platform</th><td>${info.platform}</td></tr>

        <tr><th>Architecture</th><td>${info.arch}</td></tr>

        <tr><th>Hostname</th><td>${info.hostname}</td></tr>

        <tr><th>OS Version</th><td>${info.osVersion}</td></tr>

        <tr><th>Kernel</th><td>${info.kernelVersion}</td></tr>

        <tr><th>Memory</th><td>${(info.totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB</td></tr>

        <tr><th>CPU Cores</th><td>${info.cpuCount}</td></tr>

        <tr><th>Uptime</th><td>${days}d ${hours}h</td></tr>

      </table>

    </div>

  `;

 

  document.getElementById('info-container').innerHTML = infoHTML;

}

```

 

### Copy to Clipboard Feature

 

Implement copy functionality:

 

```typescript

async function copyToClipboard(text: string) {

  try {

    await webshell.system.clipboard.writeText(text);

 

    // Show success notification

    await webshell.notifications.send({

      title: 'Copied',

      message: 'Text copied to clipboard',

      urgency: 'low',

      timeout: 2000

    });

 

    return true;

  } catch (err) {

    console.error('Failed to copy:', err);

 

    await webshell.notifications.send({

      title: 'Copy Failed',

      message: 'Could not copy to clipboard',

      urgency: 'normal',

      timeout: 3000

    });

 

    return false;

  }

}

 

// Add copy buttons to code blocks

document.querySelectorAll('pre code').forEach(block => {

  const button = document.createElement('button');

  button.textContent = 'Copy';

  button.onclick = () => copyToClipboard(block.textContent);

  block.parentElement.appendChild(button);

});

```

 

### Paste Handler

 

Handle clipboard paste operations:

 

```typescript

async function setupPasteHandler() {

  document.addEventListener('paste', async (e) => {

    e.preventDefault();

 

    try {

      const text = await webshell.system.clipboard.readText();

      console.log('Pasted:', text);

 

      // Process pasted content

      handlePastedText(text);

    } catch (err) {

      console.error('Paste failed:', err);

    }

  });

}

 

function handlePastedText(text: string) {

  // Detect URLs

  if (text.match(/^https?:\/\//)) {

    console.log('Pasted URL:', text);

    // Handle URL paste

  }

 

  // Detect JSON

  try {

    const json = JSON.parse(text);

    console.log('Pasted JSON:', json);

    // Handle JSON paste

  } catch {}

 

  // Default: insert as text

  insertTextAtCursor(text);

}

```

 

### Command Execution Wrapper

 

Safe command execution:

 

```typescript

async function runCommand(command: string, args: string[] = []) {

  try {

    const result = await webshell.system.exec(command, args);

 

    if (result.success) {

      console.log(`Command succeeded: ${command} ${args.join(' ')}`);

      return result.stdout;

    } else {

      console.error(`Command failed with exit code ${result.exitCode}`);

      console.error(result.stderr);

      throw new Error(result.stderr);

    }

  } catch (err) {

    if (err.code === 'PERMISSION_DENIED') {

      alert('This operation requires system.exec permission');

    } else {

      alert(`Command failed: ${err.message}`);

    }

    throw err;

  }

}

 

// Usage examples

const files = await runCommand('ls', ['-la', '/home']);

const diskSpace = await runCommand('df', ['-h']);

const processes = await runCommand('ps', ['aux']);

```

 

### Resource Usage Alert

 

Monitor and alert on high resource usage:

 

```typescript

class ResourceMonitor {

  private cpuThreshold = 80;

  private memoryThreshold = 85;

  private diskThreshold = 90;

  private checkInterval = 5000; // 5 seconds

 

  async start() {

    setInterval(() => this.check(), this.checkInterval);

  }

 

  async check() {

    const [cpu, memory, disks] = await Promise.all([

      webshell.system.getCPUUsage(),

      webshell.system.getMemoryUsage(),

      webshell.system.getDiskUsage()

    ]);

 

    // CPU alert

    if (cpu > this.cpuThreshold) {

      this.alert('High CPU Usage', `CPU usage is ${cpu.toFixed(1)}%`);

    }

 

    // Memory alert

    if (memory.usedPercent > this.memoryThreshold) {

      this.alert(

        'High Memory Usage',

        `Memory usage is ${memory.usedPercent.toFixed(1)}%`

      );

    }

 

    // Disk alerts

    disks.forEach(disk => {

      if (disk.usedPercent > this.diskThreshold) {

        this.alert(

          'Disk Almost Full',

          `${disk.path} is ${disk.usedPercent.toFixed(1)}% full`

        );

      }

    });

  }

 

  async alert(title: string, message: string) {

    await webshell.notifications.send({

      title,

      message,

      urgency: 'critical',

      timeout: 5000

    });

  }

}

 

const monitor = new ResourceMonitor();

await monitor.start();

```

 

### System Dashboard

 

Complete system monitoring dashboard:

 

```typescript

class SystemDashboard {

  private updateInterval = 2000;

 

  async init() {

    await this.render();

    setInterval(() => this.render(), this.updateInterval);

  }

 

  async render() {

    const [info, uptime, cpu, memory, disks] = await Promise.all([

      webshell.system.getInfo(),

      webshell.system.getUptime(),

      webshell.system.getCPUUsage(),

      webshell.system.getMemoryUsage(),

      webshell.system.getDiskUsage()

    ]);

 

    const uptimeDays = Math.floor(uptime / 86400);

    const uptimeHours = Math.floor((uptime % 86400) / 3600);

    const uptimeMins = Math.floor((uptime % 3600) / 60);

 

    document.getElementById('dashboard').innerHTML = `

      <div class="dashboard">

        <section class="info-section">

          <h2>System Information</h2>

          <p>${info.hostname} - ${info.platform} ${info.arch}</p>

          <p>${info.osVersion}</p>

          <p>Uptime: ${uptimeDays}d ${uptimeHours}h ${uptimeMins}m</p>

        </section>

 

        <section class="resources-section">

          <h2>Resources</h2>

 

          <div class="resource">

            <label>CPU (${info.cpuCount} cores)</label>

            <progress value="${cpu}" max="100"></progress>

            <span>${cpu.toFixed(1)}%</span>

          </div>

 

          <div class="resource">

            <label>Memory</label>

            <progress value="${memory.usedPercent}" max="100"></progress>

            <span>${memory.usedPercent.toFixed(1)}% - ${(memory.used / 1024 / 1024 / 1024).toFixed(2)} GB / ${(memory.total / 1024 / 1024 / 1024).toFixed(2)} GB</span>

          </div>

 

          ${disks.map(disk => `

            <div class="resource">

              <label>${disk.path} (${disk.fstype})</label>

              <progress value="${disk.usedPercent}" max="100"></progress>

              <span>${disk.usedPercent.toFixed(1)}% - ${(disk.used / 1024 / 1024 / 1024).toFixed(2)} GB / ${(disk.total / 1024 / 1024 / 1024).toFixed(2)} GB</span>

            </div>

          `).join('')}

        </section>

      </div>

    `;

  }

}

 

const dashboard = new SystemDashboard();

await dashboard.init();

```

 

### File Manager Integration

 

Execute file operations via commands:

 

```typescript

class FileManager {

  async listDirectory(path: string) {

    const result = await webshell.system.exec('ls', ['-la', path]);

    return result.stdout.split('\n').filter(line => line.trim());

  }

 

  async createDirectory(path: string) {

    await webshell.system.exec('mkdir', ['-p', path]);

  }

 

  async deleteFile(path: string) {

    const confirmed = confirm(`Delete ${path}?`);

    if (confirmed) {

      await webshell.system.exec('rm', ['-f', path]);

    }

  }

 

  async copyFile(source: string, dest: string) {

    await webshell.system.exec('cp', [source, dest]);

  }

 

  async moveFile(source: string, dest: string) {

    await webshell.system.exec('mv', [source, dest]);

  }

 

  async getFileInfo(path: string) {

    const result = await webshell.system.exec('stat', [path]);

    return result.stdout;

  }

}

```

 

## Permissions

 

The System Module requires specific permissions based on operations:

 

```json

{

  "name": "system-monitor-app",

  "permissions": [

    "system.info",

    "clipboard.read",

    "clipboard.write",

    "system.exec"

  ],

  "entry": "index.html"

}

```

 

**Permission Levels:**

- `system.info`: Required for system info and resource monitoring (usually safe)

- `clipboard.read`: Required for reading clipboard

- `clipboard.write`: Required for writing clipboard

- `system.exec`: Required for command execution (**DANGEROUS**)

 

**Security Warning:** `system.exec` is a dangerous permission that allows arbitrary command execution. Only grant to trusted applications.

 

## Platform Considerations

 

### Linux

- System info from `/proc` filesystem

- Resource monitoring via `sysinfo` system calls

- Clipboard via X11 or Wayland protocols

- Command execution via child processes

 

### Clipboard Support

- **X11**: Uses `xclip` or `xsel` utilities

- **Wayland**: Uses `wl-clipboard` utilities

- Text-only support (no images/files)

 

### Command Execution Security

- Commands run with app's user privileges

- No shell expansion (args are passed directly)

- PATH is searched for commands

- Use absolute paths for critical operations

 

## Error Handling

 

Handle system operation errors appropriately:

 

```typescript

import { WebShellError } from 'webshell-sdk';

 

async function safeSystemOperation() {

  try {

    const info = await webshell.system.getInfo();

    const clipboard = await webshell.system.clipboard.readText();

    const result = await webshell.system.exec('ls', ['-la']);

  } catch (err) {

    if (err instanceof WebShellError) {

      switch (err.code) {

        case 'PERMISSION_DENIED':

          console.error('Permission denied for system operation');

          break;

        case 'SYSTEM_CALL_FAILED':

          console.error('System call failed');

          break;

        case 'CLIPBOARD_OPERATION_FAILED':

          console.error('Clipboard operation failed');

          break;

        default:

          console.error('System error:', err.message);

      }

    }

  }

}

```

 

## Best Practices

 

### Resource Monitoring

 

```typescript

// Don't poll too frequently

setInterval(updateResources, 2000); // Good: 2 seconds

 

// Avoid excessive polling

setInterval(updateResources, 100); // Bad: 100ms is too frequent

```

 

### Command Execution Safety

 

```typescript

// Good: Validate inputs

async function safeLs(directory: string) {

  if (!directory.startsWith('/')) {

    throw new Error('Absolute path required');

  }

  return await webshell.system.exec('ls', ['-la', directory]);

}

 

// Bad: Arbitrary commands

async function dangerousExec(userInput: string) {

  // NEVER DO THIS

  return await webshell.system.exec(userInput, []);

}

```

 

### Clipboard Operations

 

```typescript

// Always handle clipboard failures gracefully

async function tryCopy(text: string) {

  try {

    await webshell.system.clipboard.writeText(text);

    return true;

  } catch {

    // Fallback: show text in dialog

    prompt('Copy this text:', text);

    return false;

  }

}

```

 

## Related Documentation

 

- [Power Module](./power.md) - Battery and power management

- [Shell Module](./shell.md) - App lifecycle and messaging

- [Command Execution Security](../security.md#command-execution)

- [Resource Monitoring Guide](../guides/resource-monitoring.md)

 
