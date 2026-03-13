# Modal Patterns

Patterns for building modals and side panels using Axiom components following accessibility best practices.

## Axiom Overlay Components

Axiom provides overlay components for dialogs and panels:
- **Modal** - Centered dialog for focused interactions
- **SidePanel** - Slide-in panel from the side
- **OverlayHeader**, **OverlayContent**, **OverlayFooter** - Structure components for consistent layouts

### Modal

```tsx
import { Modal, OverlayHeader, OverlayContent, OverlayFooter, Box, Button, Text } from '@gorgias/axiom'

interface ConfirmDeleteModalProps {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    onConfirm: () => void
    itemName: string
}

function ConfirmDeleteModal({
    isOpen,
    onOpenChange,
    onConfirm,
    itemName,
}: ConfirmDeleteModalProps) {
    function handleConfirm() {
        onConfirm()
        onOpenChange(false)
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            isDismissable
            size="sm"
        >
            <OverlayHeader
                title={`Delete ${itemName}?`}
                description="This action cannot be undone."
            />
            <OverlayContent>
                <Text>
                    Are you sure you want to delete "{itemName}"?
                </Text>
            </OverlayContent>
            <OverlayFooter>
                <Button variant="primary" intent="destructive" onClick={handleConfirm}>
                    Delete
                </Button>
            </OverlayFooter>
        </Modal>
    )
}
```

**Modal Props:**
- `isOpen`: boolean - controlled visibility
- `onOpenChange`: (isOpen: boolean) => void - visibility change handler
- `isDismissable`: boolean - allow closing by clicking outside or pressing Escape
- `size`: `'sm'` | `'md'` | `'lg'` | `'xl'`
- `withoutOverlay`: boolean - hide the backdrop overlay
- `children`: ReactNode - modal content

**OverlayHeader Props:**
- `title`: string | ReactNode - header title
- `description`: string | ReactNode - optional description/subtitle

**OverlayContent Props:**
- `children`: ReactNode - main content area

**OverlayFooter Props:**
- `title`: string | ReactNode - optional footer title
- `hideCancelButton`: boolean - hide the default cancel button
- `children`: ReactNode - action buttons

### SidePanel

```tsx
import { SidePanel, OverlayHeader, OverlayContent, OverlayFooter, Box, Button, Text, Skeleton } from '@gorgias/axiom'

interface UserDetailsPanelProps {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    userId: number
}

function UserDetailsPanel({
    isOpen,
    onOpenChange,
    userId,
}: UserDetailsPanelProps) {
    const { data: user, isLoading } = useGetUser(userId)

    return (
        <SidePanel
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            isDismissable
            size="md"
        >
            <OverlayHeader
                title="User Details"
                description="View and manage user information"
            />
            <OverlayContent>
                {isLoading ? (
                    <Skeleton count={3} />
                ) : (
                    <Box flexDirection="column" gap="md">
                        <Text variant="bold">{user.name}</Text>
                        <Text>{user.email}</Text>
                    </Box>
                )}
            </OverlayContent>
            <OverlayFooter>
                <Button variant="primary" onClick={() => onOpenChange(false)}>
                    Done
                </Button>
            </OverlayFooter>
        </SidePanel>
    )
}
```

**SidePanel Props:**
- `isOpen`: boolean - controlled visibility
- `onOpenChange`: (isOpen: boolean) => void - visibility change handler
- `isDismissable`: boolean - allow closing by clicking outside or pressing Escape
- `size`: `'sm'` | `'md'` | `'lg'` | `'xl'` - predefined width
- `width`: SizeValue - custom width (alternative to size)
- `withoutOverlay`: boolean - hide the backdrop overlay
- `withoutPadding`: boolean - remove default padding
- `children`: ReactNode - panel content

## Modal with Form

```tsx
import { Modal, OverlayHeader, OverlayContent, OverlayFooter, TextField, SelectField, ListItem } from '@gorgias/axiom'
import { Form, FormField, FormSubmitButton, toFormErrors } from '@repo/forms'
import { validateCreateUser } from '@gorgias/helpdesk-validators'

interface CreateUserModalProps {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
}

type CreateUserData = {
    name: string
    email: string
    role: { id: number; name: string }
}

const roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' },
    { id: 3, name: 'Viewer' },
]

function CreateUserModal({ isOpen, onOpenChange }: CreateUserModalProps) {
    const { mutateAsync: createUser, isPending } = useCreateUser()
    const dispatch = useAppDispatch()

    const validator = (values: CreateUserData) => {
        return toFormErrors(validateCreateUser(values))
    }

    async function handleSubmit(data: CreateUserData) {
        try {
            await createUser(data)
            dispatch(notify({
                message: 'User created',
                status: NotificationStatus.Success,
            }))
            onOpenChange(false)
        } catch (error) {
            dispatch(notify({
                message: 'Failed to create user',
                status: NotificationStatus.Error,
            }))
        }
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable size="md">
            <Form<CreateUserData>
                defaultValues={{ name: '', email: '', role: roles[0] }}
                onValidSubmit={handleSubmit}
                validator={validator}
            >
                <OverlayHeader
                    title="Create User"
                    description="Add a new user to your team"
                />
                <OverlayContent>
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

                        <FormField<{ value: typeof roles[0]; onChange: (v: typeof roles[0]) => void }>
                            field={SelectField}
                            name="role"
                            label="Role"
                            items={roles}
                        >
                            {(role) => <ListItem label={role.name} />}
                        </FormField>
                    </Box>
                </OverlayContent>
                <OverlayFooter>
                    <FormSubmitButton isLoading={isPending}>
                        Create
                    </FormSubmitButton>
                </OverlayFooter>
            </Form>
        </Modal>
    )
}
```

