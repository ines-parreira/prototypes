# Icon

Component for rendering SVG icons from the Axiom icon library.

## Import

```typescript
import { Icon } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'
```

## Props

### IconProps

```typescript
type IconProps = {
    name: IconName // Icon name from icon library (required)
    size?: 'xs' | 'sm' | 'md' | 'lg' // Default: 'sm'
    intent?: 'regular' | 'ai' // Default: 'regular'
    color?: ColorValue // Custom color (hex, CSS var, or Color enum)
    alt?: string // Accessibility label (empty string for decorative)
    withBackground?: boolean // Adds a colored background behind the icon
}

// When intent is 'regular', color can be customized
// When intent is 'ai', uses gradient colors (cannot customize color)
// withBackground uses color to pick the background token; defaults to neutral when no color is set
```

## Usage

### Basic Icon

```typescript
// Default: sm size, regular intent
<Icon name="settings" />
```

### Sizes

```typescript
<Icon name="check" size="xs" />
<Icon name="check" size="sm" />
<Icon name="check" size="md" />
<Icon name="check" size="lg" />
```

### AI Intent

```typescript
// Renders with AI gradient (coral to purple)
<Icon name="sparkles" intent="ai" />
<Icon name="settings-ai" intent="ai" />
```

### Custom Colors

```typescript
// Using Color enum value
<Icon name="check" color="success-500" />
<Icon name="warning" color="warning-500" />
<Icon name="error" color="error-500" />

// Using CSS variable
<Icon name="info" color="var(--content-neutral-secondary)" />

// Using hex color
<Icon name="star" color="#FFD700" />
```

### With Background

```typescript
// Neutral background (no color)
<Icon name="settings" withBackground />

// Colored background — uses the same color for both icon and background tint
<Icon name="info" color="blue" withBackground />
<Icon name="warning" color="coral" withBackground />
<Icon name="sparkles" color="teal" withBackground />
<Icon name="heart" color="fuchsia" withBackground />
<Icon name="star" color="yellow" withBackground />
<Icon name="tag" color="grey" withBackground />
```

### Accessibility

```typescript
// Semantic icon (uses icon name as label by default)
<Icon name="settings" />

// Custom accessible label
<Icon name="settings" alt="Open settings menu" />

// Decorative icon (hidden from screen readers)
<Icon name="decorative-pattern" alt="" />
```

### In Buttons

```typescript
// Icon-only button
<Button icon={<Icon name="settings" />} />

// Button with icon slots
<Button leadingSlot="plus">Add Item</Button>
<Button trailingSlot="arrow-right">Next</Button>
```

### In Text

```typescript
<Text>
  <Icon name="check" size="xs" /> Task completed
</Text>
```

## Icon Types

The icon library includes several categories:

- **Regular icons**: Standard UI icons (settings, check, close, etc.)
- **Channel icons**: Communication channel icons (email, chat, social media)
- **App icons**: Third-party app/service icons (with branded colors)
- **Colored icons**: Icons with built-in colors
- **AI icons**: Icons designed for AI features

## Available Icon Names

### Actions & Controls

add-plus, add-plus-circle, add-shopping-cart, add-to-queue, archive, check, check-all, close, close-circle, copy, crop, download, download-package, edit-pencil, exit, forward, grip, move, move-horizontal, move-vertical, redo, remove-minus, remove-minus-circle, undo, upload

### AI Icons

ai, ai-agent-feedback, ai-alt-1, ai-ticket-summary, settings-ai

### Arrows

