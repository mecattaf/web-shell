/**
 * Manual Test Helper for WebShell Bridge
 *
 * Provides utilities for manual testing in QuickShell browser console
 * Usage: In QuickShell, open DevTools and run: window.testBridge()
 */

import { WebShellBridge } from '../bridge/webshell-bridge';

/**
 * Comprehensive bridge test that can be run manually
 */
export async function testBridge(): Promise<void> {
  console.log('=== WebShell Bridge Manual Test Suite ===\n');

  try {
    // Test 1: Initialization
    console.log('📝 Test 1: Bridge Initialization');
    const bridge = new WebShellBridge();
    await bridge.initialize();
    console.log('✅ Bridge initialized successfully');
    console.log('   Ready state:', bridge.ready);
    console.log('');

    // Test 2: Echo method
    console.log('📝 Test 2: Echo Method');
    const echoResult = await bridge.echo('Hello from manual test!');
    console.log('✅ Echo result:', echoResult);
    console.log('');

    // Test 3: Generic call
    console.log('📝 Test 3: Generic Call Method');
    const callResult = await bridge.call('testMethod', {
      param1: 'value1',
      param2: 42,
      param3: true,
    });
    console.log('✅ Call result:', callResult);
    console.log('');

    // Test 4: Bridge info
    console.log('📝 Test 4: Bridge Info');
    const info = await bridge.getBridgeInfo();
    console.log('✅ Bridge info:', info);
    console.log('');

    // Test 5: Event handling
    console.log('📝 Test 5: Event Handlers');
    let eventReceived = false;
    bridge.on('testEvent', (data) => {
      console.log('✅ Event received:', data);
      eventReceived = true;
    });
    console.log('   Event handler registered');
    console.log('   (Note: To test, QML must emit: bridge.emitEvent("testEvent", {...}))');
    console.log('');

    // Test 6: Performance test
    console.log('📝 Test 6: Performance Test (10 calls)');
    const perfStart = performance.now();
    const promises = Array.from({ length: 10 }, (_, i) =>
      bridge.echo(`Performance test ${i}`)
    );
    await Promise.all(promises);
    const perfEnd = performance.now();
    const avgTime = (perfEnd - perfStart) / 10;
    console.log(`✅ 10 concurrent calls completed in ${(perfEnd - perfStart).toFixed(2)}ms`);
    console.log(`   Average per call: ${avgTime.toFixed(2)}ms`);

    if (avgTime > 50) {
      console.warn('⚠️  Warning: Average call time exceeds 50ms target');
    }
    console.log('');

    // Test 7: Multiple instance support
    console.log('📝 Test 7: Multiple Bridge Instances');
    const bridge2 = new WebShellBridge();
    await bridge2.initialize();
    const result2 = await bridge2.echo('Second bridge instance');
    console.log('✅ Second bridge instance working:', result2);
    console.log('');

    // Summary
    console.log('=== Test Summary ===');
    console.log('✅ All manual tests passed!');
    console.log('');
    console.log('📊 Available Test Utilities:');
    console.log('   window.testBridge()           - Run this test suite');
    console.log('   window.measureBridgeLatency() - Measure call latency');
    console.log('   window.testConcurrency()      - Test concurrent calls');
    console.log('   window.testMemoryUsage()      - Check for memory leaks');
    console.log('');

    // Return bridge for further testing
    (window as any).__testBridge = bridge;
    console.log('💡 Bridge instance saved to: window.__testBridge');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

/**
 * Measure bridge call latency
 */
export async function measureBridgeLatency(
  iterations: number = 100
): Promise<void> {
  console.log(`📊 Measuring latency over ${iterations} iterations...\n`);

  const bridge = (window as any).__testBridge || new WebShellBridge();
  if (!bridge.ready) {
    await bridge.initialize();
  }

  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await bridge.echo(`test ${i}`);
    const end = performance.now();
    times.push(end - start);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];

  // Calculate standard deviation
  const variance =
    times.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / times.length;
  const stdDev = Math.sqrt(variance);

  console.log('📊 Latency Statistics:');
  console.log(`   Average:  ${avg.toFixed(2)}ms`);
  console.log(`   Median:   ${median.toFixed(2)}ms`);
  console.log(`   Min:      ${min.toFixed(2)}ms`);
  console.log(`   Max:      ${max.toFixed(2)}ms`);
  console.log(`   Std Dev:  ${stdDev.toFixed(2)}ms`);
  console.log('');

  if (avg < 50) {
    console.log('✅ Performance target met (<50ms average)');
  } else {
    console.warn('⚠️  Warning: Average latency exceeds 50ms target');
  }
}

/**
 * Test concurrent call handling
 */
export async function testConcurrency(count: number = 50): Promise<void> {
  console.log(`📊 Testing ${count} concurrent calls...\n`);

  const bridge = (window as any).__testBridge || new WebShellBridge();
  if (!bridge.ready) {
    await bridge.initialize();
  }

  const start = performance.now();

  const promises = Array.from({ length: count }, (_, i) =>
    bridge.echo(`concurrent test ${i}`)
  );

  const results = await Promise.all(promises);
  const end = performance.now();
  const duration = end - start;

  console.log('📊 Concurrency Test Results:');
  console.log(`   Total time:     ${duration.toFixed(2)}ms`);
  console.log(`   Avg per call:   ${(duration / count).toFixed(2)}ms`);
  console.log(`   Calls/second:   ${((count / duration) * 1000).toFixed(2)}`);
  console.log(`   Success count:  ${results.length}/${count}`);
  console.log('');

  const allSuccessful = results.every(r => r && r.success);
  if (allSuccessful) {
    console.log('✅ All concurrent calls completed successfully');
  } else {
    console.error('❌ Some concurrent calls failed');
  }
}

/**
 * Test for memory leaks
 */
export async function testMemoryUsage(iterations: number = 1000): Promise<void> {
  console.log(`📊 Testing memory usage over ${iterations} operations...\n`);

  // Check if memory API is available
  if (!(performance as any).memory) {
    console.warn('⚠️  Performance.memory API not available');
    console.log('   (Enable Precise Memory Info in Chrome flags)');
    return;
  }

  const bridge = (window as any).__testBridge || new WebShellBridge();
  if (!bridge.ready) {
    await bridge.initialize();
  }

  // Force garbage collection if available
  if ((window as any).gc) {
    (window as any).gc();
  }

  const memBefore = (performance as any).memory.usedJSHeapSize;

  for (let i = 0; i < iterations; i++) {
    await bridge.echo(`memory test ${i}`);

    // Log progress every 100 iterations
    if ((i + 1) % 100 === 0) {
      console.log(`   Progress: ${i + 1}/${iterations}`);
    }
  }

  // Force garbage collection again
  if ((window as any).gc) {
    (window as any).gc();
  }

  const memAfter = (performance as any).memory.usedJSHeapSize;
  const growth = memAfter - memBefore;
  const growthMB = (growth / 1024 / 1024).toFixed(2);
  const growthPercent = ((growth / memBefore) * 100).toFixed(2);

  console.log('📊 Memory Usage Results:');
  console.log(`   Before:       ${(memBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   After:        ${(memAfter / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Growth:       ${growthMB} MB (${growthPercent}%)`);
  console.log(`   Per operation: ${(growth / iterations).toFixed(0)} bytes`);
  console.log('');

  if (growth < memBefore * 0.1) {
    console.log('✅ Memory usage is acceptable (<10% growth)');
  } else if (growth < memBefore * 0.25) {
    console.log('⚠️  Memory usage is borderline (10-25% growth)');
  } else {
    console.warn('❌ Possible memory leak detected (>25% growth)');
  }
}

/**
 * Initialize manual test utilities
 * Attaches test functions to window object for easy console access
 */
export function initManualTestUtils(): void {
  if (typeof window !== 'undefined') {
    (window as any).testBridge = testBridge;
    (window as any).measureBridgeLatency = measureBridgeLatency;
    (window as any).testConcurrency = testConcurrency;
    (window as any).testMemoryUsage = testMemoryUsage;

    console.log('🔧 WebShell Bridge test utilities loaded!');
    console.log('   Run: window.testBridge() to start manual testing');
  }
}
