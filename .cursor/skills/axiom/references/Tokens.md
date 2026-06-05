# Design Tokens

Design tokens are the visual design atoms of the design system. They define colors, spacing, typography, and effects used throughout Axiom components.

## Import

```typescript
// Import from generated token files
import '@gorgias/axiom/dist/tokens/colors/core.css'
import '@gorgias/axiom/dist/tokens/colors/semantic/light.css'
import '@gorgias/axiom/dist/tokens/colors/semantic/dark.css'
import '@gorgias/axiom/dist/tokens/spacing.css'
import '@gorgias/axiom/dist/tokens/typography.css'
import '@gorgias/axiom/dist/tokens/effects.css'
```

## Usage

Tokens are available as CSS variables and can be used in styles:

```typescript
// Using tokens in component styles
const styles = {
    color: 'var(--content-neutral-default)',
    backgroundColor: 'var(--surface-neutral-primary)',
    padding: 'var(--spacing-md)',
    fontSize: 'var(--typography-regular-md)',
    boxShadow: 'var(--effects-shadow-component)',
}
```

```css
/* Using tokens in CSS */
.my-component {
    color: var(--content-neutral-default);
    background-color: var(--surface-neutral-primary);
    padding: var(--spacing-md);
    border-radius: var(--spacing-xs);
    box-shadow: var(--effects-shadow-component);
}
```

## Token Categories

### Color Tokens

#### Core Colors

Base color palette used to build semantic tokens:

**Neutrals:**

- White, Black
- grey-50, grey-100, grey-200, grey-300, grey-400, grey-500, grey-600, grey-700, grey-750, grey-800, grey-900, grey-950

**Brand & Accent:**

- green-50 through green-900
- teal-50 through teal-900
- blue-50 through blue-900
- purple-50 through purple-900
- fuchsia-50 through fuchsia-900

**Status & Alerts:**

- red-50 through red-900
- coral-50 through coral-900
- orange-50 through orange-900
- yellow-50 through yellow-900

**AI:**

- ai-content, ai-border, ai-surface

#### Semantic Colors (Light Mode)

These tokens automatically adapt to light/dark mode themes.

**Content (Text Colors):**

- content-neutral-default - Primary text color
- content-neutral-secondary - Secondary text color
- content-neutral-tertiary - Tertiary text color
- content-accent-default - Accent text color
- content-inverted-default - Inverted text color (light text)
- content-inverted-accent - Inverted accent text
- content-selected-accent - Selected accent text
- content-success-default - Success text
- content-error-default - Error text
- content-warning-default - Warning text
- content-additional-blue, content-additional-purple, content-additional-fuchsia, content-additional-teal, content-additional-coral, content-additional-yellow

**Border:**

- border-neutral-default - Default border color
- border-neutral-secondary - Secondary border
- border-neutral-tertiary - Tertiary border
- border-accent-default - Accent border
- border-success-default - Success borders
- border-error-default - Error borders
- border-warning-default - Warning borders
- border-additional-blue, border-additional-purple, border-additional-fuchsia, border-additional-teal, border-additional-coral, border-additional-yellow

**Surface (Backgrounds):**

- surface-neutral-primary - Primary background
- surface-neutral-secondary - Secondary background
- surface-neutral-tertiary - Tertiary background
- surface-accent-default, surface-accent-primary - Accent backgrounds
- surface-inverted-default - Inverted background (dark)
- surface-button-secondary - Secondary button background
- surface-success-default, surface-success-primary - Success backgrounds
- surface-error-default, surface-error-primary - Error backgrounds
- surface-warning-default - Warning background
- surface-additional-blue, surface-additional-purple, surface-additional-fuchsia, surface-additional-teal, surface-additional-coral, surface-additional-yellow

**Elevation:**

- elevation-neutral-bg - Background elevation (lowest)
- elevation-neutral-low - Subtle elevation just above the background
- elevation-neutral-default - Base elevation
- elevation-neutral-mid - Medium elevation
- elevation-neutral-high - High elevation

**Interactive States:**

- hover-default - Default hover state overlay
- hover-input - Input hover state
- pressed-default - Default pressed state
- inverted-hover - Inverted hover state
- inverted-pressed-default - Inverted pressed state
- focus - Focus ring color

**Static Colors:**
Fixed colors that don't change with theme:

- static-default-white, static-default-black
- static-secondary, static-tertiary
- static-success, static-error, static-warning
- static-additional-blue, static-additional-purple, static-additional-fuchsia, static-additional-teal, static-additional-coral, static-additional-yellow

**Data Visualization:**

- Dataviz-blue, Dataviz-coral, Dataviz-green, Dataviz-red, Dataviz-orange, Dataviz-yellow, Dataviz-fuchsia, Dataviz-teal, Dataviz-purple, Dataviz-grey

**Gradients:**

- gradient-blue, gradient-coral, gradient-fuchsia, gradient-green, gradient-grey, gradient-red, gradient-orange, gradient-purple, gradient-teal, gradient-yellow

