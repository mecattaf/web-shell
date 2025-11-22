# WebShell UI Components

Minimal, unopinionated component library for building WebShell apps. These are wireframe-quality primitives that use design tokens but avoid prescribing specific design language.

## Features

- 🎨 **Design Token Based** - All styling uses CSS variables from the WebShell design system
- ⚛️ **React + Vanilla JS** - Use with React or plain JavaScript
- 📦 **TypeScript Support** - Full type definitions included
- ♿ **Accessible** - Built-in ARIA labels, keyboard navigation, and focus indicators
- 🖥️ **QtWebEngine Compatible** - Tested to work in Qt's web engine
- 🎯 **Minimal & Composable** - Small, focused components that work together

## Installation

The component library is built-in to WebShell. Simply import from `@/ui`:

```tsx
import { Button, Stack, Card } from '@/ui';
```

For vanilla JavaScript:

```js
import { Button, Stack, Card } from '@/ui/vanilla';
```

## Component Catalog

### Layout Components

#### Stack
Flex container with gap control for arranging items vertically or horizontally.

**React:**
```tsx
import { Stack, Button } from '@/ui';

function Example() {
  return (
    <Stack gap="m" align="center">
      <Button>First</Button>
      <Button>Second</Button>
    </Stack>
  );
}
```

**Vanilla:**
```js
import { Stack, Button } from '@/ui/vanilla';

const stack = Stack({
  gap: 'm',
  align: 'center',
  children: [
    Button({ children: 'First' }),
    Button({ children: 'Second' })
  ]
});
```

**Props:**
- `direction`: `'vertical'` | `'horizontal'` (default: `'vertical'`)
- `gap`: `'xs'` | `'s'` | `'m'` | `'l'` | `'xl'` (default: `'m'`)
- `align`: `'start'` | `'center'` | `'end'` | `'stretch'`
- `justify`: `'start'` | `'center'` | `'end'` | `'between'` | `'around'`

#### Grid
CSS Grid wrapper for creating grid-based layouts.

**React:**
```tsx
import { Grid, Card } from '@/ui';

function Example() {
  return (
    <Grid columns={3} gap="m">
      <Card>Item 1</Card>
      <Card>Item 2</Card>
      <Card>Item 3</Card>
    </Grid>
  );
}
```

**Props:**
- `columns`: `2` | `3` | `4`
- `gap`: `'xs'` | `'s'` | `'m'` | `'l'` (default: `'m'`)

#### Panel
Surface with elevation for creating raised panels.

**React:**
```tsx
import { Panel, Heading, Text } from '@/ui';

function Example() {
  return (
    <Panel elevation="high">
      <Heading level={3}>Panel Title</Heading>
      <Text>Panel content goes here</Text>
    </Panel>
  );
}
```

**Props:**
- `elevation`: `'none'` | `'low'` | `'medium'` | `'high'` (default: `'medium'`)

#### Surface
Basic container with theme background.

**React:**
```tsx
import { Surface } from '@/ui';

function Example() {
  return (
    <Surface variant="high">
      Content with themed background
    </Surface>
  );
}
```

**Props:**
- `variant`: `'default'` | `'high'` | `'highest'` | `'low'` (default: `'default'`)

### Typography Components

#### Text
Styled text with size and weight variants.

**React:**
```tsx
import { Text } from '@/ui';

function Example() {
  return (
    <>
      <Text size="l" weight="bold">Large bold text</Text>
      <Text variant="secondary" monospace>
        Secondary monospace text
      </Text>
    </>
  );
}
```

**Props:**
- `size`: `'xs'` | `'s'` | `'m'` | `'l'` | `'xl'` (default: `'m'`)
- `weight`: `'normal'` | `'medium'` | `'semibold'` | `'bold'` (default: `'normal'`)
- `variant`: `'default'` | `'secondary'` (default: `'default'`)
- `monospace`: `boolean` (default: `false`)
- `as`: `'p'` | `'span'` | `'div'` (default: `'p'`)

#### Heading
Semantic headings with appropriate sizing.

