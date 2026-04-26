# Language Support

## Supported Languages

### Full Symbol Extraction

| Language | Extensions | Parser | Symbol Types | Decorators | Docstrings |
|----------|------------|--------|--------------|-----------|------------|
| TypeScript | `.ts`, `.tsx` | tree-sitter-typescript | function, class, method, constant, type | `@decorator` | `//` and `/** */` |
| JavaScript | `.js`, `.jsx` | tree-sitter-javascript | function, class, method, constant | — | `//` and `/** */` |
| Python | `.py` | tree-sitter-python | function, class, constant, type | `@decorator` | triple-quoted strings |
| Go | `.go` | tree-sitter-go | function, method, type, constant | — | `//` comments |
| Rust | `.rs` | tree-sitter-rust | function, type (struct/enum/trait), impl, constant | `#[attr]` | `///` and `//!` |
| Java | `.java` | tree-sitter-java | method, class, type (interface/enum), constant | `@Annotation` | `/** */` Javadoc |
| C# | `.cs` | tree-sitter-csharp | class, method, type (interface/enum/struct), constant | `[Attribute]` | `/// <summary>` |
| Ruby | `.rb` | tree-sitter-ruby | class, method, function | — | `#` comments |
| PHP | `.php` | tree-sitter-php | function, class, method, type (interface/trait/enum) | `#[Attribute]` | `/** */` PHPDoc |
| Swift | `.swift` | tree-sitter-swift | function, class, method, type | — | `///` comments |
| Kotlin | `.kt`, `.kts` | tree-sitter-kotlin | function, class, type | — | `//` and `/** */` |
| Dart | `.dart` | tree-sitter-dart | function, class, method, type | `@annotation` | `///` doc comments |
| C | `.c`, `.h` | tree-sitter-c | function, type (struct/enum/union), constant | — | `/* */` and `//` |
| C++ | `.cpp`, `.cc`, `.hpp`, `.hh`, `.hxx` | tree-sitter-cpp | function, class, method, type, constant | — | `/* */` and `//` |
| Bash | `.sh`, `.bash` | tree-sitter-bash | function, constant | — | `#` comments |

---

## Parser Engine

All language parsing is powered by **tree-sitter** via npm packages:

* `tree-sitter-typescript`
* `tree-sitter-python`
* `tree-sitter-go`
* `tree-sitter-rust`
* `tree-sitter-java`
* `tree-sitter-ruby`
* `tree-sitter-php`
* `tree-sitter-swift`
* `tree-sitter-kotlin`
* `tree-sitter-dart`
* `tree-sitter-c`
* `tree-sitter-cpp`
* `tree-sitter-bash`

---

## Adding a New Language

1. Install the tree-sitter grammar: `npm install tree-sitter-<lang>`
2. Import in `src/ast.ts`
3. Add to `langMap` object
4. The parser will automatically use tree-sitter for that extension

---

## Language Detection

LoomMCP automatically detects languages by file extension:

```javascript
const langMap = {
  ts: tsLang,
  tsx: tsLang,
  js: jsLang,
  jsx: jsLang,
  py: Python,
  go: goLang,
  rs: rustLang,
  java: javaLang,
  // ...
};
```

---

## Limitations

1. Anonymous functions without names are not indexed
2. Macro-generated symbols are not visible to the parser
3. Deep inner-class nesting may be flattened
4. Some language-specific features require Python 3.12+ syntax