arrow-chevron-down, arrow-chevron-down-duo, arrow-chevron-left, arrow-chevron-left-duo, arrow-chevron-right, arrow-chevron-right-duo, arrow-chevron-up, arrow-chevron-up-duo, arrow-circle-down, arrow-circle-down-left, arrow-circle-down-right, arrow-circle-left, arrow-circle-right, arrow-circle-up, arrow-circle-up-left, arrow-circle-up-right, arrow-collapse, arrow-down, arrow-down-left, arrow-down-right, arrow-down-up, arrow-expand, arrow-left, arrow-left-right, arrow-merging, arrow-reload-alt-2, arrow-right, arrow-routing, arrow-sub-down-left, arrow-sub-down-right, arrow-sub-left-down, arrow-sub-left-up, arrow-sub-right-down, arrow-sub-right-up, arrow-sub-up-left, arrow-sub-up-right, arrow-undo-down-left, arrow-undo-down-right, arrow-undo-up-left, arrow-undo-up-right, arrow-unfold-less, arrow-unfold-more, arrow-up, arrow-up-left, arrow-up-right, arrows-reload-alt-1

### Calendar & Time

alarm, calendar, calendar-add, calendar-check, calendar-close, calendar-days, calendar-event, calendar-remove, calendar-week, clock, history, timer, timer-add, timer-close, timer-remove, timer-snooze

### Channels

channel-aircall, channel-api, channel-facebook, channel-fb-messenger, channel-google, channel-google-business, channel-gorgias-chat, channel-instagram, channel-instagram-dm, channel-linkedin, channel-tiktok, channel-whatsapp, channel-x, channel-yotpo, channel-youtube

### Charts & Data

chart-bar-horizontal, chart-bar-vertical, chart-line, chart-line-alt, chart-pie, data-object, trending-down, trending-up

### Cloud & Storage

cloud, cloud-add, cloud-check, cloud-close, cloud-download, cloud-off, cloud-remove, cloud-upload

### Communication

comm-bell, comm-bell-add, comm-bell-close, comm-bell-notification, comm-bell-off, comm-bell-remove, comm-bell-ring, comm-chat, comm-chat-circle, comm-chat-circle-add, comm-chat-circle-check, comm-chat-circle-close, comm-chat-circle-dots, comm-chat-circle-remove, comm-chat-conversation, comm-chat-conversation-circle, comm-chat-dots, comm-ivr, comm-mail, comm-mail-open, comm-phone, comm-phone-end, comm-phone-incoming, comm-phone-missed, comm-phone-outgoing, comm-send, comm-share-i-os-export, comm-voicemail, chat-fb-like, chat-order

### Files & Folders

file-add, file-blank, file-check, file-close, file-code, file-document, file-download, file-edit, file-remove, file-search, file-upload, files, folder, folder-add, folder-check, folder-close, folder-code, folder-document, folder-download, folder-edit, folder-remove, folder-search, folder-upload, folders

### Lists & Tables

list-add, list-check, list-checklist, list-ordered, list-remove, list-unordered, table, table-add, table-remove, columns

### Media & Images

media-add-image, media-forward, media-image, media-pause, media-pause-circle, media-play-circle, media-play-pause, media-rewind, media-shuffle, media-skip-back, media-skip-forward, media-stop-circle, media-volume-max, media-volume-min, media-volume-minus, media-volume-off, media-volume-plus

### Menus & Navigation

dots-kebab-vertical, dots-meatballs-horizontal, drag-horizontal, drag-vertical, menu-alt-1, menu-alt-2, menu-alt-3, menu-alt-4, menu-alt-5, menu-burger, menu-more-grid

### Navigation & Location

nav-building-alt-1, nav-building-alt-2, nav-building-alt-3, nav-building-alt-4, nav-car-auto, nav-compass, nav-flag, nav-globe, nav-home, nav-house-add, nav-house-check, nav-house-close, nav-house-remove, nav-map, nav-map-pin, nav-navigation

### Notes & Documents

article, book, book-open, bookmark, description, note, note-edit, note-search, notebook

### Payments

attach-money, credit-card, money-off, payment-amex, payment-apple-pay, payment-google-pay, payment-mastercard, payment-paypal, payment-stripe, payment-visa, receipt

### Security & Privacy

hide, key, lock, lock-open, shield-check, show

### Shapes & Symbols

circle-check, circle-help, command, double-quotes-l, double-quotes-r, equals, hashtag, octagon-error, option, shape-circle, shape-octagon, shape-shield, shape-square, shape-triangle, shape-wavy, square-check, stop-sign, target, triangle-warning

