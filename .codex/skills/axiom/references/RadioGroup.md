# RadioGroup

Radio button group component for single-selection from multiple visible options.

## Import

```typescript
import { Radio, RadioCard, RadioGroup } from '@gorgias/axiom'
```

## Props

### RadioGroupProps

RadioGroup manages a group of radio buttons. Extends `BoxProps` for layout customization.

```typescript
type RadioGroupProps = {
    // Value (controlled/uncontrolled)
    value?: string // Currently selected value (controlled)
    defaultValue?: string // Initial selected value (uncontrolled)
    onChange?: (value: string) => void // Selection change callback

    // Accessibility
    'aria-label': string // Required accessible label

    // State
    isDisabled?: boolean // Disable entire group
    isReadOnly?: boolean // Make group read-only

    // Form
    name?: string // Form field name

    // Content
    children: ReactNode // Radio or RadioCard components
} & BoxProps // Includes flexDirection, gap, etc.
```

### RadioProps

Individual radio button within a RadioGroup.

```typescript
type RadioProps = {
    // Value
    value: string // Unique value for this radio option

    // Content
    label?: string // Label text next to radio
    caption?: string // Helper text below radio
    error?: string | ReactNode // Error message when validation fails

    // Layout
    direction?: 'left' | 'right' // Label position. Default: 'left'

    // State
    isDisabled?: boolean // Disable this radio option
    isRequired?: boolean // Show required indicator

    // Accessibility
    'aria-label'?: string // Accessible label (if no visible label)
}
```

### RadioCardProps

Card-style radio button with title and description.

```typescript
type RadioCardProps = RadioProps & {
    title: string // Card title (required)
    description?: string // Card description
    elevation?: 'default' | 'mid' | 'high' // Card elevation
    children?: ReactNode // Additional content in card
}
```

## Usage

### Basic RadioGroup

```typescript
// Controlled
const [value, setValue] = useState('medium')

<RadioGroup
  value={value}
  onChange={setValue}
  aria-label="Priority"
  flexDirection="column"
  gap="sm"
>
  <Radio label="Low priority" value="low" />
  <Radio label="Medium priority" value="medium" />
  <Radio label="High priority" value="high" />
  <Radio label="Urgent" value="urgent" />
</RadioGroup>

// Uncontrolled
<RadioGroup
  defaultValue="medium"
  aria-label="Priority"
  flexDirection="column"
>
  <Radio label="Low priority" value="low" />
  <Radio label="Medium priority" value="medium" />
  <Radio label="High priority" value="high" />
</RadioGroup>
```

### With Captions

```typescript
<RadioGroup
  defaultValue="standard"
  aria-label="Shipping"
  flexDirection="column"
>
  <Radio
    label="Standard shipping"
    value="standard"
    caption="5-7 business days · Free"
  />
  <Radio
    label="Express shipping"
    value="express"
    caption="2-3 business days · $9.99"
  />
  <Radio
    label="Overnight"
    value="overnight"
    caption="Next business day · $24.99"
  />
</RadioGroup>
```

### Label Direction

```typescript
// Label on left (default)
<RadioGroup defaultValue="email" aria-label="Contact method">
  <Radio label="Email" value="email" />
  <Radio label="Phone" value="phone" />
</RadioGroup>

// Label on right
<RadioGroup defaultValue="email" aria-label="Contact method">
  <Radio label="Email" value="email" direction="right" />
  <Radio label="Phone" value="phone" direction="right" />
</RadioGroup>
```

### Required Field

```typescript
<RadioGroup aria-label="Subscription plan" flexDirection="column">
  <Radio label="Free plan" value="free" />
  <Radio label="Pro plan" value="pro" isRequired />
  <Radio label="Enterprise" value="enterprise" />
</RadioGroup>
```

### Disabled Options

```typescript
<RadioGroup
  defaultValue="medium"
  aria-label="Priority"
  flexDirection="column"
>
  <Radio label="Low priority" value="low" />
  <Radio label="Medium priority" value="medium" />
  <Radio label="High priority" value="high" isDisabled />
  <Radio label="Urgent" value="urgent" />
</RadioGroup>
```

### Disabled Group

```typescript
<RadioGroup
  defaultValue="medium"
  isDisabled
  aria-label="Priority"
  flexDirection="column"
>
  <Radio label="Low priority" value="low" />
  <Radio label="Medium priority" value="medium" />
  <Radio label="High priority" value="high" />
</RadioGroup>
```

