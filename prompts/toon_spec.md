# TOON Format Specification

TOON:Token-Oriented Object Notation
purpose:Maximum token density for inter-agent communication

## Core Rules

toon_rules:
  no_markdown_headers: true
  no_filler_prose: true
  no_bullets_for_lists: use_colons
  separator: newline_only
  label_style: key:value
  nest: 2_spaces

## Syntax

top_level:section:value
nested:section:sub_key:value
list:items:item_one,item_two,item_three

## Data Types

primitive_types:
  string: unquoted text
  number: digits only
  boolean: true|false
  null: none

collection_types:
  array: comma_separated within []
  map: key:value pairs within {}

## Common Patterns

file_path:path/to/file.ts
function:fn:functionName(param:type,param2:type2):returnType
class:class:ClassName
type:type:TypeName{field1,field2}
const:const:CONSTANT_NAME:type

## Example Output

src/auth.ts:
  fn:loginUser(email:string,password:string):Promise<User>
  fn:verifyJWT(token:string):JWTPayload|null
  class:AuthService:
    fn:authenticate(credentials:Credentials):AuthResult
  type:User{id,email,role}

## vs Markdown (Token Comparison)

markdown_format:
  "# Section Header\n"
  "* item one\n"
  "* item two\n"
  token_cost: ~15 tokens

toon_format:
  "section:\n"
  "item_one\n"
  "item_two\n"
  token_cost: ~8 tokens
  savings: ~47%

## Best Practices

1. No empty lines between sections
2. Colon as separator, not bullet
3. Inline arrays for small lists
4. Prefer abbreviations for common terms
5. No trailing whitespace