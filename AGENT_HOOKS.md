# Agent Hooks

LoomMCP supports enforcement hooks that intercept agent tool usage to enforce better patterns.

## Hook Types

### PreToolUse Hook

Runs before an agent uses a tool. Can allow, block, or redirect.

```javascript
// Register a hook
await tool('loom_enforce_hook', {
  name: 'force_topology_first',
  beforeToolUse: async (toolName, args) => {
    if (toolName === 'loom_search_symbols') {
      return { allow: false, message: 'Call loom_get_topology first' };
    }
    return { allow: true };
  }
});
```

### PostToolUse Hook

Runs after a tool completes. Can warn or redirect.

```javascript
afterToolUse: async (toolName, args, result) => {
  if (toolName === 'loom_focus' && result.tokens > 5000) {
    return { action: 'warn', message: 'Large file focused' };
  }
  return { action: 'allow' };
}
```

---

## Built-in Enforcement Rules

### Force Topology

Require `loom_get_topology` before search:

```javascript
{ name: 'force_topology', tool: 'loom_search_symbols', require: 'loom_get_topology' }
```

### Budget Guard

Warn when token budget is exceeded:

```javascript
{ name: 'budget_guard', max_tokens: 5000, action: 'warn' }
```

---

## Workflow Integration

Add to your `.claude/hints.md`:

```
Before any file operations:
1. Call loom_get_topology to get codebase skeleton
2. Use loom_search_symbols to find relevant symbols
3. Use loom_focus to page in specific implementations
```

---

## Hook Examples

### Force Search Before Focus

```javascript
{
  name: 'search_before_focus',
  beforeToolUse: (tool, args) => {
    if (tool === 'loom_focus') {
      return { allow: false, message: 'Search first with loom_search_symbols' };
    }
    return { allow: true };
  }
}
```

### Warn on Large File

```javascript
{
  name: 'large_file_warn',
  afterToolUse: (tool, args, result) => {
    if (result.files > 100) {
      return { action: 'warn', message: 'Large file - consider loom_search_symbols first' };
    }
    return { action: 'allow' };
  }
}
```

---

## Best Practices

1. **Start permissive** — Tighten hooks over time
2. **Log hook triggers** — Track enforcement decisions
3. **Iterate** — Adjust based on agent behavior