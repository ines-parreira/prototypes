import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {produce} from 'immer'
import {set} from 'lodash'

import Form from './Form'
import FormField from './FormField'
import ToggleInputFormField from './ToggleInputFormField'
import FormSubmitButton from './FormSubmitButton'
import {FormErrors} from './validation'

const onSubmit = jest.fn()

describe('<Form />', () => {
    describe('fields', () => {
        it('renders the field components', () => {
            render(
                <Form onSubmit={onSubmit}>
                    <FormField name="name" label="Name" />
                    <FormField name="address" label="Address" />
                </Form>
            )

            expect(screen.getByLabelText('Name')).toBeInTheDocument()
            expect(screen.getByLabelText('Address')).toBeInTheDocument()
        })

        it('allows using custom field components', () => {
            render(
                <Form onSubmit={onSubmit}>
                    <FormField name="name" label="Name" />
                    <FormField
                        name="agree"
                        label="I agree"
                        field={ToggleInputFormField}
                        isToggled
                        isRequired
                    />
                </Form>
            )

            expect(screen.getByLabelText('Name')).toBeInTheDocument()
            expect(screen.queryByRole('checkbox')).toBeInTheDocument()
        })
    })

    describe('values', () => {
        it('allows passing default (initial) values', async () => {
            render(
                <Form defaultValues={{name: 'John'}} onSubmit={onSubmit}>
                    <FormField name="name" label="Name" />
                </Form>
            )

            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith({name: 'John'})
            })
        })

        it('updates values when fields change', async () => {
            render(
                <Form defaultValues={{name: 'John'}} onSubmit={onSubmit}>
                    <FormField name="name" label="Name" />
                </Form>
            )

            fireEvent.change(screen.getByLabelText('Name'), {
                target: {value: 'Doe'},
            })
            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith({name: 'Doe'})
            })
        })

        it('allows using dot notation for field names', async () => {
            render(
                <Form onSubmit={onSubmit}>
                    <FormField name="name" label="Name" />
                    <FormField name="address.street" label="Street" />
                </Form>
            )

            fireEvent.change(screen.getByLabelText('Name'), {
                target: {value: 'John'},
            })
            fireEvent.change(screen.getByLabelText('Street'), {
                target: {value: 'Sesame St'},
            })
            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith({
                    name: 'John',
                    address: {street: 'Sesame St'},
                })
            })
        })

        it('allows using dot notation as array indexes for field names', async () => {
            render(
                <Form onSubmit={onSubmit}>
                    <FormField name="name" label="Name" />
                    <FormField name="items.0.name" label="First item" />
                    <FormField name="items.1.name" label="Second item" />
                </Form>
            )

            fireEvent.change(screen.getByLabelText('Name'), {
                target: {value: 'John'},
            })
            fireEvent.change(screen.getByLabelText('First item'), {
                target: {value: 'One'},
            })
            fireEvent.change(screen.getByLabelText('Second item'), {
                target: {value: 'Two'},
            })
            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith({
                    name: 'John',
                    items: [{name: 'One'}, {name: 'Two'}],
                })
            })
        })
    })

    describe('validation', () => {
        it('validates required fields', async () => {
            render(
                <Form onSubmit={onSubmit}>
                    <FormField name="name" label="Name" isRequired />
                </Form>
            )

            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(
                    screen.getByText('This field is required')
                ).toBeInTheDocument()

                expect(onSubmit).not.toHaveBeenCalled()
            })
        })

        it('allows customizing required field error message', async () => {
            render(
                <Form onSubmit={onSubmit}>
                    <FormField
                        name="name"
                        label="Name"
                        isRequired
                        validation={{required: 'Cannot be blank'}}
                    />
                </Form>
            )

            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(screen.getByText('Cannot be blank')).toBeInTheDocument()
                expect(onSubmit).not.toHaveBeenCalled()
            })
        })

        it('allows using custom per-field validation', async () => {
            render(
                <Form onSubmit={onSubmit}>
                    <FormField
                        name="name"
                        label="Name"
                        validation={{
                            validate: (value: string) =>
                                value === 'secret'
                                    ? 'Cannot be secret'
                                    : undefined,
                        }}
                    />
                </Form>
            )

            fireEvent.change(screen.getByLabelText('Name'), {
                target: {value: 'secret'},
            })
            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(screen.getByText('Cannot be secret')).toBeInTheDocument()
                expect(onSubmit).not.toHaveBeenCalled()
            })

            fireEvent.change(screen.getByLabelText('Name'), {
                target: {value: 'not secret'},
            })
            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith({name: 'not secret'})
            })
        })

        it('allows passing errors and renders them on the field', async () => {
            render(
                <Form
                    errors={{username: 'Username is already in use'}}
                    onSubmit={onSubmit}
                >
                    <FormField name="username" label="Username" />
                </Form>
            )

            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(
                    screen.getByText('Username is already in use')
                ).toBeInTheDocument()

                expect(onSubmit).not.toHaveBeenCalled()
            })
        })

        it('allows passing a validation function to validate the values', async () => {
            type Values = {username: string}

            render(
                <Form<Values>
                    validator={(values) => {
                        if (!values.username) {
                            return {username: 'This field is required'}
                        }

                        if (values.username === 'admin') {
                            return {username: 'Cannot be admin'}
                        }
                    }}
                    onSubmit={onSubmit}
                >
                    <FormField name="username" label="Username" />
                </Form>
            )

            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(
                    screen.getByText('This field is required')
                ).toBeInTheDocument()
                expect(onSubmit).not.toHaveBeenCalled()
            })

            fireEvent.change(screen.getByLabelText('Username'), {
                target: {value: 'admin'},
            })

            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(screen.getByText('Cannot be admin')).toBeInTheDocument()
                expect(onSubmit).not.toHaveBeenCalled()
            })

            fireEvent.change(screen.getByLabelText('Username'), {
                target: {value: 'not-admin'},
            })

            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith({username: 'not-admin'})
            })
        })

        it('correctly validates nested values', async () => {
            type Values = {
                name: string
                items: {name: string}[]
                address: {street: string}
            }

            const validate = (values: Values) => {
                return produce<FormErrors<Values>>({}, (errors) => {
                    if (!values.name) {
                        set(errors, 'name', 'Name is required')
                    }

                    if (!values.address?.street) {
                        set(errors, 'address.street', 'Street is required')
                    }

                    if (!values.items?.[0]?.name) {
                        set(errors, 'items.0.name', 'First item is required')
                    }

                    if (!values.items?.[1]?.name) {
                        set(errors, 'items.1.name', 'Second item is required')
                    }
                })
            }

            render(
                <Form<Values> onSubmit={onSubmit} validator={validate}>
                    <FormField name="name" label="Name" />
                    <FormField name="address.street" label="Street" />
                    <FormField name="items.0.name" label="First item" />
                    <FormField name="items.1.name" label="Second item" />
                </Form>
            )

            fireEvent.submit(screen.getByRole('form'))

            await waitFor(() => {
                expect(screen.getByText('Name is required')).toBeInTheDocument()
                expect(
                    screen.getByText('Street is required')
                ).toBeInTheDocument()
                expect(
                    screen.getByText('First item is required')
                ).toBeInTheDocument()
                expect(
                    screen.getByText('Second item is required')
                ).toBeInTheDocument()
                expect(onSubmit).not.toHaveBeenCalled()
            })
        })
    })

    describe('submit button', () => {
        it('allows using a form submit button', () => {
            render(
                <Form onSubmit={onSubmit}>
                    <FormField name="name" label="Name" />
                    <FormSubmitButton />
                </Form>
            )
            const button = screen.getByRole('button', {name: 'Save Changes'})
            expect(button).toBeInTheDocument()
        })

        it('allows customizing the label text', () => {
            render(
                <Form onSubmit={onSubmit}>
                    <FormField name="name" label="Name" />
                    <FormSubmitButton>Next Step</FormSubmitButton>
                </Form>
            )
            const button = screen.getByRole('button', {name: 'Next Step'})
            expect(button).toBeInTheDocument()
        })

        it('allows setting loading state', () => {
            render(
                <Form onSubmit={onSubmit}>
                    <FormField name="name" label="Name" />
                    <FormSubmitButton isLoading />
                </Form>
            )
            const button = screen.getByRole('button', {
                name: 'Loading... Save Changes',
            })
            expect(button).toBeInTheDocument()
            expect(button).toBeAriaDisabled()
        })

        it('allows overriding disabled state', () => {
            render(
                <Form onSubmit={onSubmit}>
                    <FormField name="name" label="Name" />
                    <FormSubmitButton isDisabled />
                </Form>
            )
            const button = screen.getByRole('button', {
                name: 'Save Changes',
            })
            expect(button).toBeAriaDisabled()

            fireEvent.change(screen.getByLabelText('Name'), {
                target: {value: 'Doe'},
            })

            expect(button).toBeAriaDisabled()
        })

        it('tracks dirty state disabling it while unchanged', async () => {
            render(
                <Form onSubmit={onSubmit}>
                    <FormField name="name" label="Name" />
                    <FormSubmitButton />
                </Form>
            )

            const button = screen.getByRole('button', {name: 'Save Changes'})
            expect(button).toBeAriaDisabled()

            fireEvent.click(button)

            await waitFor(() => {
                expect(onSubmit).not.toHaveBeenCalled()
            })
        })

        it('tracks dirty state correctly based on default values', async () => {
            render(
                <Form onSubmit={onSubmit} defaultValues={{name: 'test'}}>
                    <FormField name="name" label="Name" />
                    <FormSubmitButton />
                </Form>
            )
            const button = screen.getByRole('button', {name: 'Save Changes'})

            expect(button).toBeAriaDisabled()

            fireEvent.click(button)

            await waitFor(() => {
                expect(onSubmit).not.toHaveBeenCalled()
            })

            fireEvent.change(screen.getByLabelText('Name'), {
                target: {value: 'Doe'},
            })

            fireEvent.click(button)

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith({name: 'Doe'})
            })
        })
    })
})
