# Context Providers

LoomMCP can enrich symbol metadata with context from external tools.

## Supported Providers

### Git Provider

Automatically enriches symbols with git metadata:

```javascript
// Enable git context
loom_get_topology { dir: ".", context: "git" }
```

Returns: commit hash, author, date for each symbol's last modification.

---

## Custom Providers

To add a custom provider:

1. Implement interface:

```javascript
interface ContextProvider {
  name: string;
  enrich(symbol: Symbol): Promise<ContextData>;
}
```

2. Register:

```javascript
registerProvider('myprovider', myProvider);
```

---

## Built-in Integration

### Django Context

Detects Django models and adds URL routing info:

```javascript
{
  model: 'User',
  app_label: 'accounts',
  managers: ['objects', 'admin_manager']
}
```

### Next.js Context

Detects pages and API routes:

```javascript
{
  route: '/pages/admin/index.tsx',
  page_type: 'page',
  api_route: false
}
```

### Nuxt Context

Detects pages and server routes:

```javascript
{
  route: '/pages/index.vue',
  page_type: 'page',
  api_route: false
}
```

---

## Limitations

1. Context providers require additional setup
2. Not all frameworks have built-in support
3. Custom providers need to implement the interface