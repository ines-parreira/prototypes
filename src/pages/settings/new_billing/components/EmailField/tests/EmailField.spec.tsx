import {fireEvent, render, screen, waitFor} from '@testing-library/react'

import React from 'react'

import {EmailField} from 'pages/settings/new_billing/components/EmailField/EmailField'
import {Form} from 'pages/settings/new_billing/components/Form/Form'
import {FormSubmitButton} from 'pages/settings/new_billing/components/FormSubmitButton/FormSubmitButton'

describe('EmailField', () => {
    it('should render email field', () => {
        render(
            <Form onValidSubmit={jest.fn()}>
                <EmailField />
                <FormSubmitButton />
            </Form>
        )

        expect(screen.getByLabelText('Email')).toBeVisible()
        expect(
            screen.getByText('Invoices are sent to this email address.')
        ).toBeVisible()
        expect(screen.getByRole('textbox', {name: 'Email'})).toBeVisible()
        expect(screen.getByPlaceholderText('your@email.com')).toBeVisible()
    })

    it('should display invalid error message when input is invalid', async () => {
        render(
            <Form onValidSubmit={jest.fn()}>
                <EmailField />
                <FormSubmitButton />
            </Form>
        )

        fireEvent.change(screen.getByRole('textbox'), {
            target: {value: 'not an email'},
        })

        // Tries to submit the form to trigger validation
        fireEvent.click(screen.getByRole('button'))

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Email format must include @ and a domain, e.g. example@domain.com.'
                )
            ).toBeVisible()
        })
    })

    it('should display required error message when input is invalid', async () => {
        render(
            <Form onValidSubmit={jest.fn()}>
                <EmailField />
                <FormSubmitButton />
            </Form>
        )

        fireEvent.change(screen.getByRole('textbox'), {
            target: {value: ''},
        })

        // Tries to submit the form to trigger validation
        fireEvent.click(screen.getByRole('button'))

        await waitFor(() => {
            expect(screen.getByText('This field is incomplete.')).toBeVisible()
        })
    })

    it('should render email field with initial value', () => {
        render(
            <Form
                onValidSubmit={jest.fn()}
                defaultValues={{email: 'default-email@gorgias.com'}}
            >
                <EmailField />
                <FormSubmitButton />
            </Form>
        )

        expect(screen.getByRole('textbox')).toHaveValue(
            'default-email@gorgias.com'
        )
    })
})
