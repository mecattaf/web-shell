/**
 * Tests for Theme Module Implementation
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ThemeModuleImpl } from './theme';
import { BridgeAdapter } from './bridge';
import type { Theme } from '../types';

// Mock BridgeAdapter
vi.mock('./bridge', () => {
  return {
    BridgeAdapter: class {
      private eventHandlers = new Map<string, Set<Function>>();
      call = vi.fn();
      on = vi.fn((event: string, handler: Function) => {
        if (!this.eventHandlers.has(event)) {
          this.eventHandlers.set(event, new Set());
        }
        this.eventHandlers.get(event)!.add(handler);
      });
      off = vi.fn();
      isReady = true;

      // Helper to emit events for testing
      _emit(event: string, data: any) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
          handlers.forEach(handler => handler(data));
        }
      }
    }
  };
});

const mockTheme: Theme = {
  colors: {
    surface: '#ffffff',
    surfaceHigh: '#f5f5f5',
    surfaceLow: '#fafafa',
    primary: '#0066cc',
    onPrimary: '#ffffff',
    primaryContainer: '#e6f0ff',
    onPrimaryContainer: '#001f3d',
    secondary: '#5c5c66',
    onSecondary: '#ffffff',
    secondaryContainer: '#e0e0e9',
    onSecondaryContainer: '#191923',
    tertiary: '#7d5260',
    onTertiary: '#ffffff',
    tertiaryContainer: '#ffd9e3',
    onTertiaryContainer: '#31111d',
    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#410002',
    background: '#fafafa',
    onBackground: '#1a1a1a',
    outline: '#767680',
    outlineVariant: '#c7c7d0'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontFamilyMono: 'Fira Code, monospace',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  radii: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px'
  }
};

describe('ThemeModuleImpl', () => {
  let bridge: any;
  let themeModule: ThemeModuleImpl;

  beforeEach(() => {
    bridge = new BridgeAdapter({} as any);
    themeModule = new ThemeModuleImpl(bridge);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize and fetch theme', async () => {
      bridge.call.mockResolvedValue(JSON.stringify(mockTheme));

      await themeModule.initialize();

      expect(bridge.call).toHaveBeenCalledWith('theme.getTheme');
      expect(bridge.on).toHaveBeenCalledWith('theme-change', expect.any(Function));
    });

    it('should use default theme if fetch fails', async () => {
      bridge.call.mockRejectedValue(new Error('Failed to fetch'));

      await themeModule.initialize();

      const theme = themeModule.getTheme();
      expect(theme).toBeDefined();
      expect(theme.colors).toBeDefined();
      expect(theme.spacing).toBeDefined();
    });

    it('should only initialize once', async () => {
      bridge.call.mockResolvedValue(JSON.stringify(mockTheme));

      await themeModule.initialize();
      await themeModule.initialize();

      expect(bridge.call).toHaveBeenCalledTimes(1);
    });
  });

  describe('theme access', () => {
    beforeEach(async () => {
      bridge.call.mockResolvedValue(JSON.stringify(mockTheme));
      await themeModule.initialize();
    });

    it('should get complete theme', () => {
      const theme = themeModule.getTheme();

      expect(theme).toEqual(mockTheme);
    });

    it('should get color tokens', () => {
      const colors = themeModule.getColors();

      expect(colors).toEqual(mockTheme.colors);
      expect(colors.primary).toBe('#0066cc');
    });

    it('should get spacing tokens', () => {
      const spacing = themeModule.getSpacing();

      expect(spacing).toEqual(mockTheme.spacing);
      expect(spacing.md).toBe('1rem');
    });

    it('should get typography tokens', () => {
      const typography = themeModule.getTypography();

      expect(typography).toEqual(mockTheme.typography);
      expect(typography.fontFamily).toBe('Inter, system-ui, sans-serif');
    });

    it('should get radii tokens', () => {
      const radii = themeModule.getRadii();

      expect(radii).toEqual(mockTheme.radii);
      expect(radii.md).toBe('0.5rem');
    });
  });

  describe('getter properties', () => {
    beforeEach(async () => {
      bridge.call.mockResolvedValue(JSON.stringify(mockTheme));
      await themeModule.initialize();
    });

    it('should access colors via getter', () => {
      expect(themeModule.colors).toEqual(mockTheme.colors);
    });

    it('should access spacing via getter', () => {
      expect(themeModule.spacing).toEqual(mockTheme.spacing);
    });

    it('should access typography via getter', () => {
      expect(themeModule.typography).toEqual(mockTheme.typography);
    });

    it('should access radii via getter', () => {
      expect(themeModule.radii).toEqual(mockTheme.radii);
    });
  });

  describe('theme change events', () => {
    beforeEach(async () => {
      bridge.call.mockResolvedValue(JSON.stringify(mockTheme));
      await themeModule.initialize();
    });

    it('should register theme change handler', () => {
      const handler = vi.fn();

      const unsubscribe = themeModule.onThemeChange(handler);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should call handler when theme changes', async () => {
      const handler = vi.fn();
      themeModule.onThemeChange(handler);

      const newTheme = { ...mockTheme, colors: { ...mockTheme.colors, primary: '#ff0000' } };
      bridge._emit('theme-change', JSON.stringify(newTheme));

      expect(handler).toHaveBeenCalledWith(newTheme);
    });

    it('should unsubscribe from theme changes', async () => {
      const handler = vi.fn();
      const unsubscribe = themeModule.onThemeChange(handler);

      unsubscribe();

      const newTheme = { ...mockTheme, colors: { ...mockTheme.colors, primary: '#ff0000' } };
      bridge._emit('theme-change', JSON.stringify(newTheme));

      expect(handler).not.toHaveBeenCalled();
    });

    it('should update current theme on theme change event', async () => {
      const newTheme = { ...mockTheme, colors: { ...mockTheme.colors, primary: '#ff0000' } };
      bridge._emit('theme-change', JSON.stringify(newTheme));

      const currentTheme = themeModule.getTheme();
      expect(currentTheme.colors.primary).toBe('#ff0000');
    });

    it('should handle multiple handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      themeModule.onThemeChange(handler1);
      themeModule.onThemeChange(handler2);

      const newTheme = { ...mockTheme, colors: { ...mockTheme.colors, primary: '#ff0000' } };
      bridge._emit('theme-change', JSON.stringify(newTheme));

      expect(handler1).toHaveBeenCalledWith(newTheme);
      expect(handler2).toHaveBeenCalledWith(newTheme);
    });

    it('should handle errors in change handlers gracefully', () => {
      const errorHandler = vi.fn(() => {
        throw new Error('Handler error');
      });
      const workingHandler = vi.fn();

      themeModule.onThemeChange(errorHandler);
      themeModule.onThemeChange(workingHandler);

      const newTheme = { ...mockTheme, colors: { ...mockTheme.colors, primary: '#ff0000' } };

      // Should not throw
      expect(() => {
        bridge._emit('theme-change', JSON.stringify(newTheme));
      }).not.toThrow();

      expect(workingHandler).toHaveBeenCalledWith(newTheme);
    });
  });

  describe('CSS variable injection', () => {
    let originalDocumentElement: HTMLElement;

    beforeEach(async () => {
      // Create a mock document element
      originalDocumentElement = document.documentElement;
      const mockRoot = document.createElement('div');
      Object.defineProperty(document, 'documentElement', {
        value: mockRoot,
        writable: true,
        configurable: true
      });

      bridge.call.mockResolvedValue(JSON.stringify(mockTheme));
      await themeModule.initialize();
    });

    afterEach(() => {
      Object.defineProperty(document, 'documentElement', {
        value: originalDocumentElement,
        writable: true,
        configurable: true
      });
    });

    it('should inject CSS variables on applyTheme', () => {
      themeModule.applyTheme();

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--color-primary')).toBe('#0066cc');
      expect(root.style.getPropertyValue('--space-md')).toBe('1rem');
      expect(root.style.getPropertyValue('--font-family')).toBe('Inter, system-ui, sans-serif');
    });

    it('should convert camelCase to kebab-case for color variables', () => {
      themeModule.applyTheme();

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--color-surface-high')).toBe('#f5f5f5');
      expect(root.style.getPropertyValue('--color-on-primary')).toBe('#ffffff');
    });

    it('should auto-apply theme on theme change event', () => {
      const newTheme = { ...mockTheme, colors: { ...mockTheme.colors, primary: '#ff0000' } };
      bridge._emit('theme-change', JSON.stringify(newTheme));

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--color-primary')).toBe('#ff0000');
    });
  });

  describe('default theme fallback', () => {
    it('should return default theme before initialization', () => {
      const theme = themeModule.getTheme();

      expect(theme).toBeDefined();
      expect(theme.colors).toBeDefined();
      expect(theme.spacing).toBeDefined();
      expect(theme.typography).toBeDefined();
      expect(theme.radii).toBeDefined();
    });

    it('should have all required color tokens in default theme', () => {
      const theme = themeModule.getTheme();

      expect(theme.colors.primary).toBeDefined();
      expect(theme.colors.surface).toBeDefined();
      expect(theme.colors.background).toBeDefined();
      expect(theme.colors.error).toBeDefined();
    });

    it('should have all required spacing tokens in default theme', () => {
      const theme = themeModule.getTheme();

      expect(theme.spacing.xs).toBeDefined();
      expect(theme.spacing.sm).toBeDefined();
      expect(theme.spacing.md).toBeDefined();
      expect(theme.spacing.lg).toBeDefined();
      expect(theme.spacing.xl).toBeDefined();
    });
  });
});
