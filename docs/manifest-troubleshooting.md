# Manifest Troubleshooting

This guide helps you diagnose and fix common issues with WebShell manifests.

## Common Errors

### Missing Required Field

#### Error: "Missing required field: version"

**Cause**: The manifest is missing the `version` field.

**Solution**: Add the `version` field:

```json
{
  "version": "1.0.0",
  "name": "my-app",
  "entrypoint": "index.html"
}
```

---

#### Error: "Missing required field: name"

**Cause**: The manifest is missing the `name` field.

**Solution**: Add a valid app name:

```json
{
  "version": "1.0.0",
  "name": "my-app",
  "entrypoint": "index.html"
}
```

---

#### Error: "Missing required field: entrypoint"

**Cause**: The manifest is missing the `entrypoint` field.

**Solution**: Add the path to your main HTML file:

```json
{
  "version": "1.0.0",
  "name": "my-app",
  "entrypoint": "index.html"
}
```

---

### Invalid Field Values

#### Error: "Invalid app name format"

**Cause**: App name contains uppercase letters, spaces, or special characters.

**Incorrect**:
```json
{
  "name": "MyApp"
}

{
  "name": "my app"
}

{
  "name": "my_app!"
}
```

**Solution**: Use only lowercase alphanumeric characters and hyphens:

```json
{
  "name": "my-app"
}
```

**Valid Examples**:
- `calendar`
- `email-client`
- `task-manager-2`

---

#### Error: "Invalid version format"

**Cause**: Version doesn't follow semantic versioning.

**Incorrect**:
```json
{
  "version": "v1"
}

{
  "version": "1"
}

{
  "version": "latest"
}
```

**Solution**: Use semantic versioning (MAJOR.MINOR.PATCH):

```json
{
  "version": "1.0.0"
}

{
  "version": "2.1.3"
}

{
  "version": "1.0.0-beta.1"
}
```

---

#### Error: "Entrypoint must end with .html or .htm"

**Cause**: Entrypoint file doesn't have a valid HTML extension.

**Incorrect**:
```json
{
  "entrypoint": "index.js"
}

{
  "entrypoint": "main"
}
```

**Solution**: Point to an HTML file:

```json
{
  "entrypoint": "index.html"
}

{
  "entrypoint": "dist/index.html"
}
```

---

### File Not Found Errors

#### Error: "Entrypoint file not found: index.html"

**Cause**: The specified entrypoint file doesn't exist at the given path.

**Diagnosis**:
1. Check file exists: `ls index.html`
2. Verify path is relative to manifest
3. Check file permissions

**Solution**: Ensure the entrypoint file exists:

```bash
# If your project structure is:
# /my-app/
#   ├── webshell.json
#   ├── src/
#   │   └── index.html

# Your manifest should use:
{
  "entrypoint": "src/index.html"
}
```

---

#### Error: "Icon file not found: icon.svg"

**Cause**: The specified icon file doesn't exist.

**Solution**: Either create the icon file or remove the icon field:

```json
{
  "icon": "assets/icon.svg"
}
```

Or omit the field:

```json
{
  "version": "1.0.0",
  "name": "my-app",
  "entrypoint": "index.html"
  // No icon field - will use default
}
```

---

### Permission Errors

#### Error: "Permission denied: calendar.read"

**Cause**: App is trying to read calendar events without permission.

**Solution**: Add the permission to your manifest:

```json
{
  "permissions": {
    "calendar": {
      "read": true
    }
  }
}
```

---

#### Error: "Permission denied: calendar.write"

**Cause**: App is trying to write calendar events without permission.

**Solution**: Add write permission:

```json
{
  "permissions": {
    "calendar": {
      "read": true,
      "write": true
    }
  }
}
```

---

#### Error: "Permission denied: filesystem.read for /home/user/Documents/file.txt"

**Cause**: App is trying to read a file outside allowed paths.

**Diagnosis**: Check your current filesystem permissions:

```json
{
  "permissions": {
    "filesystem": {
      "read": ["~/Downloads"]  // Only Downloads allowed
    }
  }
}
```

**Solution**: Add the required path:

```json
{
  "permissions": {
    "filesystem": {
      "read": ["~/Documents", "~/Downloads"]
    }
  }
}
```

---

#### Error: "Permission denied: filesystem.write for /home/user/Documents/file.txt"

**Cause**: App is trying to write to a file outside allowed write paths.

**Solution**: Add the path to allowed write paths:

```json
{
  "permissions": {
    "filesystem": {
      "read": ["~/Documents"],
      "write": ["~/Documents"]
    }
  }
}
```

---

#### Error: "Permission denied: network access to api.example.com"

**Cause**: App is trying to access a network host not in the allowed list.

**Solution**: Add the host to allowed hosts:

```json
{
  "permissions": {
    "network": {
      "allowed_hosts": ["api.example.com"]
    }
  }
}
```

---

#### Error: "Permission denied: network access to localhost"

**Cause**: Localhost access must be explicitly granted.

**Solution**: Add localhost to allowed hosts:

```json
{
  "permissions": {
    "network": {
      "allowed_hosts": ["localhost"]
    }
  }
}
```

**Note**: `localhost`, `127.0.0.1`, and `::1` all require explicit permission.

---

#### Error: "Permission denied: notifications.send"

**Cause**: App is trying to send notifications without permission.

**Solution**: Add notification permission:

```json
{
  "permissions": {
    "notifications": {
      "send": true
    }
  }
}
```

---

#### Error: "Permission denied: processes.spawn"

**Cause**: App is trying to spawn a process without permission.

**Solution**: Add process spawn permission with allowed commands:

```json
{
  "permissions": {
    "processes": {
      "spawn": true,
      "allowed_commands": ["git", "npm", "node"]
    }
  }
}
```

---

#### Error: "Command not allowed: python"

**Cause**: App is trying to spawn a command not in the allowed list.

**Current Config**:
```json
{
  "permissions": {
    "processes": {
      "spawn": true,
      "allowed_commands": ["git", "npm"]
    }
  }
}
```

**Solution**: Add the command to allowed list:

```json
{
  "permissions": {
    "processes": {
      "spawn": true,
      "allowed_commands": ["git", "npm", "python"]
    }
  }
}
```

---

### Window Configuration Issues

#### Error: "Window width must be between 100 and 7680"

**Cause**: Window width is outside valid range.

**Incorrect**:
```json
{
  "window": {
    "width": 50
  }
}
```

**Solution**: Use valid width range (100-7680 pixels):

```json
{
  "window": {
    "width": 800
  }
}
```

---

#### Error: "Window height must be between 100 and 4320"

**Cause**: Window height is outside valid range.

**Solution**: Use valid height range (100-4320 pixels):

```json
{
  "window": {
    "height": 600
  }
}
```

---

#### Error: "minWidth cannot be greater than width"

**Cause**: Constraint violation in window dimensions.

**Incorrect**:
```json
{
  "window": {
    "width": 400,
    "minWidth": 600
  }
}
```

**Solution**: Ensure minWidth ≤ width ≤ maxWidth:

```json
{
  "window": {
    "width": 800,
    "minWidth": 400,
    "maxWidth": 1920
  }
}
```

---

#### Error: "Invalid window type: 'floating'"

**Cause**: Window type is not one of the valid values.

**Valid Types**: `widget`, `panel`, `overlay`, `dialog`

**Incorrect**:
```json
{
  "window": {
    "type": "floating"
  }
}
```

**Solution**: Use a valid window type:

```json
{
  "window": {
    "type": "widget"
  }
}
```

---

#### Error: "Invalid window position: 'middle'"

**Cause**: Window position is not one of the valid values.

**Valid Positions**: `center`, `top-left`, `top-right`, `bottom-left`, `bottom-right`

**Incorrect**:
```json
{
  "window": {
    "position": "middle"
  }
}
```

**Solution**: Use a valid position:

```json
{
  "window": {
    "position": "center"
  }
}
```

---

### Development Mode Issues

#### Error: "devServer must use localhost or 127.0.0.1"

**Cause**: Dev server URL uses a non-localhost host (security restriction).

