# MultiSelectField

Form field component for selecting multiple options from a dropdown list.

## Import

```typescript
import { MultiSelectField } from '@gorgias/axiom'
```

## Props

### MultiSelectFieldProps<T>

Extends `FieldProps<T[]>`, `ListSearchableProps`, and `SelectItemsProps<T>`.

```typescript
type MultiSelectFieldProps<T extends object> = {
    // Field props
    label?: string // Label text above field
    error?: string | ReactNode // Error message/element when validation fails
    caption?: string // Helper text below field
    isDisabled?: boolean // Whether field is disabled
    isRequired?: boolean // Whether field is required
    isInvalid?: boolean // Whether field is in error state

    // Value props (controlled/uncontrolled)
    value?: T[] // Currently selected items (controlled)
    defaultValue?: T[] // Initial selected items (uncontrolled)
    onChange?: (value: T[]) => void // Selection change callback

    // Select props
    items: T[] // Array of items to select from
    placeholder?: string // Placeholder text when no options selected
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

### Basic MultiSelectField

```typescript
type Tag = { id: number; name: string }
const tags: Tag[] = [
  { id: 1, name: 'Bug' },
  { id: 2, name: 'Feature' },
  { id: 3, name: 'Documentation' }
]

// Uncontrolled (recommended)
<MultiSelectField
  label="Tags"
  items={tags}
  placeholder="Select tags"
  onChange={(selectedTags) => console.log(selectedTags)}
>
  {(tag) => <ListItem label={tag.name} />}
</MultiSelectField>

// Controlled
const [selectedTags, setSelectedTags] = useState<Tag[]>([])
<MultiSelectField
  label="Tags"
  items={tags}
  value={selectedTags}
  onChange={setSelectedTags}
>
  {(tag) => <ListItem label={tag.name} />}
</MultiSelectField>
```

### With Caption

```typescript
<MultiSelectField
  label="Categories"
  items={categories}
  caption="Select one or more categories for this item"
>
  {(category) => <ListItem label={category.name} />}
</MultiSelectField>
```

### With Error

```typescript
<MultiSelectField
  label="Team members"
  items={users}
  error="Please select at least one team member"
>
  {(user) => <ListItem label={user.name} />}
</MultiSelectField>
```

### Required Field

```typescript
<MultiSelectField
  label="Skills"
  items={skills}
  isRequired
>
  {(skill) => <ListItem label={skill.name} />}
</MultiSelectField>
```

### Disabled State

```typescript
<MultiSelectField
  label="Options"
  items={options}
  isDisabled
>
  {(option) => <ListItem label={option.label} />}
</MultiSelectField>
```

### Invalid State

```typescript
<MultiSelectField
  label="Permissions"
  items={permissions}
  isInvalid
  error="This field is required"
>
  {(permission) => <ListItem label={permission.name} />}
</MultiSelectField>
```

### Searchable MultiSelect

```typescript
// Uncontrolled search
<MultiSelectField
  label="Countries"
  items={countries}
  isSearchable
>
  {(country) => <ListItem label={country.name} />}
</MultiSelectField>

// Controlled search with custom filtering
const [searchValue, setSearchValue] = useState('')
const filteredCountries = countries.filter(country =>
  country.name.toLowerCase().includes(searchValue.toLowerCase())
)

<MultiSelectField
  label="Countries"
  items={filteredCountries}
  isSearchable
  searchValue={searchValue}
  onSearchChange={setSearchValue}
>
  {(country) => <ListItem label={country.name} />}
</MultiSelectField>
```

### With Header and Footer

```typescript
<MultiSelectField
  label="Team Members"
  items={users}
  header={<ListHeader>Select team members</ListHeader>}
  footer={
    <Button variant="tertiary" size="sm">
      Invite more members
    </Button>
  }
>
  {(user) => <ListItem label={user.name} description={user.email} />}
</MultiSelectField>
```

### Custom Item Rendering

```typescript
<MultiSelectField
  label="Assignees"
  items={users}
>
  {(user) => (
    <ListItem
      leadingSlot={<Avatar name={user.name} />}
      label={user.name}
      description={user.email}
      trailingSlot={user.isActive ? <Dot color="success" /> : null}
    />
  )}
</MultiSelectField>
```

### Dropdown Placement

```typescript
<MultiSelectField
  label="Options"
  items={options}
  placement="top"
  shouldFlip={false}
>
  {(option) => <ListItem label={option.label} />}
</MultiSelectField>
```

### Custom Max Height

```typescript
<MultiSelectField
  label="Cities"
  items={cities}
  maxHeight={300}
>
  {(city) => <ListItem label={city.name} />}
</MultiSelectField>
```

### Custom Key Name

By default, MultiSelectField uses `id` as the unique key. You can specify a different property.

```typescript
type Option = { code: string; name: string }

<MultiSelectField
  label="Languages"
  items={languages}
  keyName="code"
>
  {(language) => <ListItem label={language.name} />}
</MultiSelectField>
```

## Related Components

- **SelectField**: For selecting a single option
- **MultiSelect**: Headless multi-select component without field wrapper
- **CheckBoxField**: For boolean selection
- **RadioGroup**: For mutually exclusive selections
- **Label**: Standalone label component

## Testing Queries

```typescript
// By label text
screen.getByText('Tags')

// By placeholder
screen.getByText('Select tags')

// Open dropdown
await userEvent.click(screen.getByText('Select tags'))

// Select options
await userEvent.click(screen.getByRole('option', { name: 'Bug' }))
await userEvent.click(screen.getByRole('option', { name: 'Feature' }))

// Check selection
expect(onChange).toHaveBeenCalledWith([entries[0], entries[1]])
```
