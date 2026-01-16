# Form Patterns

Patterns for building forms using Axiom form field components, @repo/forms utilities, and project conventions.

## Axiom Form Field Components

Always use Axiom's Field components for form inputs. They include built-in label, caption, error handling, and accessibility.

### TextField

```tsx
import { TextField } from '@gorgias/axiom'

// Controlled
<TextField
    label="Name"
    value={name}
    onChange={setName}
    isRequired
/>

// With error
<TextField
    label="Email"
    value={email}
    onChange={setEmail}
    error="Invalid email address"
/>

// With caption
<TextField
    label="Username"
    value={username}
    onChange={setUsername}
    caption="This will be your public display name"
/>

// With slots
<TextField
    label="Search"
    value={query}
    onChange={setQuery}
    leadingSlot="search"
    trailingSlot={<Button icon={<Icon name="close" />} aria-label="Clear" />}
/>
```

**TextField Props:**
- `label`: string
- `value`: string
- `onChange`: (value: string) => void
- `error`: string | ReactNode
- `caption`: string
- `isRequired`: boolean
- `isDisabled`: boolean
- `isInvalid`: boolean
- `leadingSlot`, `trailingSlot`: IconName | ReactNode
- `type`: HTML input type
- `placeholder`: string

### NumberField

```tsx
import { NumberField } from '@gorgias/axiom'

// Controlled
<NumberField
    label="Quantity"
    value={quantity}
    onChange={setQuantity}
/>

// With constraints
<NumberField
    label="Age"
    value={age}
    onChange={setAge}
    minValue={0}
    maxValue={120}
/>

// With error
<NumberField
    label="Amount"
    value={amount}
    onChange={setAmount}
    error="Amount must be positive"
/>
```

**NumberField Props:**
- Same as TextField, but `value`/`onChange` use `number`
- `minValue`, `maxValue`: number constraints
- `step`: number increment

### SelectField

```tsx
import { SelectField, ListItem } from '@gorgias/axiom'

// Basic usage
<SelectField
    label="Country"
    items={countries}
    value={selectedCountry}
    onChange={setSelectedCountry}
>
    {(country) => <ListItem label={country.name} />}
</SelectField>

// With search
<SelectField
    label="User"
    items={users}
    value={selectedUser}
    onChange={setSelectedUser}
    isSearchable
    searchValue={searchQuery}
    onSearchChange={setSearchQuery}
>
    {(user) => <ListItem label={user.name} description={user.email} />}
</SelectField>

// With placeholder
<SelectField
    label="Priority"
    items={priorities}
    value={priority}
    onChange={setPriority}
    placeholder="Select priority..."
>
    {(item) => <ListItem label={item.label} />}
</SelectField>
```

**SelectField Props:**
- `label`: string
- `items`: T[] - array of selectable items
- `value`: T - selected item
- `onChange`: (value: T) => void
- `children`: (item: T) => ReactNode - render function for options
- `placeholder`: string
- `isSearchable`: boolean
- `searchValue`, `onSearchChange`: search control
- `maxHeight`: number
- `leadingSlot`: IconName | ReactNode
- `error`, `caption`, `isRequired`, `isDisabled`

### CheckBoxField

```tsx
import { CheckBoxField } from '@gorgias/axiom'

// Controlled
<CheckBoxField
    label="Accept terms and conditions"
    value={accepted}
    onChange={setAccepted}
    isRequired
/>

// With caption
<CheckBoxField
    label="Enable notifications"
    value={notificationsEnabled}
    onChange={setNotificationsEnabled}
    caption="We'll send you updates about your account"
/>

// Indeterminate state (for "select all" patterns)
<CheckBoxField
    label="Select all"
    value={allSelected}
    onChange={toggleAll}
    isIndeterminate={someSelected && !allSelected}
/>

// Label on left
<CheckBoxField
    label="Active"
    value={isActive}
    onChange={setIsActive}
    direction="left"
/>
```

**CheckBoxField Props:**
- `label`: string
- `value`: boolean
- `onChange`: (value: boolean) => void
- `isIndeterminate`: boolean
- `direction`: `'left'` | `'right'`
- `error`, `caption`, `isRequired`, `isDisabled`

### ToggleField

