/**
 * WebShell UI Components
 *
 * Minimal, unopinionated component library for building WebShell apps
 *
 * @example React
 * ```tsx
 * import { Button, Stack, Card } from '@/ui';
 *
 * function App() {
 *   return (
 *     <Stack gap="m">
 *       <Card>
 *         <Button variant="primary">Click me</Button>
 *       </Card>
 *     </Stack>
 *   );
 * }
 * ```
 *
 * @example Vanilla JS
 * ```js
 * import { Button, Stack, Card } from '@/ui/vanilla';
 *
 * const app = Stack({
 *   gap: 'm',
 *   children: [
 *     Card({
 *       children: Button({
 *         variant: 'primary',
 *         children: 'Click me'
 *       })
 *     })
 *   ]
 * });
 *
 * document.body.appendChild(app);
 * ```
 */

// Re-export React components as default
export * from './react';

// Vanilla components available at @/ui/vanilla
// TypeScript definitions available for vanilla at @/ui/vanilla/components.d.ts