### Shopping & Commerce

gift, shopping-bag, shopping-cart, ticket-voucher, truck

### Social & Ratings

emoji-neutral, emoji-sad, emoji-smile, heart, star, star-full, star-half, thumbs-down, thumbs-up

### System & Devices

resize-handle, system-bar-bottom, system-bar-collapse, system-bar-expand, system-bar-left, system-bar-left-collapse, system-bar-left-expand, system-bar-right, system-bar-top, system-camera, system-code, system-cylinder, system-data, system-desktop, system-desktop-tower, system-devices, system-laptop, system-mobile-button, system-monitor-play, system-printer, system-qr-code, system-save, system-tablet, system-terminal, system-wifi, system-wifi-problem, system-window, system-window-check, system-window-close, system-window-code-block, system-window-sidebar, system-window-terminal

### Text Formatting

bold, font, heading-h1, heading-h2, heading-h3, heading-h4, heading-h5, heading-h6, italic, paragraph, short-text, strikethrough, text, text-align-center, text-align-justify, text-align-left, text-align-right, underline

### UI Elements

external-link, info, label, layer, layers, link-break, link-horizontal, link-horizontal-off, palette, paperclip-attachment, route, ruler, scale, search-magnifying-glass, settings, slider-filter, snippet, tag

### Users & Groups

customer-info, group-add, headset, user, user-add, user-arrow, user-card-id, user-check, user-close, user-mute, user-remove, user-voice, users, users-group

### Apps (Third-party Integrations)

app-aftership, app-chargeflow, app-loop, app-recharge, app-shipbob, app-shipmonkey, app-shipstation, app-wonderment

### Workflow & Automation

flows, graduated, inbox, incoming-inbox, log-out, rocket, science, snippet, sort-ascending, sort-descending, suitcase, translate, unsubscribe, wavy-check, webhook, wrench, wysiwyg, zap

### Miscellaneous

gorgias-logo, magnifying-glass-minus, magnifying-glass-plus, mention, mic, mic-mute, percent, select-multiple, soundwave, soundwave-off, sun, swicht-left, swicht-right, trash-empty

## Color Behavior

- **Regular intent**: Inherits text color by default, can be customized with `color` prop
- **AI intent**: Uses gradient colors, `color` prop is ignored
- **App/colored icons**: Some icons have built-in colors that override the `color` prop
- **`withBackground`**: Adds padding, a rounded background, and a subtle 0.5px border matching the icon's color. When `color` is also set, the background uses the matching surface token (e.g. `blue` → `--surface-additional-blue`). Without `color`, falls back to `--surface-neutral-secondary`.

## Related Components

- **Button**: Commonly uses icons in slots or as icon-only buttons
- **TextField**: Uses icons in leading/trailing slots
- **Banner**: Uses icons for message types

## Testing Queries

```typescript
// Query by role and name (default behavior)
screen.getByRole('img', { name: 'settings' })

// Query by custom alt text
screen.getByRole('img', { name: 'Open settings menu' })

// Decorative icons are hidden (no role)
const { container } = render(<Icon name="decorative" alt="" />)
const svg = container.querySelector('svg')
expect(svg).toHaveAttribute('aria-hidden', 'true')

// Check size class
const icon = screen.getByRole('img', { name: 'check' })
expect(icon.parentElement).toHaveClass('sm')

// Check AI intent
const aiIcon = screen.getByRole('img', { name: 'sparkles' })
expect(aiIcon.parentElement).toHaveClass('ai')

// Check custom color
const coloredIcon = screen.getByRole('img', { name: 'star' })
expect(coloredIcon.parentElement).toHaveStyle({ color: '#FFD700' })

// Check data-color attribute (set when color prop is provided)
const blueIcon = screen.getByRole('img', { name: 'info' })
expect(blueIcon.parentElement).toHaveAttribute('data-color', 'blue')

// Check withBackground class
const bgIcon = screen.getByRole('img', { name: 'settings' })
expect(bgIcon.parentElement).toHaveClass('withBackground')
```