```tsx
import { ToggleField } from '@gorgias/axiom'

// Controlled
<ToggleField
    label="Dark mode"
    value={darkMode}
    onChange={setDarkMode}
/>

// With caption
<ToggleField
    label="Auto-save"
    value={autoSave}
    onChange={setAutoSave}
    caption="Automatically save changes every 30 seconds"
/>
```

**ToggleField Props:**
- `label`: string
- `value`: boolean
- `onChange`: (value: boolean) => void
- `error`, `caption`, `isRequired`, `isDisabled`

### MultiSelectField

```tsx
import { MultiSelectField, ListItem } from '@gorgias/axiom'

<MultiSelectField
    label="Tags"
    items={availableTags}
    value={selectedTags}
    onChange={setSelectedTags}
>
    {(tag) => <ListItem label={tag.name} />}
</MultiSelectField>
```

## Form with @repo/forms

Use `@repo/forms` for form state management. It wraps react-hook-form and provides a streamlined API with built-in validation support.

### Basic Form Setup

```tsx
import { Form, FormField, FormSubmitButton } from '@repo/forms'
import { Box, TextField, NumberField, SelectField, ListItem } from '@gorgias/axiom'

type FormData = {
    name: string
    email: string
    age: number
    role: { id: number; name: string }
}

const roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' },
    { id: 3, name: 'Viewer' },
]

function UserForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
    return (
        <Form<FormData>
            defaultValues={{
                name: '',
                email: '',
                age: 18,
                role: roles[1],
            }}
            onValidSubmit={onSubmit}
        >
            <Box flexDirection="column" gap="md">
                <FormField
                    field={TextField}
                    name="name"
                    label="Name"
                    isRequired
                />

                <FormField
                    field={TextField}
                    name="email"
                    label="Email"
                    type="email"
                    isRequired
                />

                <FormField
                    field={NumberField}
                    name="age"
                    label="Age"
                    minValue={0}
                />

                <FormField<{ value: typeof roles[0]; onChange: (v: typeof roles[0]) => void }>
                    field={SelectField}
                    name="role"
                    label="Role"
                    items={roles}
                    isRequired
                >
                    {(role) => <ListItem label={role.name} />}
                </FormField>

                <FormSubmitButton />
            </Box>
        </Form>
    )
}
```

### Form with API Mutation

For complex forms, use a controller pattern to separate data logic from presentation.

**Controller (handles data operations):**

```tsx
import { Form, FormField, FormSubmitButton, toFormErrors } from '@repo/forms'
import { useGetUser, useUpdateUser, queryKeys } from '@gorgias/helpdesk-queries'
import { validateUpdateUser } from '@gorgias/helpdesk-validators'

type UserFormValues = {
    name: string
    email: string
    role: { id: number; name: string }
}

function useFormValues(user?: User): UserFormValues {
    return useMemo(() => user ? {
        name: user.name,
        email: user.email,
        role: user.role,
    } : {
        name: '',
        email: '',
        role: roles[0],
    }, [user])
}

function EditUserController({ userId }: { userId: number }) {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const { data: user, isLoading } = useGetUser(userId)
    const { mutateAsync: updateUser, isPending } = useUpdateUser()

    const defaultValues = useFormValues()
    const values = useFormValues(user)

    const validator = (formValues: UserFormValues) => {
        return toFormErrors(validateUpdateUser(formValues))
    }

    async function handleSubmit(data: UserFormValues) {
        try {
            await updateUser({ id: userId, ...data })
            dispatch(notify({
                message: 'User updated successfully',
                status: NotificationStatus.Success,
            }))
            await queryClient.invalidateQueries({
                queryKey: queryKeys.users.getUser(userId),
            })
        } catch (error) {
            dispatch(notify({
                message: 'Failed to update user',
                status: NotificationStatus.Error,
            }))
        }
    }

    if (isLoading) return <Skeleton count={4} />

    return (
        <EditUserFormView
            defaultValues={defaultValues}
            values={values}
            onSubmit={handleSubmit}
            isLoading={isPending}
            validator={validator}
        />
    )
}
```

**View (presentation only):**