### Modal with Form and Custom Footer

When you need multiple action buttons or want to hide the cancel button:

```tsx
function EditUserModal({ isOpen, onOpenChange, userId }: EditUserModalProps) {
    const { data: user, isLoading } = useGetUser(userId)
    const { mutateAsync: updateUser, isPending } = useUpdateUser()
    const { mutateAsync: deleteUser } = useDeleteUser()

    async function handleSubmit(data: UserFormData) {
        await updateUser({ id: userId, ...data })
        onOpenChange(false)
    }

    async function handleDelete() {
        await deleteUser(userId)
        onOpenChange(false)
    }

    if (isLoading) {
        return (
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
                <OverlayContent>
                    <Skeleton count={4} />
                </OverlayContent>
            </Modal>
        )
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} isDismissable size="md">
            <Form defaultValues={user} onValidSubmit={handleSubmit}>
                <OverlayHeader title="Edit User" />
                <OverlayContent>
                    {/* Form fields */}
                </OverlayContent>
                <OverlayFooter hideCancelButton>
                    <Box flexDirection="row" justifyContent="space-between" width="100%">
                        <Button
                            variant="tertiary"
                            intent="destructive"
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                        <Box gap="xs">
                            <Button variant="secondary" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <FormSubmitButton isLoading={isPending}>
                                Save
                            </FormSubmitButton>
                        </Box>
                    </Box>
                </OverlayFooter>
            </Form>
        </Modal>
    )
}
```

## Modal State Management

### Local State Pattern

```tsx
function UserList() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)

    return (
        <>
            <Button onClick={() => setIsCreateModalOpen(true)}>
                Add User
            </Button>

            <CreateUserModal
                isOpen={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            />

            <ConfirmDeleteModal
                isOpen={!!userToDelete}
                onOpenChange={(open) => !open && setUserToDelete(null)}
                onConfirm={() => {
                    if (userToDelete) {
                        deleteUser(userToDelete.id)
                    }
                }}
                itemName={userToDelete?.name ?? ''}
            />

            <UserTable onDeleteClick={setUserToDelete} />
        </>
    )
}
```

### URL-based Modal Pattern

```tsx
import { useSearchParams } from 'react-router-dom'

function UserPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const editUserId = searchParams.get('edit')

    function handleOpenEdit(userId: number) {
        setSearchParams({ edit: String(userId) })
    }

    function handleCloseEdit() {
        setSearchParams({})
    }

    return (
        <>
            <UserTable onEditClick={handleOpenEdit} />

            {editUserId && (
                <EditUserModal
                    isOpen={true}
                    onOpenChange={(open) => !open && handleCloseEdit()}
                    userId={Number(editUserId)}
                />
            )}
        </>
    )
}
```

## Testing Modals

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('ConfirmDeleteModal', () => {
    it('should render when open', () => {
        render(
            <ConfirmDeleteModal
                isOpen={true}
                onOpenChange={jest.fn()}
                onConfirm={jest.fn()}
                itemName="Test Item"
            />
        )

        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByRole('heading')).toHaveTextContent('Delete Test Item?')
    })

    it('should call onConfirm when delete clicked', async () => {
        const onConfirm = jest.fn()
        const user = userEvent.setup()

        render(
            <ConfirmDeleteModal
                isOpen={true}
                onOpenChange={jest.fn()}
                onConfirm={onConfirm}
                itemName="Test Item"
            />
        )

        await user.click(
            screen.getByRole('button', { name: /delete/i })
        )

        expect(onConfirm).toHaveBeenCalled()
    })

    it('should call onOpenChange when cancel clicked', async () => {
        const onOpenChange = jest.fn()
        const user = userEvent.setup()

        render(
            <ConfirmDeleteModal
                isOpen={true}
                onOpenChange={onOpenChange}
                onConfirm={jest.fn()}
                itemName="Test Item"
            />
        )

        await user.click(
            screen.getByRole('button', { name: /cancel/i })
        )

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })
})

describe('CreateUserModal', () => {
    it('should submit form and close on success', async () => {
        const onOpenChange = jest.fn()
        const user = userEvent.setup()

        // Setup MSW handlers for createUser

        render(
            <CreateUserModal isOpen={true} onOpenChange={onOpenChange} />
        )

        // Fill form fields
        await user.type(
            screen.getByRole('textbox', { name: /name/i }),
            'John Doe'
        )
        await user.type(
            screen.getByRole('textbox', { name: /email/i }),
            'john@example.com'
        )

        // Submit form
        await user.click(
            screen.getByRole('button', { name: /create/i })
        )

        // Verify modal closes on success
        await waitFor(() => {
            expect(onOpenChange).toHaveBeenCalledWith(false)
        })
    })

    it('should show validation errors on invalid submit', async () => {
        const user = userEvent.setup()

        render(
            <CreateUserModal isOpen={true} onOpenChange={jest.fn()} />
        )

        // Try to submit without filling required fields
        await user.click(
            screen.getByRole('button', { name: /create/i })
        )

        // Check for validation error
        await waitFor(() => {
            expect(screen.getByText(/required/i)).toBeInTheDocument()
        })
    })
})
```

## Do NOT

- Use `Dialog` component - use `Modal` or `SidePanel` from Axiom
- Use `onClose` prop - use `onOpenChange` instead
- Use `variant="danger"` on Button - use `intent="destructive"`
- Create custom modal/overlay components - use Axiom's Modal or SidePanel
- Forget `isDismissable` for user-friendly experience
- Put state management logic inside the modal - keep it in the parent
- Use `Heading` and `Box` for modal structure - use `OverlayHeader`, `OverlayContent`, `OverlayFooter`
- Create custom modal layouts - use the Overlay structure components for consistency