**Incorrect**:
```json
{
  "devServer": "http://192.168.1.100:5173"
}

{
  "devServer": "http://example.com:3000"
}
```

**Solution**: Use localhost or 127.0.0.1:

```json
{
  "devServer": "http://localhost:5173"
}

{
  "devServer": "http://127.0.0.1:3000"
}
```

---

#### Error: "devServer must be an HTTP or HTTPS URL"

**Cause**: Dev server URL is malformed.

**Incorrect**:
```json
{
  "devServer": "localhost:5173"
}
```

**Solution**: Include the protocol:

```json
{
  "devServer": "http://localhost:5173"
}
```

---

### JSON Syntax Errors

#### Error: "Unexpected token } in JSON"

**Cause**: Trailing comma in JSON.

**Incorrect**:
```json
{
  "version": "1.0.0",
  "name": "my-app",
  "entrypoint": "index.html",
}
```

**Solution**: Remove trailing comma:

```json
{
  "version": "1.0.0",
  "name": "my-app",
  "entrypoint": "index.html"
}
```

---

#### Error: "Unexpected token / in JSON"

**Cause**: Comments are not allowed in standard JSON.

**Incorrect**:
```json
{
  // This is my app
  "version": "1.0.0",
  "name": "my-app"
}
```

**Solution**: Remove comments or use JSONC if your editor supports it:

```json
{
  "version": "1.0.0",
  "name": "my-app"
}
```

---

### Schema Validation Issues

#### Warning: "Unknown field: customField"

**Cause**: Manifest contains fields not defined in the schema.

**Current**:
```json
{
  "version": "1.0.0",
  "name": "my-app",
  "entrypoint": "index.html",
  "customField": "value"
}
```

**Solution**: Remove unknown fields or use standard fields:

```json
{
  "version": "1.0.0",
  "name": "my-app",
  "entrypoint": "index.html"
}
```

**Note**: Unknown fields may be ignored or cause errors depending on the validator.

---

## Runtime Issues

### App Won't Launch

#### Problem: App doesn't start when launched

**Diagnosis Steps**:

1. **Check manifest syntax**:
   ```bash
   cat webshell.json | jq
   ```
   If this fails, you have invalid JSON.

2. **Validate manifest**:
   ```bash
   ajv validate -s schemas/webshell-manifest.schema.json -d webshell.json
   ```

3. **Check entrypoint file exists**:
   ```bash
   ls index.html
   ```

4. **Check console for errors**:
   Look for JavaScript errors in your app's console.

---

### Permissions Not Working

#### Problem: API calls fail even with permissions declared

**Diagnosis**:

1. **Verify permission syntax**:
   ```json
   // Correct
   {
     "permissions": {
       "calendar": {
         "read": true
       }
     }
   }

   // Incorrect - missing nested object
   {
     "permissions": {
       "calendar": true
     }
   }
   ```

2. **Check permission registration**:
   - Ensure app is registered with PermissionManager
   - Verify manifest is loaded before API calls

3. **Check permission enforcement**:
   - Review error messages for specific denied permissions
   - Ensure you're using the correct permission category and action

---

### Theme Not Applying

#### Problem: Custom theme overrides don't work

**Diagnosis**:

1. **Check theme inheritance**:
   ```json
   {
     "theme": {
       "inherit": true,  // Must be true to use overrides
       "overrides": {
         "--primary-color": "#3b82f6"
       }
     }
   }
   ```

2. **Verify CSS variable names**:
   - CSS variables must start with `--`
   - Use valid CSS color values

3. **Check CSS usage in app**:
   ```css
   .button {
     background-color: var(--primary-color, #000);
   }
   ```

---

### Hot Reload Not Working

#### Problem: Changes don't reload automatically in dev mode

**Diagnosis**:

1. **Verify dev mode configuration**:
   ```json
   {
     "devServer": "http://localhost:5173",
     "devMode": {
       "hotReload": true,
       "watchPaths": ["src/**/*"]
     }
   }
   ```

2. **Check dev server is running**:
   ```bash
   curl http://localhost:5173
   ```

