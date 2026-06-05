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
    color?: ColorValue // Custom color (hex, CSS var, or Color enum) — ignored when intent is 'ai'
    alt?: string // Accessibility label (empty string for decorative)
}
```

> **No `withBackground` / `withBorder`.** Those props were removed from `Icon`.
> For a colored, rounded container behind an icon, use the `IconBox` component
> (`variant`/`color`/`size`) instead. See `references/IconBox.md`.

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
<Icon name="ai" intent="ai" />
<Icon name="settings-ai" intent="ai" />
```

### Custom Colors

```typescript
// Using Color enum value
<Icon name="check" color="success-500" />
<Icon name="warning-triangle" color="warning-500" />
<Icon name="error-octagon" color="error-500" />

// Using a semantic token (bare token name — omit the var(--) wrapper)
<Icon name="info" color="content-neutral-secondary" />

// Using hex color
<Icon name="star" color="#FFD700" />
```

### Colored Container (use IconBox)

```typescript
import { IconBox } from '@gorgias/axiom'

// IconBox provides the rounded, colored background that Icon used to via withBackground
// Note: IconBox takes `icon`, not `name`
<IconBox icon="settings" />
<IconBox icon="info" color="blue" />
<IconBox icon="warning-triangle" color="coral" />
```

### Accessibility

```typescript
// Semantic icon (uses icon name as label by default)
<Icon name="settings" />

// Custom accessible label
<Icon name="settings" alt="Open settings menu" />

// Decorative icon (hidden from screen readers)
<Icon name="shape-wavy" alt="" />
```

### In Buttons

