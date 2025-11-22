# QuickShell Tests

This directory contains QML test suites for WebShell components.

## Running Tests

To run the QML tests, you'll need QuickShell or Qt Test framework:

```bash
# Using qmltestrunner (if Qt is installed)
qmltestrunner -input ManifestParserTest.qml

# Or using QuickShell test runner
quickshell --test ManifestParserTest.qml
```

## Test Files

- **ManifestParserTest.qml** - Tests for the ManifestParser service
  - Validates manifest parsing
  - Tests error handling
  - Verifies permission checking

## Writing New Tests

Follow the QtTest framework conventions:

```qml
import QtQuick
import QtTest

TestCase {
    name: "MyTest"

    function test_something() {
        compare(actual, expected);
        verify(condition);
    }
}
```
