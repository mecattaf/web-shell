/**
 * Hello World - Minimal WebShell App
 *
 * Demonstrates:
 * - Basic SDK setup
 * - Theme access
 * - Notifications
 */

// WebShell SDK is available globally
declare const webshell: {
  ready: (callback: () => void) => void;
  shell: {
    app: {
      getName: () => string;
    };
  };
  notifications: {
    send: (options: { title: string; message: string }) => Promise<void>;
  };
};

// Wait for WebShell SDK to be ready
webshell.ready(() => {
  console.log('WebShell SDK ready!');

  // Display app name from manifest
  const appNameEl = document.getElementById('app-name');
  if (appNameEl) {
    appNameEl.textContent = webshell.shell.app.getName();
  }

  // Show current primary color from theme
  const themeColorEl = document.getElementById('theme-color');
  if (themeColorEl) {
    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-primary')
      .trim();
    themeColorEl.textContent = primaryColor || '#007bff';
  }

  // Send notification when button is clicked
  const notifyBtn = document.getElementById('notify-btn');
  if (notifyBtn) {
    notifyBtn.addEventListener('click', async () => {
      try {
        await webshell.notifications.send({
          title: 'Hello from WebShell!',
          message: 'Your first notification from the Hello World app',
        });
        console.log('Notification sent successfully');
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    });
  }
});
