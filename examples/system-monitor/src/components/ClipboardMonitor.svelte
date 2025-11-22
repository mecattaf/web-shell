<script lang="ts">
  import { onMount } from 'svelte';

  // WebShell SDK types
  declare const webshell: {
    system: {
      clipboard: {
        readText: () => Promise<string>;
        writeText: (text: string) => Promise<void>;
      };
    };
  };

  let clipboardContent = $state('');
  let newContent = $state('');

  async function readClipboard() {
    try {
      clipboardContent = await webshell.system.clipboard.readText();
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  }

  async function writeClipboard() {
    if (!newContent.trim()) return;

    try {
      await webshell.system.clipboard.writeText(newContent);
      clipboardContent = newContent;
      newContent = '';
    } catch (error) {
      console.error('Failed to write clipboard:', error);
    }
  }

  onMount(() => {
    readClipboard();
  });
</script>

<div class="card">
  <h2>📋 Clipboard</h2>

  <div style="margin-bottom: 1rem;">
    <div style="margin-bottom: 0.5rem; color: var(--color-text-secondary); font-size: 0.9rem;">
      Current content:
    </div>
    <div style="background: var(--color-bg-tertiary, #333); padding: 0.75rem; border-radius: 0.5rem; font-family: monospace; font-size: 0.85rem; word-break: break-all; min-height: 60px;">
      {clipboardContent || 'Empty'}
    </div>
  </div>

  <button onclick={readClipboard} style="margin-right: 0.5rem;">
    Refresh
  </button>

  <div style="margin-top: 1rem;">
    <input
      type="text"
      bind:value={newContent}
      placeholder="Enter text to copy..."
      style="width: 100%; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid var(--color-text-secondary, #555); background: var(--color-bg-tertiary, #333); color: var(--color-text-primary, white); margin-bottom: 0.5rem;"
    />
    <button onclick={writeClipboard}>
      Copy to Clipboard
    </button>
  </div>
</div>
