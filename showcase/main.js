/**
 * WebShell Component Showcase
 * Main application logic
 */

class ShowcaseApp {
  constructor() {
    this.currentPage = 'tokens';
    this.currentTheme = 'dark';
    this.contentArea = document.getElementById('content-area');
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupThemeSwitcher();
    this.loadInitialPage();
  }

  setupNavigation() {
    const navItems = document.querySelectorAll('.showcase-nav-item');

    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        this.navigateToPage(page);

        // Update active state
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }

  setupThemeSwitcher() {
    const themeBtns = document.querySelectorAll('.theme-btn');

    themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        this.switchTheme(theme);

        // Update active state
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  switchTheme(themeName) {
    this.currentTheme = themeName;

    // For now, we'll just log the theme change
    // In a real implementation, this would load different CSS files
    console.log(`Switched to ${themeName} theme`);

    // You could dynamically load theme CSS here
    // For example: loadThemeCSS(`/themes/${themeName}.css`);
  }

  async navigateToPage(page) {
    this.currentPage = page;

    // Show loading state
    this.contentArea.innerHTML = '<div class="loading-placeholder"><p class="ws-text ws-text--size-l">Loading...</p></div>';

    try {
      const response = await fetch(`./pages/${page}.html`);
      const html = await response.text();

      this.contentArea.innerHTML = html;
      this.contentArea.classList.add('fade-in');

      // Initialize page-specific functionality
      this.initializePage(page);

      // Remove fade-in class after animation
      setTimeout(() => {
        this.contentArea.classList.remove('fade-in');
      }, 300);
    } catch (error) {
      this.contentArea.innerHTML = `
        <div class="loading-placeholder">
          <p class="ws-text ws-text--size-l" style="color: var(--color-error);">
            Error loading page: ${error.message}
          </p>
        </div>
      `;
    }
  }

  initializePage(page) {
    switch (page) {
      case 'tokens':
        this.initializeTokensPage();
        break;
      case 'components':
        this.initializeComponentsPage();
        break;
      case 'containers':
        this.initializeContainersPage();
        break;
      case 'examples':
        this.initializeExamplesPage();
        break;
    }
  }

  initializeTokensPage() {
    // Render all design tokens
    this.renderColorTokens();
    this.renderSpacingTokens();
    this.renderTypographyTokens();
    this.renderBorderTokens();
    this.renderShadowTokens();
  }

  renderColorTokens() {
    const container = document.getElementById('color-tokens');
    if (!container) return;

    const colorCategories = {
      'Surface Colors': [
        'surface', 'surface-high', 'surface-highest', 'surface-low',
        'background', 'text', 'text-secondary'
      ],
      'Primary Colors': [
        'primary', 'on-primary', 'primary-container', 'on-primary-container'
      ],
      'Secondary Colors': [
        'secondary', 'on-secondary', 'secondary-container', 'on-secondary-container'
      ],
      'Semantic Colors': [
        'error', 'warning', 'success', 'info'
      ],
      'Border Colors': [
        'border', 'border-focus'
      ]
    };

    const styles = getComputedStyle(document.documentElement);
    let html = '';

    for (const [category, colors] of Object.entries(colorCategories)) {
      html += `<div class="token-group">
        <h3 class="ws-heading ws-heading--h5 token-group-title">${category}</h3>`;

      colors.forEach(color => {
        const varName = `--color-${color}`;
        const value = styles.getPropertyValue(varName).trim();

        html += `
          <div class="token-item">
            <div class="token-swatch" style="background: ${value};"></div>
            <div class="token-info">
              <div class="token-name">${varName}</div>
              <div class="token-value">${value}</div>
            </div>
          </div>
        `;
      });

      html += '</div>';
    }

    container.innerHTML = html;
  }

  renderSpacingTokens() {
    const container = document.getElementById('spacing-tokens');
    if (!container) return;

    const spacings = ['xs', 's', 'm', 'l', 'xl', 'xxl'];
    const styles = getComputedStyle(document.documentElement);

    let html = '<div class="token-group"><h3 class="ws-heading ws-heading--h5 token-group-title">Spacing Scale</h3>';

    spacings.forEach(size => {
      const varName = `--space-${size}`;
      const value = styles.getPropertyValue(varName).trim();

      html += `
        <div class="token-item">
          <div class="token-swatch" style="width: ${value}; background: var(--color-primary);"></div>
          <div class="token-info">
            <div class="token-name">${varName}</div>
            <div class="token-value">${value}</div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  }

  renderTypographyTokens() {
    const container = document.getElementById('typography-tokens');
    if (!container) return;

    const sizes = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'];
    const weights = ['normal', 'medium', 'semibold', 'bold'];
    const styles = getComputedStyle(document.documentElement);

    let html = '<div class="token-group"><h3 class="ws-heading ws-heading--h5 token-group-title">Font Sizes</h3>';

    sizes.forEach(size => {
      const varName = `--font-size-${size}`;
      const value = styles.getPropertyValue(varName).trim();

      html += `
        <div class="token-item">
          <div class="token-text-preview">
            <span style="font-size: ${value};">Aa</span>
            <div class="token-info">
              <div class="token-name">${varName}</div>
              <div class="token-value">${value}</div>
            </div>
          </div>
        </div>
      `;
    });

    html += '</div><div class="token-group"><h3 class="ws-heading ws-heading--h5 token-group-title">Font Weights</h3>';

    weights.forEach(weight => {
      const varName = `--font-weight-${weight}`;
      const value = styles.getPropertyValue(varName).trim();

      html += `
        <div class="token-item">
          <div class="token-text-preview">
            <span style="font-weight: ${value};">Aa</span>
            <div class="token-info">
              <div class="token-name">${varName}</div>
              <div class="token-value">${value}</div>
            </div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  }

  renderBorderTokens() {
    const container = document.getElementById('border-tokens');
    if (!container) return;

    const radii = ['none', 's', 'm', 'l', 'xl', 'full'];
    const styles = getComputedStyle(document.documentElement);

    let html = '<div class="token-group"><h3 class="ws-heading ws-heading--h5 token-group-title">Border Radius</h3>';

    radii.forEach(radius => {
      const varName = `--radius-${radius}`;
      const value = styles.getPropertyValue(varName).trim();

      html += `
        <div class="token-item">
          <div class="token-swatch" style="border-radius: ${value}; background: var(--color-primary);"></div>
          <div class="token-info">
            <div class="token-name">${varName}</div>
            <div class="token-value">${value}</div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  }

  renderShadowTokens() {
    const container = document.getElementById('shadow-tokens');
    if (!container) return;

    const shadows = ['none', 'low', 'medium', 'high'];
    const styles = getComputedStyle(document.documentElement);

    let html = '<div class="token-group"><h3 class="ws-heading ws-heading--h5 token-group-title">Elevation (Shadows)</h3>';

    shadows.forEach(shadow => {
      const varName = `--shadow-${shadow}`;
      const value = styles.getPropertyValue(varName).trim();

      html += `
        <div class="token-item">
          <div class="token-swatch" style="box-shadow: ${value}; background: var(--color-surface-high);"></div>
          <div class="token-info">
            <div class="token-name">${varName}</div>
            <div class="token-value">${value || 'none'}</div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  }

  initializeComponentsPage() {
    // Setup copy buttons for code snippets
    this.setupCopyButtons();
  }

  initializeContainersPage() {
    this.setupCopyButtons();
  }

  initializeExamplesPage() {
    this.setupCopyButtons();
  }

  setupCopyButtons() {
    const copyBtns = document.querySelectorAll('.copy-btn');

    copyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const codeBlock = btn.closest('.demo-code').querySelector('code');
        const text = codeBlock.textContent;

        navigator.clipboard.writeText(text).then(() => {
          const originalText = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => {
            btn.textContent = originalText;
          }, 2000);
        });
      });
    });
  }

  loadInitialPage() {
    // Load tokens page by default
    this.navigateToPage('tokens');
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ShowcaseApp();
});