3. **Verify watch paths include your files**:
   ```json
   {
     "devMode": {
       "watchPaths": ["src/**/*", "public/**/*", "index.html"]
     }
   }
   ```

4. **Check ignore paths aren't blocking**:
   ```json
   {
     "devMode": {
       "ignorePaths": ["node_modules/**", "dist/**"]
     }
   }
   ```

---

## Validation Tools

### Using ajv-cli

Install:
```bash
npm install -g ajv-cli
```

Validate:
```bash
ajv validate -s schemas/webshell-manifest.schema.json -d webshell.json
```

### Using jq

Check JSON syntax:
```bash
cat webshell.json | jq
```

Pretty-print:
```bash
jq . webshell.json > webshell-formatted.json
```

Extract specific field:
```bash
jq '.permissions' webshell.json
```

### IDE Validation

Enable validation in VS Code:

1. Add `$schema` to your manifest:
   ```json
   {
     "$schema": "https://webshell.dev/schemas/manifest/v1.json"
   }
   ```

2. VS Code will automatically validate and provide autocomplete.

---

## Debugging Tips

### Enable Verbose Logging

Check WebShell logs for detailed error messages:

```bash
webshell --verbose launch ./webshell.json
```

### Check Permission Audit Log

Review permission denials:

```
[PermissionAudit] 2025-01-19T10:30:00.000Z | my-app | calendar | read | DENIED
```

### Test Permissions Individually

Test each permission separately to identify issues:

```javascript
// Test calendar permission
console.log("Has calendar.read:", webshell.permissions.has("calendar", "read"));

// Test filesystem permission
console.log("Can read ~/Documents:", webshell.permissions.canAccessFile("~/Documents/test.txt", "read"));

// Test network permission
console.log("Can access API:", webshell.permissions.canAccessHost("api.example.com"));
```

### Validate Manifest Programmatically

```javascript
const Ajv = require('ajv');
const fs = require('fs');

const ajv = new Ajv();
const schema = JSON.parse(fs.readFileSync('schemas/webshell-manifest.schema.json'));
const manifest = JSON.parse(fs.readFileSync('webshell.json'));

const validate = ajv.compile(schema);
const valid = validate(manifest);

if (!valid) {
  console.error(validate.errors);
}
```

---

## Getting Help

### Documentation

- [Manifest Reference](./manifest-reference.md)
- [Permissions Guide](./permissions-guide.md)
- [Manifest Schema](./manifest-schema.md)
- [Best Practices](./manifest-best-practices.md)
- [Examples](./manifest-examples.md)

### Community

- GitHub Issues: [webshell/issues](https://github.com/webshell/webshell/issues)
- Documentation: [webshell.dev/docs](https://webshell.dev/docs)
- Community Forum: [webshell.dev/community](https://webshell.dev/community)

### Reporting Bugs

When reporting issues, include:

1. Full error message
2. Your `webshell.json` (sanitized if needed)
3. WebShell version: `webshell --version`
4. Operating system and version
5. Steps to reproduce

---

## Quick Reference: Common Fixes

| Error | Quick Fix |
|-------|-----------|
| Missing `version` | Add `"version": "1.0.0"` |
| Invalid name | Use lowercase with hyphens only |
| Permission denied | Add permission to `permissions` object |
| File not found | Check path is relative to manifest |
| Invalid window size | Use 100-7680 for width, 100-4320 for height |
| Dev server error | Use `http://localhost:PORT` |
| Trailing comma | Remove last comma in JSON objects/arrays |
| Unknown field | Remove custom fields or check spelling |
| Theme not working | Set `"inherit": true` in theme config |
| Hot reload broken | Check `devServer` is running and `watchPaths` are correct |

---

## Related Documentation

- [Manifest Reference](./manifest-reference.md) - Complete field reference
- [Permissions Guide](./permissions-guide.md) - Permission documentation
- [Best Practices](./manifest-best-practices.md) - Recommended patterns
- [Examples](./manifest-examples.md) - Working examples
- [Migration Guide](./manifest-migration.md) - Platform migration
- [Manifest Schema](./manifest-schema.md) - Full specification