```typescript
// Icon-only button
<Button icon={<Icon name="settings" />} />

// Button with icon slots — prefer the icon-name string
<Button leadingSlot="add-plus">Add Item</Button>
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

> The full set is the `IconName` union exported from `@gorgias/axiom` (currently
> 439 names). The canonical source is `src/Icon/icons.ts`. The grouping below is
> for browsing only — names are listed exactly as they must be passed.

### AI

ai, ai-agent-feedback, ai-alt-1, ai-search, ai-skill, ai-ticket-summary, settings-ai

### Arrows & Chevrons

arrow-chevron-down, arrow-chevron-down-duo, arrow-chevron-left, arrow-chevron-left-duo, arrow-chevron-right, arrow-chevron-right-duo, arrow-chevron-up, arrow-chevron-up-duo, arrow-collapse, arrow-down, arrow-down-circle, arrow-down-left, arrow-down-left-circle, arrow-down-right, arrow-down-right-circle, arrow-down-up, arrow-expand, arrow-left, arrow-left-circle, arrow-left-right, arrow-merging, arrow-reload-alt-1, arrow-reload-alt-2, arrow-right, arrow-right-circle, arrow-routing, arrow-sub-down-left, arrow-sub-down-right, arrow-sub-left-down, arrow-sub-left-up, arrow-sub-right-down, arrow-sub-right-up, arrow-sub-up-left, arrow-sub-up-right, arrow-undo-down-left, arrow-undo-down-right, arrow-undo-up-left, arrow-undo-up-right, arrow-unfold-less, arrow-unfold-more, arrow-up, arrow-up-circle, arrow-up-left, arrow-up-left-circle, arrow-up-right, arrow-up-right-circle

### Apps & Integrations (branded)

aircall, app-aftership, app-bicommerce, app-chargeflow, app-cin-7, app-loop, app-magento, app-recharge, app-seal, app-shipbob, app-shiphero, app-shipmonkey, app-shipstation, app-shopify, app-smile, app-stayai, app-tiktok, app-webhooks, app-wonderment, app-woo, app-yotpo, attentive, channel-yotpo, klaviyo, loyalty-lion, okendo, pipedream, postscript, reviews-io, rivo, stamped, zapier

### Calendar & Time

alarm, calendar, calendar-add, calendar-check, calendar-close, calendar-days, calendar-event, calendar-remove, calendar-week, clock, history, timer, timer-add, timer-close, timer-remove, timer-snooze

### Channels

channel-aircall, channel-api, channel-facebook, channel-fb-messenger, channel-google, channel-google-business, channel-gorgias-chat, channel-instagram, channel-instagram-dm, channel-linkedin, channel-reply, channel-tiktok, channel-whatsapp, channel-x, channel-yotpo-2, channel-youtube

### Charts & Data

chart-bar-horizontal, chart-bar-vertical, chart-line, chart-line-alt, chart-pie, data-object, trending-down, trending-up

### Chat & Messaging

chat, chat-add-circle, chat-check-circle, chat-circle, chat-close-circle, chat-conversation, chat-conversation-circle, chat-dots, chat-dots-circle, chat-order, chat-remove-circle, command, mention, send

### Phone & Voice

headset, ivr, mic, mic-mute, phone, phone-end, phone-incoming, phone-missed, phone-outgoing, soundwave, soundwave-off, voicemail

### Notifications

bell, bell-add, bell-close, bell-notification, bell-off, bell-remove, bell-ring

### Cloud & Storage

cloud, cloud-add, cloud-check, cloud-close, cloud-download, cloud-off, cloud-remove, cloud-upload

### Files & Folders

copy, description, file-add, file-blank, file-check, file-close, file-code, file-document, file-download, file-edit, file-remove, file-search, file-upload, files, folder, folder-add, folder-check, folder-close, folder-code, folder-document, folder-download, folder-edit, folder-remove, folder-search, folder-upload, folders, paperclip-attachment, snippet

### Notes & Documents

article, book, book-open, bookmark, note, note-edit, note-search, notebook

### Lists & Tables

columns, list-add, list-check, list-checklist, list-ordered, list-remove, list-unordered, select-multiple, sort-ascending, sort-descending, table, table-add, table-remove

### Media & Images

media-forward, media-image, media-image-add, media-pause, media-pause-circle, media-play-circle, media-play-pause, media-rewind, media-shuffle, media-skip-back, media-skip-forward, media-stop-circle, media-volume-max, media-volume-min, media-volume-minus, media-volume-off, media-volume-plus

### Menus & Drag

dots-kebab-vertical, dots-meatballs-horizontal, drag-horizontal, drag-vertical, grip, menu-alt-1, menu-alt-2, menu-alt-3, menu-alt-4, menu-alt-5, menu-burger, menu-more-grid, resize-handle

### Navigation & Location

nav-building-alt-1, nav-building-alt-2, nav-building-alt-3, nav-building-alt-4, nav-car-auto, nav-compass, nav-flag, nav-globe, nav-home, nav-house-add, nav-house-check, nav-house-close, nav-house-remove, nav-map, nav-map-pin, nav-navigation

### Payments & Commerce

attach-money, credit-card, gift, money-off, payment-amex, payment-apple-pay, payment-google-pay, payment-mastercard, payment-paypal, payment-stripe, payment-visa, receipt, shopping-bag, shopping-cart, ticket-voucher, truck

### Users & Groups

customer-info, group-add, user, user-add, user-arrow, user-card-id, user-check, user-close, user-mute, user-remove, user-voice, users, users-group

### Security

check-shield, hide, key, lock, lock-open, shape-shield, show

### Shapes & Status

check, check-all, check-circle, check-square, check-wavy, close, close-circle, equals, error-octagon, hashtag, option, percent, shape-circle, shape-octagon, shape-square, shape-triangle, shape-wavy, stop-sign, target, warning-triangle

### Text Formatting

bold, font, heading-h1, heading-h2, heading-h3, heading-h4, heading-h5, heading-h6, italic, paragraph, strikethrough, text, text-align-center, text-align-justify, text-align-left, text-align-right, text-short, underline

### System & Devices

system-bar-bottom, system-bar-collapse, system-bar-expand, system-bar-left, system-bar-left-collapse, system-bar-left-expand, system-bar-right, system-bar-top, system-camera, system-code, system-cylinder, system-data, system-desktop, system-desktop-tower, system-devices, system-laptop, system-mobile-button, system-monitor-play, system-printer, system-qr-code, system-save, system-tablet, system-terminal, system-wifi, system-wifi-problem, system-window, system-window-check, system-window-close, system-window-code-block, system-window-sidebar, system-window-terminal

### Links

external-link, link-break, link-horizontal, link-horizontal-off

### Search

magnifying-glass, magnifying-glass-minus, magnifying-glass-plus

### Emoji & Ratings

emoji-neutral, emoji-sad, emoji-smile, heart, star, star-full, star-half, thumbs-down, thumbs-up

### Add / Remove

add-plus, add-plus-circle, add-to-queue, remove-minus, remove-minus-circle, trash-empty

### Workflow & Automation

exit, flows, forward, graduated, inbox, log-out, redo, rocket, route, science, suitcase, switch-left, switch-right, translate, undo, unsubscribe, webhook, wrench, wysiwyg, zap

### Miscellaneous

archive, crop, double-quotes-left, double-quotes-right, download, download-package, edit-pencil, gorgias-logo, help-circle, inbox-incoming, info, judge-me, label, layer, layers, light-bulb, mail, mail-open, move, move-horizontal, move-vertical, palette, ruler, scale, settings, share-i-os-export, shopping-cart-add, slider-filter, sun, tag, triple-whale
## Color Behavior

- **Regular intent**: Inherits text color by default, can be customized with `color` prop
- **AI intent**: Uses gradient colors, `color` prop is ignored
- **App/colored icons**: Some icons have built-in colors that override the `color` prop
- **Colored container**: Use `IconBox` (not `Icon`) when you need a rounded, colored background behind the icon

## Related Components

- **IconBox**: Renders an icon inside a colored, rounded container (replaces the old `withBackground`)
- **GaiaIcon**: Renders the Gaia brand icon in a circular bordered container
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
const { container } = render(<Icon name="shape-wavy" alt="" />)
const svg = container.querySelector('svg')
expect(svg).toHaveAttribute('aria-hidden', 'true')

// Check size class
const icon = screen.getByRole('img', { name: 'check' })
expect(icon.parentElement).toHaveClass('sm')

// Check AI intent
const aiIcon = screen.getByRole('img', { name: 'ai' })
expect(aiIcon.parentElement).toHaveClass('ai')

// Check custom color
const coloredIcon = screen.getByRole('img', { name: 'star' })
expect(coloredIcon.parentElement).toHaveStyle({ color: '#FFD700' })

// Check data-color attribute (set when color prop is provided)
const blueIcon = screen.getByRole('img', { name: 'info' })
expect(blueIcon.parentElement).toHaveAttribute('data-color', 'blue')
```
