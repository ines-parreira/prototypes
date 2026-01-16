# Accessibility Guidelines

Writing accessible components that are easy to test.

## Semantic HTML

Use the right element for the job:

| Purpose | Element |
|---------|---------|
| Navigation | `<nav>` |
| Main content | `<main>` |
| Section with heading | `<section>` |
| Article/post | `<article>` |
| Header area | `<header>` |
| Footer area | `<footer>` |
| Side content | `<aside>` |

### Buttons vs Links

```tsx
// Button - triggers an action
<button onClick={handleSubmit}>Submit</button>

// Link - navigates somewhere
<a href="/settings">Settings</a>
<Link to="/settings">Settings</Link>
```

### Headings

Use proper heading hierarchy:

```tsx
// Good
<h1>Page Title</h1>
<section>
    <h2>Section Title</h2>
    <h3>Subsection</h3>
</section>

// Bad - skipping levels
<h1>Title</h1>
<h3>Subsection</h3>  // Missing h2
```

## Form Accessibility

### Labels

Every input needs a label:

```tsx
// Explicit label (preferred)
<label htmlFor="email">Email address</label>
<input id="email" type="email" />

// Implicit label
<label>
    Email address
    <input type="email" />
</label>

// aria-label for icon buttons
<button aria-label="Close dialog">
    <CloseIcon />
</button>
```

### Error Messages

Connect errors to inputs:

```tsx
<label htmlFor="email">Email</label>
<input
    id="email"
    type="email"
    aria-invalid={!!error}
    aria-describedby={error ? 'email-error' : undefined}
/>
{error && <span id="email-error" role="alert">{error}</span>}
```

### Required Fields

```tsx
<label htmlFor="name">
    Name <span aria-hidden="true">*</span>
</label>
<input id="name" required aria-required="true" />
```

## Images

### Informative Images

```tsx
// Image conveys information
<img src={chart.png} alt="Sales increased 25% in Q4" />
```

### Decorative Images

```tsx
// Image is purely decorative
<img src={decoration.png} alt="" />
```

### Icons with Text

```tsx
// Icon + text - icon is decorative
<button>
    <SaveIcon aria-hidden="true" />
    Save changes
</button>
```

### Icon-Only Buttons

```tsx
// Icon only - needs label
<button aria-label="Save changes">
    <SaveIcon />
</button>
```

## ARIA Attributes

### Live Regions

For dynamic content:

```tsx
// Polite - announced when user is idle
<div aria-live="polite">
    {message}
</div>

// Assertive - announced immediately
<div aria-live="assertive" role="alert">
    {errorMessage}
</div>
```

### States

```tsx
// Expanded/collapsed
<button aria-expanded={isOpen}>Menu</button>

// Selected
<div role="tab" aria-selected={isActive}>Tab 1</div>

// Disabled
<button aria-disabled={!canSubmit}>Submit</button>

// Loading
<button aria-busy={isLoading}>
    {isLoading ? 'Loading...' : 'Submit'}
</button>
```

### Relationships

```tsx
// Controls another element
<button aria-controls="menu" aria-expanded={isOpen}>
    Toggle menu
</button>
<ul id="menu" hidden={!isOpen}>...</ul>

// Describes another element
<input aria-describedby="hint" />
<span id="hint">Enter your email address</span>
```

## Testing Accessibility

### Use Role Queries

```tsx
// These queries test accessibility
screen.getByRole('button', { name: /submit/i })
screen.getByRole('textbox', { name: /email/i })
screen.getByRole('heading', { level: 1 })
screen.getByRole('navigation')
screen.getByRole('alert')
```

### Common Roles

| Element | Role |
|---------|------|
| `<button>` | button |
| `<a href>` | link |
| `<input type="text">` | textbox |
| `<input type="checkbox">` | checkbox |
| `<input type="radio">` | radio |
| `<select>` | combobox |
| `<ul>`, `<ol>` | list |
| `<li>` | listitem |
| `<table>` | table |
| `<tr>` | row |
| `<th>` | columnheader |
| `<td>` | cell |
| `<nav>` | navigation |
| `<main>` | main |
| `<header>` | banner |
| `<footer>` | contentinfo |

### Test Checklist

- [ ] Can access all interactive elements with keyboard?
- [ ] Is focus visible on interactive elements?
- [ ] Are form inputs labeled?
- [ ] Are error messages announced?
- [ ] Are images described (or marked decorative)?
- [ ] Is heading hierarchy logical?
- [ ] Are dynamic changes announced?

## Avoid data-testid

Instead of adding `data-testid`, make components accessible:

```tsx
// ❌ Bad - needs test ID
<div data-testid="user-card">
    <img src={avatar} />
    <span>{name}</span>
</div>

// Test
screen.getByTestId('user-card')

// ✅ Good - accessible
<article aria-label={`Profile for ${name}`}>
    <img src={avatar} alt={`${name}'s avatar`} />
    <span>{name}</span>
</article>

// Test
screen.getByRole('article', { name: /profile for john/i })
screen.getByAltText(/john's avatar/i)
```