**React:**
```tsx
import { Heading } from '@/ui';

function Example() {
  return (
    <>
      <Heading level={1}>Page Title</Heading>
      <Heading level={2}>Section Title</Heading>
      <Heading level={3}>Subsection Title</Heading>
    </>
  );
}
```

**Props:**
- `level`: `1` | `2` | `3` | `4` | `5` | `6` (default: `2`)

### Control Components

#### Button
Interactive button with multiple visual variants.

**React:**
```tsx
import { Button } from '@/ui';

function Example() {
  return (
    <>
      <Button variant="primary" onClick={() => console.log('clicked')}>
        Primary Action
      </Button>
      <Button variant="secondary" size="small">
        Secondary
      </Button>
      <Button variant="ghost" disabled>
        Disabled
      </Button>
    </>
  );
}
```

**Props:**
- `variant`: `'primary'` | `'secondary'` | `'ghost'` (default: `'primary'`)
- `size`: `'small'` | `'medium'` | `'large'` (default: `'medium'`)
- `onClick`: `(event) => void`
- `disabled`: `boolean`
- `type`: `'button'` | `'submit'` | `'reset'` (default: `'button'`)

#### Input
Text input with optional label and helper text.

**React:**
```tsx
import { Input } from '@/ui';

function Example() {
  return (
    <Input
      label="Username"
      placeholder="Enter your username"
      helperText="Must be 3-20 characters"
    />
  );
}
```

**Props:**
- `label`: `string`
- `helperText`: `string`
- `placeholder`: `string`
- All standard HTML input attributes

#### Checkbox
Styled checkbox with optional label.

**React:**
```tsx
import { Checkbox } from '@/ui';

function Example() {
  return (
    <>
      <Checkbox label="Accept terms and conditions" />
      <Checkbox label="Subscribe to newsletter" defaultChecked />
    </>
  );
}
```

**Props:**
- `label`: `string`
- All standard HTML checkbox attributes

#### Select
Dropdown select with label and options.

**React:**
```tsx
import { Select } from '@/ui';

function Example() {
  const options = [
    { value: 'light', label: 'Light Theme' },
    { value: 'dark', label: 'Dark Theme' },
    { value: 'auto', label: 'Auto' },
  ];

  return (
    <Select
      label="Theme"
      options={options}
      defaultValue="dark"
    />
  );
}
```

**Props:**
- `label`: `string`
- `options`: `SelectOption[]` (array of `{ value, label, disabled? }`)
- All standard HTML select attributes

### Feedback Components

#### Card
Content container with optional interactivity.

**React:**
```tsx
import { Card, Heading, Text } from '@/ui';

function Example() {
  return (
    <Card interactive onClick={() => console.log('clicked')}>
      <Heading level={4}>Card Title</Heading>
      <Text>Card content with interactive hover effect</Text>
    </Card>
  );
}
```

**Props:**
- `interactive`: `boolean` (default: `false`) - Adds hover effects

#### List
Vertical list with items.

**React:**
```tsx
import { List } from '@/ui';

function Example() {
  return (
    <List>
      <List.Item>First item</List.Item>
      <List.Item interactive onClick={() => console.log('clicked')}>
        Interactive item
      </List.Item>
      <List.Item>Third item</List.Item>
    </List>
  );
}
```

**Props:**
- `List.Item` props:
  - `interactive`: `boolean` (default: `false`)

#### Divider
Visual separator for dividing content.

**React:**
```tsx
import { Divider, Stack } from '@/ui';

function Example() {
  return (
    <Stack>
      <div>Section 1</div>
      <Divider />
      <div>Section 2</div>
    </Stack>
  );
}
```

**Props:**
- `orientation`: `'horizontal'` | `'vertical'` (default: `'horizontal'`)

## Design Tokens

All components use CSS variables from the design token system. Available tokens:

### Colors
- `--color-surface`, `--color-surface-high`, `--color-surface-highest`, `--color-surface-low`
- `--color-text`, `--color-text-secondary`
- `--color-primary`, `--color-on-primary`
- `--color-secondary`, `--color-on-secondary`
- `--color-error`, `--color-warning`, `--color-success`, `--color-info`
- `--color-border`, `--color-border-focus`

### Spacing
- `--space-xs`, `--space-s`, `--space-m`, `--space-l`, `--space-xl`, `--space-xxl`