### RadioCard

```typescript
<RadioGroup
  defaultValue="basic"
  aria-label="Plan"
  flexDirection="column"
>
  <RadioCard
    value="basic"
    title="Basic Plan"
    description="Perfect for individuals"
    elevation="mid"
  >
    <Text size="sm" color="var(--grey-600)">$9/month</Text>
  </RadioCard>

  <RadioCard
    value="pro"
    title="Pro Plan"
    description="For growing teams"
    elevation="mid"
  >
    <Text size="sm" color="var(--grey-600)">$29/month</Text>
  </RadioCard>

  <RadioCard
    value="enterprise"
    title="Enterprise"
    description="For large organizations"
    elevation="mid"
  >
    <Text size="sm" color="var(--grey-600)">Custom pricing</Text>
  </RadioCard>
</RadioGroup>
```

### Horizontal Layout

```typescript
<RadioGroup
  defaultValue="credit"
  aria-label="Payment method"
  flexDirection="row"
  gap="md"
>
  <Radio label="Credit card" value="credit" />
  <Radio label="PayPal" value="paypal" />
  <Radio label="Bank transfer" value="bank" />
</RadioGroup>
```

### With Error State

```typescript
<RadioGroup
  aria-label="Terms acceptance"
  flexDirection="column"
>
  <Radio
    label="I accept the terms and conditions"
    value="accept"
    error="You must accept the terms to continue"
  />
</RadioGroup>
```

### Without Labels

```typescript
<RadioGroup
  defaultValue="2"
  aria-label="Rating"
  flexDirection="row"
  gap="sm"
>
  <Radio value="1" aria-label="1 star" />
  <Radio value="2" aria-label="2 stars" />
  <Radio value="3" aria-label="3 stars" />
  <Radio value="4" aria-label="4 stars" />
  <Radio value="5" aria-label="5 stars" />
</RadioGroup>
```

### Read-Only State

```typescript
<RadioGroup
  value="pro"
  isReadOnly
  aria-label="Current plan"
  flexDirection="column"
>
  <Radio label="Free" value="free" />
  <Radio label="Pro" value="pro" />
  <Radio label="Enterprise" value="enterprise" />
</RadioGroup>
```

### With Custom Layout

```typescript
<RadioGroup
  defaultValue="option1"
  aria-label="Options"
  flexDirection="column"
  gap="lg"
  p="md"
  style={{ border: '1px solid var(--grey-300)' }}
>
  <Radio label="Option 1" value="option1" />
  <Radio label="Option 2" value="option2" />
  <Radio label="Option 3" value="option3" />
</RadioGroup>
```

## Layout with Box Props

RadioGroup extends Box, so you can use all Box layout props:

```typescript
<RadioGroup
  defaultValue="email"
  aria-label="Notifications"
  // Box props
  flexDirection="column"
  gap="md"
  p="lg"
  w="100%"
  maxWidth="400px"
>
  <Radio label="Email notifications" value="email" />
  <Radio label="SMS notifications" value="sms" />
  <Radio label="Push notifications" value="push" />
</RadioGroup>
```

## Related Components

- **Radio**: Individual radio button within RadioGroup
- **RadioCard**: Card-style radio button
- **Select**: Dropdown selection for many options
- **CheckBoxField**: For multiple selections
- **ToggleField**: For binary on/off choices

## Testing Queries

```typescript
// Find radio group
screen.getByRole('radiogroup', { name: 'Priority' })

// Find individual radios
screen.getByRole('radio', { name: 'Low priority' })
screen.getByRole('radio', { name: 'Medium priority' })
screen.getAllByRole('radio')

// Check selection state
expect(screen.getByRole('radio', { name: 'Medium priority' })).toBeChecked()
expect(screen.getByRole('radio', { name: 'Low priority' })).not.toBeChecked()

// Select a radio
const user = userEvent.setup()
await user.click(screen.getByRole('radio', { name: 'High priority' }))
expect(screen.getByRole('radio', { name: 'High priority' })).toBeChecked()

// Disabled state
expect(screen.getByRole('radio', { name: 'Urgent' })).toBeDisabled()

// Radio without visible label
screen.getByRole('radio', { name: '5 stars' }) // Uses aria-label
```
