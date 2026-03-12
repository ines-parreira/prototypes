# /review-axiom-usage - Axiom UI Kit Compliance Review

Review code for @gorgias/axiom usage patterns and identify areas needing migration.

## Usage

```
/review-axiom-usage <path>
```

## Arguments

- `<path>` - Path to a file or directory to review (e.g., `src/pages/settings/`)

## Instructions

When the user runs this command:

1. **Find relevant files** in the specified path:
   - Look for `.tsx` files (components)
   - Look for `.less` files (styles)
   - Focus on components and their styles

2. **Review for the following issues:**

### Legacy Component Imports (High Priority)

Check for Legacy component imports that should use new API:

**Flag as issue:**
```typescript
// BAD - Legacy imports
import { LegacyButton as Button } from '@gorgias/axiom'
import { LegacyTooltip as Tooltip } from '@gorgias/axiom'
import { LegacyBadge as Badge } from '@gorgias/axiom'
import { LegacyLabel as Label } from '@gorgias/axiom'
```

**Suggest instead:**
```typescript
// GOOD - New API imports
import { Button } from '@gorgias/axiom'
import { Tooltip, TooltipContent } from '@gorgias/axiom'
import { Badge } from '@gorgias/axiom'
import { Label } from '@gorgias/axiom'
```

### Custom UI Components (High Priority)

Check for custom implementations that have axiom equivalents:

**Flag as issue:**
```tsx
// BAD - Custom button
<div className={styles.button} onClick={onClick}>
    Click me
</div>

// BAD - Custom styled span for text
<span className={styles.title}>{title}</span>

// BAD - Custom flex container div
<div className={styles.flexRow}>
    {children}
</div>
```

**Suggest instead:**
```tsx
// GOOD - Use axiom Button
import { Button } from '@gorgias/axiom'
<Button onClick={onClick}>Click me</Button>

// GOOD - Use axiom Heading or Text
import { Heading, Text } from '@gorgias/axiom'
<Heading size="md">{title}</Heading>
<Text>{description}</Text>

// GOOD - Use axiom Box
import { Box } from '@gorgias/axiom'
<Box flexDirection="row" gap="md">
    {children}
</Box>
```

### Hardcoded Style Values (Medium Priority)

Check CSS/LESS for hardcoded values that should use design tokens:

**Flag as issue:**
```less
/* BAD - Hardcoded spacing */
.container {
    padding: 16px;
    margin: 8px;
    gap: 12px;
}

/* BAD - Hardcoded colors */
.text {
    color: #333333;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
}
```

**Suggest instead:**
```less
/* GOOD - Design tokens for spacing */
.container {
    padding: var(--spacing-md);
    margin: var(--spacing-xs);
    gap: var(--spacing-sm);
}

/* GOOD - Semantic color tokens */
.text {
    color: var(--content-neutral-default);
    background-color: var(--surface-neutral-primary);
    border: 1px solid var(--border-neutral-default);
}
```

### Missing Typography Components (Medium Priority)

Check for raw HTML heading/text elements:

**Flag as issue:**
```tsx
// BAD - Raw HTML headings with custom styles
<h1 className={styles.pageTitle}>{title}</h1>
<h2 className={styles.sectionTitle}>{subtitle}</h2>
<p className={styles.bodyText}>{content}</p>
```

**Suggest instead:**
```tsx
// GOOD - Axiom typography components
import { Heading, Text } from '@gorgias/axiom'
<Heading size="lg">{title}</Heading>
<Heading size="md">{subtitle}</Heading>
<Text>{content}</Text>
```

3. **Generate report** with:
   - List of issues found, grouped by type
   - File path and line number for each issue
   - Suggested migration/fix for each issue
   - Priority for migration

## Design Token Reference

### Spacing Tokens
`--spacing-xxxxs` | `--spacing-xxxs` | `--spacing-xxs` | `--spacing-xs` | `--spacing-sm` | `--spacing-md` | `--spacing-lg`

### Color Tokens
**Content (text):**
- `--content-neutral-default` - Primary text
- `--content-neutral-secondary` - Secondary text
- `--content-inverted-default` - Text on dark backgrounds
- `--content-accent-default` - Accent/link color
- `--content-error-primary` - Error text
- `--content-warning-primary` - Warning text

**Surface (backgrounds):**
- `--surface-neutral-primary` - Primary background
- `--surface-neutral-secondary` - Secondary background
- `--surface-success-primary` - Success state
- `--surface-error-primary` - Error state
- `--surface-warning-primary` - Warning state

**Border:**
- `--border-neutral-default` - Default borders

## Example Output

```
Axiom Usage Review: src/pages/settings/profile/
================================================

HIGH PRIORITY - Legacy Imports:

1. src/pages/settings/profile/ProfileForm.tsx:3
   Found: import { LegacyButton as Button } from '@gorgias/axiom'
   Suggest: import { Button } from '@gorgias/axiom'

2. src/pages/settings/profile/ProfileHeader.tsx:5
   Found: import { LegacyTooltip as Tooltip } from '@gorgias/axiom'
   Suggest: import { Tooltip, TooltipContent } from '@gorgias/axiom' (use trigger prop)

HIGH PRIORITY - Custom Components:

3. src/pages/settings/profile/ProfileCard.tsx:25
   Found: <div className={styles.button} onClick={...}>
   Suggest: Use <Button> from @gorgias/axiom

MEDIUM PRIORITY - Hardcoded Styles:

4. src/pages/settings/profile/ProfileCard.less:12
   Found: padding: 16px;
   Suggest: padding: var(--spacing-md);

5. src/pages/settings/profile/ProfileCard.less:15
   Found: color: #333;
   Suggest: color: var(--content-neutral-default);

MEDIUM PRIORITY - Missing Typography:

6. src/pages/settings/profile/ProfileHeader.tsx:18
   Found: <h2 className={styles.title}>{name}</h2>
   Suggest: <Heading size="md">{name}</Heading>

Summary:
- 2 legacy imports to migrate
- 1 custom component to replace with axiom
- 2 hardcoded style values to convert to tokens
- 1 raw HTML element to replace with axiom component
```
