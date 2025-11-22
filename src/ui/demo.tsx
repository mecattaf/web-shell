/**
 * Component Library Demo
 *
 * Showcases all WebShell UI components for testing and reference
 */

import React, { useState } from 'react';
import {
  Stack,
  Grid,
  Panel,
  Surface,
  Text,
  Heading,
  Button,
  Input,
  Checkbox,
  Select,
  Card,
  List,
  Divider,
} from './react';
import './styles/components.css';

export function ComponentDemo() {
  const [inputValue, setInputValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [selectValue, setSelectValue] = useState('option1');

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  return (
    <Stack gap="xl" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Heading level={1}>WebShell UI Components Demo</Heading>
      <Text variant="secondary">
        Minimal, unopinionated component library for building WebShell apps
      </Text>

      <Divider />

      {/* Layout Components */}
      <Stack gap="m">
        <Heading level={2}>Layout Components</Heading>

        <Panel>
          <Stack gap="m">
            <Heading level={3}>Stack (Vertical & Horizontal)</Heading>
            <Stack gap="s">
              <Text weight="medium">Vertical Stack:</Text>
              <Stack gap="s">
                <Button variant="primary" size="small">Button 1</Button>
                <Button variant="secondary" size="small">Button 2</Button>
                <Button variant="ghost" size="small">Button 3</Button>
              </Stack>
            </Stack>

            <Stack gap="s">
              <Text weight="medium">Horizontal Stack:</Text>
              <Stack direction="horizontal" gap="s">
                <Button variant="primary" size="small">Button 1</Button>
                <Button variant="secondary" size="small">Button 2</Button>
                <Button variant="ghost" size="small">Button 3</Button>
              </Stack>
            </Stack>
          </Stack>
        </Panel>

        <Panel>
          <Stack gap="m">
            <Heading level={3}>Grid</Heading>
            <Grid columns={3} gap="m">
              <Card>Grid Item 1</Card>
              <Card>Grid Item 2</Card>
              <Card>Grid Item 3</Card>
            </Grid>
          </Stack>
        </Panel>

        <Panel>
          <Stack gap="m">
            <Heading level={3}>Panel with Elevations</Heading>
            <Grid columns={4} gap="m">
              <Panel elevation="none">
                <Text size="s">None</Text>
              </Panel>
              <Panel elevation="low">
                <Text size="s">Low</Text>
              </Panel>
              <Panel elevation="medium">
                <Text size="s">Medium</Text>
              </Panel>
              <Panel elevation="high">
                <Text size="s">High</Text>
              </Panel>
            </Grid>
          </Stack>
        </Panel>

        <Panel>
          <Stack gap="m">
            <Heading level={3}>Surface Variants</Heading>
            <Stack gap="s">
              <Surface variant="default">
                <Text size="s">Default Surface</Text>
              </Surface>
              <Surface variant="low">
                <Text size="s">Low Surface</Text>
              </Surface>
              <Surface variant="high">
                <Text size="s">High Surface</Text>
              </Surface>
              <Surface variant="highest">
                <Text size="s">Highest Surface</Text>
              </Surface>
            </Stack>
          </Stack>
        </Panel>
      </Stack>

      <Divider />

      {/* Typography Components */}
      <Stack gap="m">
        <Heading level={2}>Typography Components</Heading>

        <Panel>
          <Stack gap="m">
            <Heading level={3}>Headings</Heading>
            <Stack gap="s">
              <Heading level={1}>Heading 1</Heading>
              <Heading level={2}>Heading 2</Heading>
              <Heading level={3}>Heading 3</Heading>
              <Heading level={4}>Heading 4</Heading>
              <Heading level={5}>Heading 5</Heading>
              <Heading level={6}>Heading 6</Heading>
            </Stack>
          </Stack>
        </Panel>

        <Panel>
          <Stack gap="m">
            <Heading level={3}>Text Sizes & Weights</Heading>
            <Stack gap="s">
              <Text size="xs">Extra small text</Text>
              <Text size="s">Small text</Text>
              <Text size="m">Medium text (default)</Text>
              <Text size="l">Large text</Text>
              <Text size="xl">Extra large text</Text>
              <Divider />
              <Text weight="normal">Normal weight</Text>
              <Text weight="medium">Medium weight</Text>
              <Text weight="semibold">Semibold weight</Text>
              <Text weight="bold">Bold weight</Text>
              <Divider />
              <Text variant="secondary">Secondary text variant</Text>
              <Text monospace>Monospace text for code</Text>
            </Stack>
          </Stack>
        </Panel>
      </Stack>

      <Divider />

      {/* Control Components */}
      <Stack gap="m">
        <Heading level={2}>Control Components</Heading>

        <Panel>
          <Stack gap="m">
            <Heading level={3}>Buttons</Heading>
            <Stack gap="s">
              <Text weight="medium">Variants:</Text>
              <Stack direction="horizontal" gap="s">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
              </Stack>

              <Text weight="medium">Sizes:</Text>
              <Stack direction="horizontal" gap="s">
                <Button size="small">Small</Button>
                <Button size="medium">Medium</Button>
                <Button size="large">Large</Button>
              </Stack>

              <Text weight="medium">States:</Text>
              <Stack direction="horizontal" gap="s">
                <Button>Enabled</Button>
                <Button disabled>Disabled</Button>
              </Stack>
            </Stack>
          </Stack>
        </Panel>

        <Panel>
          <Stack gap="m">
            <Heading level={3}>Input</Heading>
            <Input
              label="Text Input"
              placeholder="Enter some text..."
              helperText="This is helper text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Text size="s" variant="secondary">
              Current value: {inputValue || '(empty)'}
            </Text>
          </Stack>
        </Panel>

        <Panel>
          <Stack gap="m">
            <Heading level={3}>Checkbox</Heading>
            <Checkbox
              label="Checkbox with label"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <Checkbox label="Unchecked checkbox" />
            <Checkbox label="Disabled checkbox" disabled />
            <Text size="s" variant="secondary">
              First checkbox is: {checked ? 'checked' : 'unchecked'}
            </Text>
          </Stack>
        </Panel>

        <Panel>
          <Stack gap="m">
            <Heading level={3}>Select</Heading>
            <Select
              label="Dropdown Select"
              options={selectOptions}
              value={selectValue}
              onChange={(e) => setSelectValue(e.target.value)}
            />
            <Text size="s" variant="secondary">
              Selected: {selectValue}
            </Text>
          </Stack>
        </Panel>
      </Stack>

      <Divider />

      {/* Feedback Components */}
      <Stack gap="m">
        <Heading level={2}>Feedback Components</Heading>

        <Panel>
          <Stack gap="m">
            <Heading level={3}>Cards</Heading>
            <Grid columns={2} gap="m">
              <Card>
                <Stack gap="s">
                  <Heading level={4}>Basic Card</Heading>
                  <Text size="s">A simple card component</Text>
                </Stack>
              </Card>
              <Card interactive onClick={() => alert('Card clicked!')}>
                <Stack gap="s">
                  <Heading level={4}>Interactive Card</Heading>
                  <Text size="s">Hover over me and click!</Text>
                </Stack>
              </Card>
            </Grid>
          </Stack>
        </Panel>

        <Panel>
          <Stack gap="m">
            <Heading level={3}>List</Heading>
            <List>
              <List.Item>Regular list item 1</List.Item>
              <List.Item>Regular list item 2</List.Item>
              <List.Item interactive onClick={() => alert('Item clicked!')}>
                Interactive list item (click me!)
              </List.Item>
              <List.Item>Regular list item 4</List.Item>
            </List>
          </Stack>
        </Panel>

        <Panel>
          <Stack gap="m">
            <Heading level={3}>Dividers</Heading>
            <Text>Content above divider</Text>
            <Divider />
            <Text>Content below horizontal divider</Text>
            <Stack direction="horizontal" gap="m" style={{ minHeight: '50px' }}>
              <Text>Left content</Text>
              <Divider orientation="vertical" />
              <Text>Right content</Text>
            </Stack>
          </Stack>
        </Panel>
      </Stack>

      <Divider />

      {/* Complete Example */}
      <Stack gap="m">
        <Heading level={2}>Complete Example: User Profile Form</Heading>
        <Panel elevation="high">
          <Stack gap="m">
            <Heading level={3}>Edit Profile</Heading>
            <Input label="Name" placeholder="John Doe" />
            <Input label="Email" type="email" placeholder="john@example.com" />
            <Select
              label="Role"
              options={[
                { value: 'user', label: 'User' },
                { value: 'admin', label: 'Administrator' },
                { value: 'moderator', label: 'Moderator' },
              ]}
            />
            <Checkbox label="Receive email notifications" />
            <Checkbox label="Make profile public" />
            <Stack direction="horizontal" gap="s">
              <Button variant="primary">Save Changes</Button>
              <Button variant="ghost">Cancel</Button>
            </Stack>
          </Stack>
        </Panel>
      </Stack>
    </Stack>
  );
}

export default ComponentDemo;