### Typography
- `--font-sans`, `--font-monospace`, `--font-heading`
- `--font-size-xs` through `--font-size-xxxl`
- `--font-weight-normal`, `--font-weight-medium`, `--font-weight-semibold`, `--font-weight-bold`
- `--line-height-tight`, `--line-height-normal`, `--line-height-relaxed`

### Elevation
- `--elevation-none`, `--elevation-low`, `--elevation-medium`, `--elevation-high`

### Border Radius
- `--radius-s`, `--radius-m`, `--radius-l`, `--radius-full`

### Animation
- `--duration-fast`, `--duration-normal`, `--duration-slow`
- `--easing-standard`, `--easing-decelerate`, `--easing-accelerate`

## QtWebEngine Compatibility

All components are tested to work in QtWebEngine. The following considerations were made:

- No bleeding-edge CSS features
- Tested transparent backgrounds
- Verified blur effects work
- Confirmed font rendering

## Accessibility

All components include built-in accessibility features:

- **ARIA labels** - Proper labeling for screen readers
- **Keyboard navigation** - Full keyboard support
- **Focus indicators** - Visible focus states using `outline`
- **Semantic HTML** - Using appropriate HTML elements

## Styling & Customization

### Using CSS Variables

You can customize components by overriding CSS variables:

```css
.my-custom-surface {
  --color-surface: #custom-color;
  --space-m: 20px;
}
```

### Custom Classes

All components accept a `className` prop for additional styling:

```tsx
<Button className="my-custom-button">Click me</Button>
```

### Direct Styling

Components also accept standard HTML attributes including `style`:

```tsx
<Card style={{ maxWidth: '400px' }}>Content</Card>
```

## Examples

### Complete Form

**React:**
```tsx
import { Stack, Input, Checkbox, Select, Button, Card, Heading } from '@/ui';

function LoginForm() {
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
  ];

  return (
    <Card>
      <Heading level={2}>Login</Heading>
      <Stack gap="m">
        <Input label="Email" type="email" placeholder="you@example.com" />
        <Input label="Password" type="password" />
        <Select label="Language" options={languageOptions} />
        <Checkbox label="Remember me" />
        <Button variant="primary" type="submit">Sign In</Button>
      </Stack>
    </Card>
  );
}
```

### Dashboard Layout

**React:**
```tsx
import { Grid, Panel, Heading, Text, Stack } from '@/ui';

function Dashboard() {
  return (
    <Grid columns={3} gap="l">
      <Panel elevation="low">
        <Stack gap="s">
          <Heading level={3}>Stats</Heading>
          <Text size="xl" weight="bold">1,234</Text>
          <Text variant="secondary">Total Users</Text>
        </Stack>
      </Panel>
      <Panel elevation="low">
        <Stack gap="s">
          <Heading level={3}>Revenue</Heading>
          <Text size="xl" weight="bold">$56,789</Text>
          <Text variant="secondary">This Month</Text>
        </Stack>
      </Panel>
      <Panel elevation="low">
        <Stack gap="s">
          <Heading level={3}>Growth</Heading>
          <Text size="xl" weight="bold">+23%</Text>
          <Text variant="secondary">vs Last Month</Text>
        </Stack>
      </Panel>
    </Grid>
  );
}
```

### Interactive List

**React:**
```tsx
import { List, Card, Heading } from '@/ui';

function TaskList() {
  const tasks = ['Review PRs', 'Update docs', 'Fix bug #123'];

  return (
    <Card>
      <Heading level={3}>Tasks</Heading>
      <List>
        {tasks.map((task, i) => (
          <List.Item
            key={i}
            interactive
            onClick={() => console.log('Clicked:', task)}
          >
            {task}
          </List.Item>
        ))}
      </List>
    </Card>
  );
}
```

## Contributing

This component library is part of the WebShell project. To add new components:

1. Add styles to `src/ui/styles/components.css`
2. Create React component in `src/ui/react/`
3. Create vanilla function in `src/ui/vanilla/components.js`
4. Update TypeScript definitions
5. Export from index files
6. Add documentation and examples

## License

Part of the WebShell project.
