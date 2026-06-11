import type { ReactNode } from 'react'
import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { FormField } from '../FormField'

function Wrapper({
    children,
    defaultValues,
}: {
    children: ReactNode
    defaultValues?: Record<string, unknown>
}) {
    const methods = useForm({ defaultValues, mode: 'all' })

    return <FormProvider {...methods}>{children}</FormProvider>
}

const renderField = (ui: ReactNode, defaultValues?: Record<string, unknown>) =>
    render(<Wrapper defaultValues={defaultValues}>{ui}</Wrapper>)

describe('FormField', () => {
    it('exposes the controlled value to its render prop', () => {
        renderField(
            <FormField name="title">
                {({ value }) => (
                    <input aria-label="title" value={value} readOnly />
                )}
            </FormField>,
            { title: 'hello' },
        )

        expect(screen.getByLabelText('title')).toHaveValue('hello')
    })

    it('updates the form value through the render prop onChange', async () => {
        const user = userEvent.setup()

        renderField(
            <FormField name="title">
                {({ value, onChange }) => (
                    <input
                        aria-label="title"
                        value={value ?? ''}
                        onChange={(event) => onChange(event.target.value)}
                    />
                )}
            </FormField>,
        )

        await user.type(screen.getByLabelText('title'), 'abc')

        expect(screen.getByLabelText('title')).toHaveValue('abc')
    })

    it('surfaces the required validation message as error', async () => {
        const user = userEvent.setup()

        renderField(
            <form>
                <FormField name="title" isRequired>
                    {({ value, onChange, onBlur, error }) => (
                        <>
                            <input
                                aria-label="title"
                                value={value ?? ''}
                                onChange={(event) =>
                                    onChange(event.target.value)
                                }
                                onBlur={onBlur}
                            />
                            {error ? <span role="alert">{error}</span> : null}
                        </>
                    )}
                </FormField>
            </form>,
        )

        const input = screen.getByLabelText('title')
        await user.type(input, 'x')
        await user.clear(input)
        await user.tab()

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'This field is required',
        )
    })

    it('forwards isRequired to its render prop', () => {
        renderField(
            <FormField name="title" isRequired>
                {({ value, isRequired }) => (
                    <input
                        aria-label="title"
                        value={value ?? ''}
                        readOnly
                        required={isRequired}
                    />
                )}
            </FormField>,
        )

        expect(screen.getByLabelText('title')).toBeRequired()
    })

    it('leaves isRequired undefined on its render prop when not set', () => {
        renderField(
            <FormField name="title">
                {({ value, isRequired }) => (
                    <input
                        aria-label="title"
                        value={value ?? ''}
                        readOnly
                        required={isRequired}
                    />
                )}
            </FormField>,
        )

        expect(screen.getByLabelText('title')).not.toBeRequired()
    })

    it('applies custom validation rules', async () => {
        const user = userEvent.setup()

        renderField(
            <FormField
                name="title"
                validation={{
                    validate: (value: string) =>
                        value === 'valid' || 'Must be valid',
                }}
            >
                {({ value, onChange, error }) => (
                    <>
                        <input
                            aria-label="title"
                            value={value ?? ''}
                            onChange={(event) => onChange(event.target.value)}
                        />
                        {error ? <span role="alert">{error}</span> : null}
                    </>
                )}
            </FormField>,
        )

        await user.type(screen.getByLabelText('title'), 'nope')

        expect(await screen.findByRole('alert')).toHaveTextContent(
            'Must be valid',
        )
    })
})
