# Accessibility & Testability Checklist

## No data-testid Attributes

The project explicitly avoids `data-testid` in favor of accessible selectors.

| Check | Status |
|-------|--------|
| No `data-testid` attributes in components | ⬜ |
| Elements testable via role, text, or label | ⬜ |

```tsx
// ❌ WRONG
<button data-testid="submit-button">Submit</button>

// ✅ CORRECT - Testable via getByRole('button', { name: /submit/i })
<button>Submit</button>
```

## Semantic HTML

Use native semantic elements instead of generic divs.

| Element | Use For |
|---------|---------|
| `<button>` | Clickable actions |
| `<a>` | Navigation links |
| `<nav>` | Navigation sections |
| `<main>` | Primary content |
| `<header>` | Page/section headers |
| `<footer>` | Page/section footers |
| `<article>` | Self-contained content |
| `<section>` | Thematic groupings |
| `<form>` | Form containers |

```tsx
// ❌ WRONG
<div onClick={handleClick}>Click me</div>
<div className="nav">...</div>

// ✅ CORRECT
<button onClick={handleClick}>Click me</button>
<nav>...</nav>
```

## Form Inputs

### Labels Required

| Check | Status |
|-------|--------|
| Every input has an associated label | ⬜ |
| Label uses `htmlFor` matching input `id` | ⬜ |
| Or input wrapped in label element | ⬜ |

```tsx
// ✅ CORRECT - Explicit label
<label htmlFor="email">Email address</label>
<input id="email" type="email" name="email" />

// ✅ CORRECT - Implicit label
<label>
    Email address
    <input type="email" name="email" />
</label>

// ❌ WRONG - No label
<input type="email" placeholder="Email" />
```

### Placeholder Not Enough

Placeholders disappear when typing - they're hints, not labels.

```tsx
// ❌ WRONG - Placeholder as only label
<input placeholder="Enter email" />

// ✅ CORRECT - Proper label + placeholder hint
<label htmlFor="email">Email</label>
<input id="email" placeholder="you@example.com" />
```

## Images

### Alt Text Required

| Check | Status |
|-------|--------|
| All `<img>` have `alt` attribute | ⬜ |
| Decorative images have `alt=""` | ⬜ |
| Alt text is meaningful, not generic | ⬜ |

```tsx
// ✅ CORRECT - Meaningful alt
<img src={user.avatar} alt="User avatar" />
<img src={product.image} alt={product.name} />

// ✅ CORRECT - Decorative (hidden from AT)
<img src={decorativeBg} alt="" />

// ❌ WRONG - No alt
<img src={user.avatar} />

// ❌ WRONG - Generic alt
<img src={user.avatar} alt="image" />
```

## Icon Buttons

### aria-label Required

| Check | Status |
|-------|--------|
| Icon-only buttons have `aria-label` | ⬜ |
| aria-label describes the action | ⬜ |

```tsx
// ✅ CORRECT
<button aria-label="Close dialog" onClick={onClose}>
    <CloseIcon />
</button>

<button aria-label="Delete item" onClick={onDelete}>
    <TrashIcon />
</button>

// ❌ WRONG - No accessible name
<button onClick={onClose}>
    <CloseIcon />
</button>
```

## ARIA Attributes

Use ARIA only when semantic HTML isn't sufficient.

### Common Patterns

```tsx
// Progress indicator
<div role="progressbar" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100} />

// Live region for announcements
<div aria-live="polite">{statusMessage}</div>

// Expanded/collapsed state
<button aria-expanded={isOpen} onClick={toggle}>
    Menu
</button>

// Disabled state
<button aria-disabled={isDisabled} onClick={isDisabled ? undefined : onClick}>
    Submit
</button>
```

## Testing Implications

Each accessibility pattern enables specific test queries:

| Pattern | Test Query |
|---------|------------|
| `<button>Submit</button>` | `getByRole('button', { name: /submit/i })` |
| `<label>Email</label><input>` | `getByLabelText('Email')` |
| `<img alt="Avatar">` | `getByAltText('Avatar')` |
| `<button aria-label="Close">` | `getByRole('button', { name: /close/i })` |
| `<h1>Title</h1>` | `getByRole('heading', { level: 1 })` |
| `<nav>` | `getByRole('navigation')` |

## Common Violations

1. **Using data-testid for testing**
   - Fix: Add proper label/aria-label, test via role

2. **div with onClick instead of button**
   - Fix: Use `<button>` element

3. **Input without label**
   - Fix: Add `<label>` with htmlFor

4. **Image without alt**
   - Fix: Add meaningful alt text

5. **Icon button without aria-label**
   - Fix: Add aria-label describing the action

## Related Checklists

- [SDK Compliance](sdk-checklist.md) - Data fetching and mutation patterns
- [Axiom UI Kit](axiom-checklist.md) - Component and styling compliance
- [Test Quality](test-checklist.md) - Testing patterns and async handling
