# Cursor Rules for Precruit MVP

This directory contains Cursor rules that provide context-aware guidance for developing Precruit. These rules help maintain consistency, follow best practices, and accelerate development.

## Rule Structure

### Project-wide Rules
- **`project-overview.mdc`**: Overall project standards and architecture principles (always applied)
- **`development-workflow.mdc`**: Development workflow, commands, and troubleshooting

### Frontend Rules (`frontend/`)
- **`nextjs-standards.mdc`**: Next.js component patterns and standards
- **`supabase-auth.mdc`**: Frontend authentication patterns
- **`api-integration.mdc`**: Supabase client and service integration

### Database Rules
- **`database-migrations.mdc`**: Migration patterns and SQL best practices

### Templates (`templates/`)
- **`react-component-template.mdc`**: Complete React component template

## How Rules Work

Rules are automatically applied based on:

1. **Always Applied**: `project-overview.mdc` provides context for all files
2. **Auto Attached**: Rules automatically attach when working with matching file patterns
3. **Manual**: Template rules can be referenced with `@template-name`

## Using the Rules

### Automatic Application
Rules automatically provide context when you're working with relevant files:
- Editing React components in `apps/web/` → Frontend rules apply
- Working with migrations → Database rules apply

### Manual Reference
Reference templates explicitly:
- `@react-component-template` - Get the React component template

### Rule Types
- **Always**: Applied to all conversations (project overview)
- **Auto Attached**: Applied when working with matching files
- **Agent Requested**: AI decides when to include based on context
- **Manual**: Only when explicitly referenced

## Alternative: AGENTS.md

For simpler use cases, the project also includes `AGENTS.md` in the root directory, which provides a consolidated set of instructions for Precruit MVP.

## Benefits

1. **Consistency**: Ensures all code follows established patterns
2. **Speed**: Templates and patterns accelerate development
3. **Quality**: Built-in best practices and error handling
4. **Context**: Rules provide relevant guidance based on what you're working on
5. **Learning**: New team members can quickly understand project patterns

## Customization

Feel free to modify these rules to match your specific needs:
- Add new rules for additional services or patterns
- Modify existing rules to match your coding style
- Create project-specific templates for common use cases

## Getting Started

1. The rules are already set up and will work automatically
2. Start coding - rules will provide context as you work
3. Reference templates when creating new components or endpoints
4. Modify rules as your project evolves

For more information about Cursor rules, see the [official documentation](https://docs.cursor.com/en/context/rules).