```tsx
import { Form, FormField, FormSubmitButton, FormActions } from '@repo/forms'
import type { FormValidator } from '@repo/forms'

type EditUserFormViewProps = {
    defaultValues: UserFormValues
    values: UserFormValues
    onSubmit: (data: UserFormValues) => void
    isLoading: boolean
    validator: FormValidator<UserFormValues>
}

function EditUserFormView({
    defaultValues,
    values,
    onSubmit,
    isLoading,
    validator,
}: EditUserFormViewProps) {
    return (
        <Form<UserFormValues>
            defaultValues={defaultValues}
            values={values}
            onValidSubmit={onSubmit}
            validator={validator}
        >
            <Box flexDirection="column" gap="md">
                <FormField field={TextField} name="name" label="Name" isRequired />
                <FormField field={TextField} name="email" label="Email" isRequired />
                <FormField<SelectFieldProps>
                    field={SelectField}
                    name="role"
                    label="Role"
                    items={roles}
                >
                    {(role) => <ListItem label={role.name} />}
                </FormField>

                <FormActions>
                    <FormSubmitButton isLoading={isLoading} />
                </FormActions>
            </Box>
        </Form>
    )
}
```

### Form with Boolean Fields

```tsx
<FormField
    field={CheckBoxField}
    name="acceptTerms"
    label="I accept the terms and conditions"
    isRequired
/>

<FormField
    field={ToggleField}
    name="enableNotifications"
    label="Enable email notifications"
    caption="Receive updates about your account"
/>
```

## Validation Patterns

### SDK Validator Integration

Use SDK validators with `toFormErrors` for form-level validation:

```tsx
import { toFormErrors } from '@repo/forms'
import { validateCreateUser } from '@gorgias/helpdesk-validators'

function UserFormController() {
    const validator = (values: UserFormValues) => {
        return toFormErrors(validateCreateUser(values))
    }

    return (
        <Form validator={validator} onValidSubmit={handleSubmit}>
            {/* fields */}
        </Form>
    )
}
```

### Per-Field Validation

Use the `validation` prop on FormField for field-specific rules:

```tsx
<FormField
    field={TextField}
    name="email"
    label="Email"
    validation={{
        pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
        },
    }}
/>

<FormField
    field={NumberField}
    name="age"
    label="Age"
    validation={{
        min: { value: 18, message: 'Must be at least 18' },
        max: { value: 100, message: 'Must be under 100' },
    }}
/>
```

### Inline Form Validator

For simple cases, define validation inline:

```tsx
<Form<{ username: string }>
    validator={(values) => {
        const errors: Record<string, string> = {}
        if (!values.username) {
            errors.username = 'Username is required'
        } else if (values.username.length < 3) {
            errors.username = 'Username must be at least 3 characters'
        }
        return errors
    }}
    onValidSubmit={handleSubmit}
>
    <FormField field={TextField} name="username" label="Username" />
</Form>
```

### Server-Side Errors

Display server errors using the `errors` prop:

```tsx
const [serverErrors, setServerErrors] = useState<FormErrors>({})

async function handleSubmit(data: FormData) {
    try {
        await createUser(data)
    } catch (error) {
        if (isValidationError(error)) {
            setServerErrors({
                email: 'Email already exists',
            })
        }
    }
}

<Form errors={serverErrors} onValidSubmit={handleSubmit}>
    {/* fields */}
</Form>
```

## useFormContext for Conditional Rendering

Use `useFormContext` to access form state in nested components:

```tsx
import { FormField, useFormContext } from '@repo/forms'

type FormValues = {
    userType: 'individual' | 'company'
    companyName?: string
}

function ConditionalCompanyField() {
    const { watch } = useFormContext<FormValues>()
    const userType = watch('userType')

    if (userType !== 'company') return null

    return (
        <FormField
            field={TextField}
            name="companyName"
            label="Company Name"
            isRequired
        />
    )
}

function UserTypeForm() {
    return (
        <Form<FormValues> defaultValues={{ userType: 'individual' }} onValidSubmit={handleSubmit}>
            <FormField
                field={SelectField}
                name="userType"
                label="User Type"
                items={['individual', 'company']}
            >
                {(type) => <ListItem label={type} />}
            </FormField>

            <ConditionalCompanyField />

            <FormSubmitButton />
        </Form>
    )
}
```

## useFieldArray for Dynamic Fields

Use `useFieldArray` to manage arrays of fields:

```tsx
import { Form, FormField, useFieldArray, useController } from '@repo/forms'
import { Box, Button, Icon } from '@gorgias/axiom'

type FormValues = {
    items: Array<{ name: string; quantity: number }>
}

function ItemsFieldArray() {
    const { fields, append, remove } = useFieldArray<FormValues>({ name: 'items' })
    const { fieldState: { error } } = useController({ name: 'items' })

    return (
        <Box flexDirection="column" gap="sm">
            {fields.map((field, index) => (
                <Box key={field.id} flexDirection="row" gap="sm" alignItems="flex-end">
                    <FormField
                        field={TextField}
                        name={`items.${index}.name`}
                        label="Item Name"
                    />
                    <FormField
                        field={NumberField}
                        name={`items.${index}.quantity`}
                        label="Quantity"
                        minValue={1}
                    />
                    <Button
                        icon={<Icon name="trash" />}
                        aria-label="Remove item"
                        variant="tertiary"
                        onClick={() => remove(index)}
                    />
                </Box>
            ))}

            <Button
                variant="secondary"
                onClick={() => append({ name: '', quantity: 1 })}
            >
                Add Item
            </Button>

            {error && <Text color="error">{error.message}</Text>}
        </Box>
    )
}

function OrderForm() {
    return (
        <Form<FormValues>
            defaultValues={{ items: [{ name: '', quantity: 1 }] }}
            onValidSubmit={handleSubmit}
        >
            <ItemsFieldArray />
            <FormSubmitButton />
        </Form>
    )
}
```

## Input/Output Transforms

Use transforms when the field component's value format differs from the form data:

```tsx
type FormValues = {
    status: string  // Form stores string
}

const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
]

<FormField<SelectFieldProps>
    field={SelectField}
    name="status"
    label="Status"
    items={statusOptions}
    // Transform string to option object for SelectField
    inputTransform={(value: string) =>
        statusOptions.find((option) => option.value === value)
    }
    // Transform option object back to string for form data
    outputTransform={(option: { value: string }) => option.value}
>
    {(option) => <ListItem label={option.label} />}
</FormField>
```

**Common use cases:**
- SelectField expecting objects but form stores IDs
- MultiSelectField storing array of IDs
- Date fields with different formats

## FormActions Layout

Use `FormActions` and `FormActionsGroup` for consistent button layouts:

```tsx
import { Form, FormField, FormSubmitButton, FormActions, FormActionsGroup } from '@repo/forms'
import { Button } from '@gorgias/axiom'

<Form onValidSubmit={handleSubmit}>
    {/* fields */}

    <FormActions>
        <FormActionsGroup>
            <Button variant="secondary" onClick={handleCancel}>
                Cancel
            </Button>
            <Button variant="tertiary" onClick={handleReset}>
                Reset
            </Button>
        </FormActionsGroup>
        <FormSubmitButton isLoading={isSubmitting} />
    </FormActions>
</Form>
```

`FormActions` uses `space-between` layout, placing groups at opposite ends.
`FormActionsGroup` groups related buttons together.

## Testing Forms

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('should submit form with valid data', async () => {
    const onSubmit = jest.fn()
    const user = userEvent.setup()
    render(<UserForm onSubmit={onSubmit} />)

    await user.type(
        screen.getByRole('textbox', { name: /name/i }),
        'John Doe'
    )
    await user.type(
        screen.getByRole('textbox', { name: /email/i }),
        'john@example.com'
    )
    await user.click(
        screen.getByRole('button', { name: /save/i })
    )

    await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
            name: 'John Doe',
            email: 'john@example.com',
            age: 18,
            role: expect.any(Object),
        })
    })
})

it('should show validation errors', async () => {
    const user = userEvent.setup()
    render(<UserForm onSubmit={jest.fn()} />)

    await user.click(
        screen.getByRole('button', { name: /save/i })
    )

    await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument()
    })
})

it('should disable submit button when form is pristine', () => {
    render(<UserForm onSubmit={jest.fn()} />)

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
})
```

## Do NOT

- Use raw `<input>`, `<select>`, `<textarea>` elements - use Axiom Field components
- Use `Input`, `Select` primitives directly - use `TextField`, `SelectField`
- Pass `onChange={(e) => setValue(e.target.value)}` - Axiom fields use `onChange: (value) => void`
- Use raw `react-hook-form` hooks directly - use `@repo/forms` components (`Form`, `FormField`)
- Use `useForm` + `Controller` pattern - use `Form` + `FormField` instead
- Use Zod schemas for validation - use SDK validators with `toFormErrors`
- Create custom form field wrappers - Axiom fields include label/error/caption
- Use `Checkbox` - use `CheckBoxField`
- Skip the `children` render function for SelectField
