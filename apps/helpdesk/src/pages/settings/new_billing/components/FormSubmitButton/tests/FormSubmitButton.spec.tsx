import React from 'react'

import { Form } from '@repo/forms'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'

import { FormInputField } from 'pages/settings/new_billing/components/FormInputField/FormInputField'
import { FormSubmitButton } from 'pages/settings/new_billing/components/FormSubmitButton/FormSubmitButton'

describe('FormSubmitButton', () => {
    it('should render submit button', () => {
        render(
            <Form onValidSubmit={jest.fn()}>
                <FormSubmitButton>Submit</FormSubmitButton>
            </Form>,
        )

        expect(screen.getByRole('button', { name: 'Submit' })).toBeVisible()
    })

    it('should render submit button with loading state', async () => {
        let resolveSubmit: (value?: any) => void = () => {}

        render(
            <Form
                onValidSubmit={jest.fn(
                    () =>
                        new Promise((resolve) => {
                            resolveSubmit = resolve
                        }),
                )}
            >
                <FormSubmitButton>Submit</FormSubmitButton>
            </Form>,
        )

        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

        await waitFor(() => {
            expect(screen.getByText('Loading...')).toBeVisible()
        })

        act(() => {
            resolveSubmit()
        })

        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
        })
    })

    it('should render global address error message in submit button', async () => {
        render(
            <Form onValidSubmit={jest.fn()}>
                <FormInputField
                    name="address"
                    rules={{ validate: () => 'Address is invalid' }}
                />
                <FormSubmitButton />
            </Form>,
        )

        expect(screen.queryByText('Address is invalid')).not.toBeInTheDocument()

        fireEvent.click(screen.getByRole('button'))

        await waitFor(() => {
            expect(screen.getAllByText('Address is invalid')).toHaveLength(2)
        })
    })
})
