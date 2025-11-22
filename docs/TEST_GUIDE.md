# WebShell Bridge Test Guide

Comprehensive guide for testing the WebShell QtWebChannel bridge implementation.

## Table of Contents

1. [Running Tests](#running-tests)
2. [Test Structure](#test-structure)
3. [Writing New Tests](#writing-new-tests)
4. [Manual Testing](#manual-testing)
5. [Performance Testing](#performance-testing)
6. [Troubleshooting](#troubleshooting)

## Running Tests

### Quick Start

```bash
# Run all tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Scripts

- `npm test` - Run tests in watch mode (re-runs on file changes)
- `npm run test:run` - Run tests once and exit
- `npm run test:ui` - Open Vitest UI in browser
- `npm run test:coverage` - Generate coverage report

## Test Structure

### Test Organization

```
src/
├── bridge/
│   ├── webshell-bridge.ts         # Bridge implementation
│   └── webshell-bridge.test.ts    # Bridge tests
└── test/
    ├── setup.ts                    # Test environment setup
    └── mocks/
        └── qwebchannel.ts          # Qt environment mocks
```

### Test Categories

The bridge test suite includes:

#### 1. **Initialization Tests**
- Bridge initialization in Qt environment
- Error handling when Qt is unavailable
- Script loading failures
- Re-initialization protection
- Ready state management

#### 2. **Method Call Tests** (JS → QML)
- Echo method calls
- Generic call method
- Bridge info retrieval
- Pre-initialization error handling
- Concurrent call handling

#### 3. **Signal Handling Tests** (QML → JS)
- Custom event handlers
- Event handler registration/removal
- Multiple handlers per event
- Handler cleanup

#### 4. **Error Condition Tests**
- Missing bridge object
- Uninitialized bridge usage
- Invalid parameters
- Timeout scenarios

#### 5. **Performance Tests**
- Single call latency (<50ms target)
- Concurrent call throughput
- Performance consistency
- Memory leak detection

#### 6. **Edge Case Tests**
- Empty parameters
- Large payloads
- Special characters
- Unicode support

## Writing New Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WebShellBridge } from './webshell-bridge';
import { setupMockQtEnvironment } from '../test/mocks/qwebchannel';

describe('My Feature', () => {
  let cleanup: (() => void) | null = null;
  let bridge: WebShellBridge;

  beforeEach(async () => {
    const { cleanup: cleanupFn } = setupMockQtEnvironment();
    cleanup = cleanupFn;

    bridge = new WebShellBridge();
    await bridge.initialize();
  });

  afterEach(() => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  });

  it('does something correctly', async () => {
    const result = await bridge.echo('test');
    expect(result).toHaveProperty('success', true);
  });
});
```

### Mock Utilities

#### `setupMockQtEnvironment()`
Sets up a complete Qt environment with QWebChannel mock.

```typescript
const { cleanup, getBridge } = setupMockQtEnvironment();
// ... run tests
cleanup(); // Clean up after tests
```

#### `setupNoQtEnvironment()`
Simulates environment where Qt is not available (error testing).

```typescript
const { cleanup } = setupNoQtEnvironment();
// Test error handling
cleanup();
```

#### `setupFailedScriptLoad()`
Simulates qwebchannel.js script load failure.

```typescript
const { cleanup } = setupFailedScriptLoad();
// Test script loading errors
cleanup();
```

#### `createMockBridge()`
Creates a standalone mock bridge object for direct testing.

```typescript
const mockBridge = createMockBridge();
mockBridge.echo('test', (result) => {
  console.log(result);
});
```

### Test Patterns

#### Testing Async Operations

```typescript
it('handles async operations', async () => {
  const result = await bridge.call('method', params);
  expect(result).toBeDefined();
});
```

#### Testing Event Handlers

```typescript
it('receives events', async () => {
  return new Promise<void>((resolve) => {
    bridge.on('testEvent', (data) => {
      expect(data).toBeDefined();
      resolve();
    });
    // Trigger event...
  });
});
```

#### Testing Errors

```typescript
it('throws on invalid input', async () => {
  await expect(bridge.call('invalid')).rejects.toThrow('Expected error');
});
```

#### Performance Testing

```typescript
it('completes within time limit', async () => {
  const start = performance.now();
  await bridge.echo('test');
  const duration = performance.now() - start;

  expect(duration).toBeLessThan(50);
});
```

## Manual Testing

### Browser Console Testing

When running the app in QuickShell:

1. Launch QuickShell: `quickshell -p quickshell/`
2. Open DevTools (F12)
3. Run manual tests:

```javascript
// Test bridge initialization
const bridge = new WebShellBridge();
await bridge.initialize();

// Test echo
const result = await bridge.echo('Hello from console!');
console.log(result);

// Test generic call
const callResult = await bridge.call('myMethod', { param: 'value' });
console.log(callResult);

// Test event handling
bridge.on('testEvent', (data) => {
  console.log('Received event:', data);
});

// Test bridge info
const info = await bridge.getBridgeInfo();
console.log(info);
```

### Manual Test Checklist

From the task specification:

- [ ] Bridge initializes successfully
- [ ] Can call QML from JS
- [ ] Can receive signals from QML
- [ ] Handles errors gracefully
- [ ] Performs adequately (<50ms per call)
- [ ] No memory leaks
- [ ] Works with multiple instances

### Performance Testing

#### Single Call Latency

```javascript
async function measureLatency(iterations = 100) {
  const times = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await bridge.echo('test');
    times.push(performance.now() - start);
  }

  const avg = times.reduce((a, b) => a + b) / times.length;
  const max = Math.max(...times);
  const min = Math.min(...times);

  console.log(`Avg: ${avg.toFixed(2)}ms, Min: ${min.toFixed(2)}ms, Max: ${max.toFixed(2)}ms`);
}

await measureLatency();
```

#### Concurrent Calls

```javascript
async function testConcurrency(count = 50) {
  const start = performance.now();
  const promises = Array.from({ length: count }, (_, i) =>
    bridge.echo(`message ${i}`)
  );

  await Promise.all(promises);
  const duration = performance.now() - start;

  console.log(`${count} concurrent calls completed in ${duration.toFixed(2)}ms`);
  console.log(`Average per call: ${(duration / count).toFixed(2)}ms`);
}

await testConcurrency();
```

#### Memory Leak Testing

```javascript
async function testMemoryUsage(iterations = 1000) {
  if (!performance.memory) {
    console.warn('Memory API not available');
    return;
  }

  const before = performance.memory.usedJSHeapSize;

  for (let i = 0; i < iterations; i++) {
    await bridge.echo(`test ${i}`);
  }

  const after = performance.memory.usedJSHeapSize;
  const growth = after - before;
  const growthMB = (growth / 1024 / 1024).toFixed(2);

  console.log(`Memory growth after ${iterations} operations: ${growthMB}MB`);
}

await testMemoryUsage();
```

## Coverage Reports

After running `npm run test:coverage`, open `coverage/index.html` in a browser to view detailed coverage reports.

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Troubleshooting

### Common Issues

#### Tests Fail with "Qt not available"

Make sure you're using the mock environment:

```typescript
const { cleanup } = setupMockQtEnvironment();
```

#### Tests timeout

Increase the timeout in your test:

```typescript
it('long running test', async () => {
  // test code
}, { timeout: 10000 }); // 10 second timeout
```

#### Mock not working correctly

Ensure cleanup is called:

```typescript
afterEach(() => {
  if (cleanup) {
    cleanup();
    cleanup = null;
  }
});
```

#### Performance tests inconsistent

Performance tests can be affected by system load. Consider:
- Running tests on a quiet system
- Increasing time thresholds slightly
- Running multiple times to average results

### Debugging Tests

Enable verbose logging:

```typescript
import { vi } from 'vitest';

const consoleLogSpy = vi.spyOn(console, 'log');
// ... run tests
console.log(consoleLogSpy.mock.calls); // See all console.log calls
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Best Practices

1. **Always clean up**: Use `afterEach` to cleanup mock environments
2. **Test isolation**: Each test should be independent
3. **Descriptive names**: Test names should clearly describe what is being tested
4. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification
5. **Test edge cases**: Don't just test the happy path
6. **Performance awareness**: Be mindful of test execution time
7. **Mock appropriately**: Use mocks to isolate units under test

## References

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Docs](https://testing-library.com/)
- [Qt WebChannel Documentation](https://doc.qt.io/qt-6/qtwebchannel-index.html)
- [WebShell Bridge Implementation](../src/bridge/webshell-bridge.ts)

---

**Last Updated**: 2025-01-18
**Version**: 1.0.0