**Heat Map:**

- heat-1 through heat-8 (lightest to darkest intensity)

### Spacing Tokens

Consistent spacing scale for margins, padding, and gaps:

- spacing-0: 0px
- spacing-xxxxs: 2px
- spacing-xxxs: 4px
- spacing-xxs: 6px
- spacing-xs: 8px
- spacing-sm: 12px
- spacing-md: 16px
- spacing-lg: 24px
- spacing-xl: 32px
- spacing-xxl: 48px
- spacing-xxxl: 64px

### Typography Tokens

Pre-defined text styles combining font family, size, weight, and line height:

**Headings:**

- typography-heading-xxl: 24px/32px, weight 600 - Page titles
- typography-heading-xl: 20px/32px, weight 600 - Headlines
- typography-heading-lg: 18px/28px, weight 600 - Section headings
- typography-heading-md: 16px/24px, weight 600 - Subsection headings
- typography-heading-sm: 14px/20px, weight 600 - Small headings

**Body Text (MD - 14px):**

- typography-bold-md: 14px/20px, weight 600
- typography-medium-md: 14px/20px, weight 500
- typography-regular-md: 14px/20px, weight 400 - Default body text
- typography-link-md: 14px/20px, weight 400, underline
- typography-italic-md: 14px/20px, weight 400, italic

**Small Text (SM - 12px):**

- typography-bold-sm: 12px/16px, weight 600
- typography-medium-sm: 12px/16px, weight 500
- typography-regular-sm: 12px/16px, weight 400 - Secondary text
- typography-link-sm: 12px/16px, weight 400, underline
- typography-italic-sm: 12px/16px, weight 400, italic

**Extra Small Text (XS - 10px):**

- typography-bold-xs: 10px/14px, weight 600
- typography-regular-xs: 10px/14px, weight 400 - Labels, captions
- typography-link-xs: 10px/14px, weight 400, underline

All typography tokens use the Inter font family.

### Effects Tokens

Shadow effects for elevation and depth:

- effects-shadow-container: Subtle shadow for containers (0px 2px 20px)
- effects-shadow-component: Light shadow for components (0px 2px 3px)
- effects-inner-shadow: Inner shadow effect
- effects-inner-light: Light inner shadow effect

## Best Practices

### Color Usage

1. **Use semantic tokens over core colors**: Semantic tokens adapt to themes and convey intent

    ```typescript
    // Good
    color: 'var(--content-neutral-default)'

    // Avoid
    color: 'var(--grey-800)'
    ```

2. **Match token purpose to usage**:

    - Use `content-*` tokens for text
    - Use `surface-*` tokens for backgrounds
    - Use `border-*` tokens for borders

3. **Respect color hierarchy**:
    - default: Primary/most prominent
    - secondary: Supporting information
    - tertiary: Least prominent

### Spacing Usage

1. **Use consistent spacing scale**: Stick to defined spacing tokens instead of arbitrary values

    ```typescript
    // Good
    padding: 'var(--spacing-md)'
    gap: 'var(--spacing-sm)'

    // Avoid
    padding: '15px'
    gap: '10px'
    ```

2. **Common spacing patterns**:
    - Component padding: spacing-md (16px)
    - Element gaps: spacing-xs (8px) or spacing-sm (12px)
    - Section margins: spacing-lg (24px) or spacing-xl (32px)
    - Tight spacing: spacing-xxxs (4px) or spacing-xxs (6px)

### Typography Usage

1. **Use typography tokens for consistent text styling**:

    ```typescript
    // Good - applies complete text style
    className: 'typography-regular-md'

    // Avoid - mixing individual properties
    fontSize: '14px'
    lineHeight: '20px'
    fontWeight: 400
    ```

2. **Choose appropriate text sizes**:
    - Headings: typography-heading-\* tokens
    - Body text: typography-\*-md tokens
    - Secondary/helper text: typography-\*-sm tokens
    - Labels/captions: typography-\*-xs tokens

### Effects Usage

1. **Use shadows for elevation hierarchy**:

    - effects-shadow-container: Modals, popovers, drawers
    - effects-shadow-component: Cards, dropdowns, tooltips

2. **Don't stack multiple shadows**: Choose one appropriate shadow effect

## Theme Support

Semantic color tokens automatically adapt between light and dark themes. Import the appropriate theme CSS file:

```typescript
// Light theme (default)
import '@gorgias/axiom/dist/tokens/colors/semantic/light.css'
// Dark theme
import '@gorgias/axiom/dist/tokens/colors/semantic/dark.css'
```

Theme switching is handled at the application level by swapping the imported CSS file.

## Related Components

All Axiom components use these design tokens internally. Components may also expose props that accept token values:

- **Box**: Accepts spacing tokens for padding, margin, gap
- **Text**: Accepts color tokens for text color
- **Icon**: Accepts color tokens for icon color
- **Button**: Uses color, spacing, and typography tokens
