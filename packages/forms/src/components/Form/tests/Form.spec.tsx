import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { produce } from 'immer'
import _set from 'lodash/set'
import { vi } from 'vitest'

import type { FormErrors } from '../../../utils/validation'
import { FormField } from '../../FormField/FormField'
import { FormSubmitButton } from '../../FormSubmitButton/FormSubmitButton'
import { Form } from '../Form'

const onSubmit = vi.fn()

// Mock field component for testing
const MockInputField = ({
    label,
    value,
    onChange,
    error,
    isRequired,
}: {
    label?: string
    value?: string
    onChange?: (value: string) => void
    error?: string
    isRequired?: boolean
}) => (
    <div>
        {label && (
            <label>
                {label}
                {isRequired && ' *'}
            </label>
        )}
        <input
            aria-label={label}
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
        />
        {error && <span>{error}</span>}
    </div>
)

describe('<Form />', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('fields', () => {
        it('renders the field components', () => {
            render(
                <Form onValidSubmit={onSubmit}>
                    <FormField
                        field={MockInputField}
                        name="name"
                        label="Name"
                    />
                    <FormField
                        field={MockInputField}
                        name="address"
                        label="Address"
                    />
                </Form>,
            )

            expect(screen.getByLabelText('Name')).toBeInTheDocument()
            expect(screen.getByLabelText('Address')).toBeInTheDocument()
        })
    })

    describe('values', () => {
        it('allows passing default (initial) values', async () => {
            render(
                <Form defaultValues={{ name: 'John' }} onValidSubmit={onSubmit}>
                    <FormField
                        field={MockInputField}
                        name="name"
                        label="Name"
                    />
                </Form>,
            )

            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    { name: 'John' },
                    expect.any(Object),
                )
            })
        })

        it('updates values when fields change', async () => {
            render(
                <Form defaultValues={{ name: 'John' }} onValidSubmit={onSubmit}>
                    <FormField
                        field={MockInputField}
                        name="name"
                        label="Name"
                    />
                </Form>,
            )

            fireEvent.change(screen.getByLabelText('Name'), {
                target: { value: 'Doe' },
            })
            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    { name: 'Doe' },
                    expect.any(Object),
                )
            })
        })

        it('allows using dot notation for field names', async () => {
            render(
                <Form onValidSubmit={onSubmit}>
                    <FormField
                        field={MockInputField}
                        name="name"
                        label="Name"
                    />
                    <FormField
                        field={MockInputField}
                        name="address.street"
                        label="Street"
                    />
                </Form>,
            )

            fireEvent.change(screen.getByLabelText('Name'), {
                target: { value: 'John' },
            })
            fireEvent.change(screen.getByLabelText('Street'), {
                target: { value: 'Sesame St' },
            })
            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    {
                        name: 'John',
                        address: { street: 'Sesame St' },
                    },
                    expect.any(Object),
                )
            })
        })

        it('allows using dot notation as array indexes for field names', async () => {
            render(
                <Form onValidSubmit={onSubmit}>
                    <FormField
                        field={MockInputField}
                        name="name"
                        label="Name"
                    />
                    <FormField
                        field={MockInputField}
                        name="items.0.name"
                        label="First item"
                    />
                    <FormField
                        field={MockInputField}
                        name="items.1.name"
                        label="Second item"
                    />
                </Form>,
            )

            fireEvent.change(screen.getByLabelText('Name'), {
                target: { value: 'John' },
            })
            fireEvent.change(screen.getByLabelText('First item'), {
                target: { value: 'One' },
            })
            fireEvent.change(screen.getByLabelText('Second item'), {
                target: { value: 'Two' },
            })
            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    {
                        name: 'John',
                        items: [{ name: 'One' }, { name: 'Two' }],
                    },
                    expect.any(Object),
                )
            })
        })
    })

    describe('validation', () => {
        it('validates required fields', async () => {
            render(
                <Form onValidSubmit={onSubmit}>
                    <FormField
                        field={MockInputField}
                        name="name"
                        label="Name"
                        isRequired
                    />
                </Form>,
            )

            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(
                    screen.getByText('This field is required'),
                ).toBeInTheDocument()

                expect(onSubmit).not.toHaveBeenCalled()
            })
        })

        it('allows customizing required field error message', async () => {
            render(
                <Form onValidSubmit={onSubmit}>
                    <FormField
                        field={MockInputField}
                        name="name"
                        label="Name"
                        isRequired
                        validation={{ required: 'Cannot be blank' }}
                    />
                </Form>,
            )

            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(screen.getByText('Cannot be blank')).toBeInTheDocument()
                expect(onSubmit).not.toHaveBeenCalled()
            })
        })

        it('allows using custom per-field validation', async () => {
            render(
                <Form onValidSubmit={onSubmit}>
                    <FormField
                        field={MockInputField}
                        name="name"
                        label="Name"
                        validation={{
                            validate: (value: string) =>
                                value === 'secret'
                                    ? 'Cannot be secret'
                                    : undefined,
                        }}
                    />
                </Form>,
            )

            fireEvent.change(screen.getByLabelText('Name'), {
                target: { value: 'secret' },
            })
            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(screen.getByText('Cannot be secret')).toBeInTheDocument()
                expect(onSubmit).not.toHaveBeenCalled()
            })

            fireEvent.change(screen.getByLabelText('Name'), {
                target: { value: 'not secret' },
            })
            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    { name: 'not secret' },
                    expect.any(Object),
                )
            })
        })

        it('allows passing errors and renders them on the field', async () => {
            render(
                <Form
                    errors={{ username: 'Username is already in use' }}
                    onValidSubmit={onSubmit}
                >
                    <FormField
                        field={MockInputField}
                        name="username"
                        label="Username"
                    />
                </Form>,
            )

            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(
                    screen.getByText('Username is already in use'),
                ).toBeInTheDocument()

                expect(onSubmit).not.toHaveBeenCalled()
            })
        })

        it('allows passing a validation function to validate the values', async () => {
            type Values = { username: string }

            render(
                <Form<Values>
                    validator={(values) => {
                        if (!values.username) {
                            return { username: 'This field is required' }
                        }

                        if (values.username === 'admin') {
                            return { username: 'Cannot be admin' }
                        }
                    }}
                    onValidSubmit={onSubmit}
                >
                    <FormField
                        field={MockInputField}
                        name="username"
                        label="Username"
                    />
                </Form>,
            )

            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(
                    screen.getByText('This field is required'),
                ).toBeInTheDocument()
                expect(onSubmit).not.toHaveBeenCalled()
            })

            fireEvent.change(screen.getByLabelText('Username'), {
                target: { value: 'admin' },
            })

            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(screen.getByText('Cannot be admin')).toBeInTheDocument()
                expect(onSubmit).not.toHaveBeenCalled()
            })

            fireEvent.change(screen.getByLabelText('Username'), {
                target: { value: 'not-admin' },
            })

            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    { username: 'not-admin' },
                    expect.any(Object),
                )
            })
        })

        it('correctly validates nested values', async () => {
            type Values = {
                name: string
                items: { name: string }[]
                address: { street: string }
            }

            const validate = (values: Values) => {
                return produce<FormErrors<Values>>({}, (errors) => {
                    if (!values.name) {
                        _set(errors, 'name', 'Name is required')
                    }

                    if (!values.address?.street) {
                        _set(errors, 'address.street', 'Street is required')
                    }

                    if (!values.items?.[0]?.name) {
                        _set(errors, 'items.0.name', 'First item is required')
                    }

                    if (!values.items?.[1]?.name) {
                        _set(errors, 'items.1.name', 'Second item is required')
                    }
                })
            }

            render(
                <Form<Values> onValidSubmit={onSubmit} validator={validate}>
                    <FormField
                        field={MockInputField}
                        name="name"
                        label="Name"
                    />
                    <FormField
                        field={MockInputField}
                        name="address.street"
                        label="Street"
                    />
                    <FormField
                        field={MockInputField}
                        name="items.0.name"
                        label="First item"
                    />
                    <FormField
                        field={MockInputField}
                        name="items.1.name"
                        label="Second item"
                    />
                </Form>,
            )

            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(screen.getByText('Name is required')).toBeInTheDocument()
                expect(
                    screen.getByText('Street is required'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('First item is required'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('Second item is required'),
                ).toBeInTheDocument()
                expect(onSubmit).not.toHaveBeenCalled()
            })
        })
    })

    describe('submit button', () => {
        it('allows using a form submit button', () => {
            render(
                <Form onValidSubmit={onSubmit}>
                    <FormField
                        field={MockInputField}
                        name="name"
                        label="Name"
                    />
                    <button type="submit">Save Changes</button>
                </Form>,
            )
            const button = screen.getByRole('button', { name: 'Save Changes' })
            expect(button).toBeInTheDocument()
        })

        it('tracks dirty state disabling it while unchanged', async () => {
            render(
                <Form onValidSubmit={onSubmit}>
                    <FormField
                        field={MockInputField}
                        name="name"
                        label="Name"
                    />
                    <FormSubmitButton />
                </Form>,
            )

            const button = screen.getByRole('button', { name: 'Save Changes' })
            expect(button).toHaveAttribute('aria-disabled', 'true')

            fireEvent.click(button)

            await waitFor(() => {
                expect(onSubmit).not.toHaveBeenCalled()
            })
        })

        it('tracks dirty state correctly based on default values', async () => {
            render(
                <Form onValidSubmit={onSubmit} defaultValues={{ name: 'test' }}>
                    <FormField
                        field={MockInputField}
                        name="name"
                        label="Name"
                    />
                    <FormSubmitButton />
                </Form>,
            )
            const button = screen.getByRole('button', { name: 'Save Changes' })

            expect(button).toHaveAttribute('aria-disabled', 'true')

            fireEvent.click(button)

            await waitFor(() => {
                expect(onSubmit).not.toHaveBeenCalled()
            })

            fireEvent.change(screen.getByLabelText('Name'), {
                target: { value: 'Doe' },
            })

            fireEvent.click(button)

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    { name: 'Doe' },
                    expect.any(Object),
                )
            })
        })

        it('resets form values after successful submission', async () => {
            render(
                <Form
                    onValidSubmit={onSubmit}
                    defaultValues={{ name: 'initial' }}
                >
                    <FormField
                        field={MockInputField}
                        name="name"
                        label="Name"
                    />
                    <FormSubmitButton />
                </Form>,
            )

            const button = screen.getByRole('button', { name: 'Save Changes' })
            expect(button).toHaveAttribute('aria-disabled', 'true')

            fireEvent.change(screen.getByLabelText('Name'), {
                target: { value: 'changed' },
            })

            expect(button).not.toHaveAttribute('aria-disabled', 'true')

            fireEvent.click(button)

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith(
                    { name: 'changed' },
                    expect.any(Object),
                )
            })

            const input = screen.getByLabelText('Name') as HTMLInputElement
            expect(input.value).toBe('changed')
            /* button should be disabled again because the dirty state is reset */
            expect(button).toHaveAttribute('aria-disabled', 'true')
        })
    })
})
