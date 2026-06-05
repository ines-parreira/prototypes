# SelectField

Form field component for selecting a single option from a dropdown list.

## Import

```typescript
import { SelectField } from '@gorgias/axiom'
```

## Props

### SelectFieldProps<T>

Extends `FieldProps<T>`, `ListSearchableProps`, and `SelectItemsProps<T>`.

```typescript
type SelectFieldRenderProps = {
    isOpen: boolean // Whether the dropdown is currently open
}

type SelectFieldProps<T extends object> = {
    // Field props
    label?: string // Label text above field
    error?: string | ReactNode // Error message/element when validation fails
    caption?: string // Helper text below field
    isDisabled?: boolean // Whether field is disabled
    isRequired?: boolean // Whether field is required
    isInvalid?: boolean // Whether field is in error state

    // Value props (controlled/uncontrolled)
    value?: T // Currently selected item (controlled)
    defaultValue?: T // Initial selected item (uncontrolled)
    onChange?: (value: T) => void // Selection change callback

    // Select props
    items: T[] // Array of items to select from
    placeholder?: string // Placeholder text when no option selected
    leadingSlot?: SlotProp // Icon/content before text
    /**
     * Icon, element, or render function shown after the input text.
     * Omit for the default animated chevron. Pass `null` to hide entirely.
     */
    trailingSlot?: SlotProp<SelectFieldRenderProps> | null
    keyName?: string // Property name for unique key. Default: 'id'

    // Dropdown props
    placement?: 'top' | 'bottom' | 'left' | 'right' // Dropdown placement. Default: 'bottom'
    shouldFlip?: boolean // Auto-flip when insufficient space. Default: true
    maxHeight?: number // Maximum dropdown height in pixels
    header?: ReactNode // Header content at top of dropdown
    footer?: ReactNode // Footer content at bottom of dropdown

    // Search props
    isSearchable?: boolean // Enable search functionality
    searchValue?: string // Current search value (controlled)
    onSearchChange?: (value: string) => void // Search change callback

    // Render function
    children: (option: T) => ReactNode // Render function for each option
}
```

## Usage

### Basic SelectField

```typescript
type Animal = { id: number; name: string }
const animals: Animal[] = [
  { id: 1, name: 'Cat' },
  { id: 2, name: 'Dog' },
  { id: 3, name: 'Rabbit' }
]

// Uncontrolled (recommended)
<SelectField
  label="Animals"
  items={animals}
  placeholder="Select an animal"
  onChange={(animal) => console.log(animal)}
>
  {(animal) => <ListItem label={animal.name} />}
</SelectField>

// Controlled
const [selectedAnimal, setSelectedAnimal] = useState<Animal | undefined>()
<SelectField
  label="Animals"
  items={animals}
  value={selectedAnimal}
  onChange={setSelectedAnimal}
>
  {(animal) => <ListItem label={animal.name} />}
</SelectField>
```

### With Caption

```typescript
<SelectField
  label="Priority"
  items={priorities}
  caption="Choose the priority level for this task"
>
  {(priority) => <ListItem label={priority.label} />}
</SelectField>
```

### With Error

```typescript
<SelectField
  label="Country"
  items={countries}
  error="Please select a country"
>
  {(country) => <ListItem label={country.name} />}
</SelectField>
```

### Required Field

```typescript
<SelectField
  label="Status"
  items={statuses}
  isRequired
>
  {(status) => <ListItem label={status.label} />}
</SelectField>
```

### With Leading Icon

```typescript
<SelectField
  label="Priority"
  items={priorities}
  leadingSlot="flag"
>
  {(priority) => <ListItem label={priority.label} />}
</SelectField>
```

### With Custom Trailing Slot

```typescript
// Static icon
<SelectField label="Priority" items={priorities} trailingSlot="settings">
  {(priority) => <ListItem label={priority.label} />}
</SelectField>

// Render function — receives isOpen
<SelectField
  label="Priority"
  items={priorities}
  trailingSlot={({ isOpen }) => <DropdownIcon isOpen={isOpen} />}
>
  {(priority) => <ListItem label={priority.label} />}
</SelectField>

// Hide trailing slot entirely
<SelectField label="Priority" items={priorities} trailingSlot={null}>
  {(priority) => <ListItem label={priority.label} />}
</SelectField>
```

### Disabled State

```typescript
<SelectField
  label="Status"
  items={statuses}
  isDisabled
>
  {(status) => <ListItem label={status.label} />}
</SelectField>
```

### Invalid State

```typescript
<SelectField
  label="Category"
  items={categories}
  isInvalid
  error="This field is required"
>
  {(category) => <ListItem label={category.name} />}
</SelectField>
```

### Searchable Select

```typescript
// Uncontrolled search
<SelectField
  label="Country"
  items={countries}
  isSearchable
>
  {(country) => <ListItem label={country.name} />}
</SelectField>

// Controlled search with custom filtering
const [searchValue, setSearchValue] = useState('')
const filteredCountries = countries.filter(country =>
  country.name.toLowerCase().includes(searchValue.toLowerCase())
)

<SelectField
  label="Country"
  items={filteredCountries}
  isSearchable
  searchValue={searchValue}
  onSearchChange={setSearchValue}
>
  {(country) => <ListItem label={country.name} />}
</SelectField>
```

### With Header and Footer

```typescript
<SelectField
  label="Team Member"
  items={users}
  header={<ListHeader>Select a team member</ListHeader>}
  footer={
    <Button variant="tertiary" size="sm">
      Invite new member
    </Button>
  }
>
  {(user) => <ListItem label={user.name} description={user.email} />}
</SelectField>
```

### Custom Item Rendering

```typescript
<SelectField
  label="User"
  items={users}
>
  {(user) => (
    <ListItem
      leadingSlot={<Avatar name={user.name} />}
      label={user.name}
      description={user.email}
      trailingSlot={user.isOnline ? <Dot color="success" /> : null}
    />
  )}
</SelectField>
```

### Dropdown Placement

```typescript
<SelectField
  label="Status"
  items={statuses}
  placement="top"
  shouldFlip={false}
>
  {(status) => <ListItem label={status.label} />}
</SelectField>
```

### Custom Max Height

```typescript
<SelectField
  label="City"
  items={cities}
  maxHeight={200}
>
  {(city) => <ListItem label={city.name} />}
</SelectField>
```

### Custom Key Name

By default, SelectField uses `id` as the unique key. You can specify a different property.

```typescript
type Option = { code: string; name: string }

<SelectField
  label="Language"
  items={languages}
  keyName="code"
>
  {(language) => <ListItem label={language.name} />}
</SelectField>
```

## Related Components

- **MultiSelectField**: For selecting multiple options
- **Select**: Headless select component without field wrapper
- **TextField**: For text input
- **DateField**: For date selection
- **RadioGroup**: For mutually exclusive selections (inline)
- **Label**: Standalone label component

## Testing Queries

```typescript
// By role and label
screen.getByRole('textbox', { name: 'Animals' })

// By placeholder
screen.getByPlaceholderText('Select an animal')

// By label text
screen.getByText('Animals')

// Open dropdown
await userEvent.click(screen.getByPlaceholderText('Select an animal'))

// Select option
await userEvent.click(screen.getByRole('option', { name: 'Cat' }))

// Check selection
expect(onChange).toHaveBeenCalledWith(entries[0])

// Check states
expect(screen.getByRole('textbox')).toBeDisabled()
```
