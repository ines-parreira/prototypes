import {fireEvent, render, screen, waitFor} from '@testing-library/react'

import React from 'react'

import {Form} from 'components/Form/Form'
import {FormInputField} from 'pages/settings/new_billing/components/FormInputField/FormInputField'
import {FormSubmitButton} from 'pages/settings/new_billing/components/FormSubmitButton/FormSubmitButton'

describe('FormInputField', () => {
    it('should input field content in the form data as expected', async () => {
        const handleValidSubmit = jest.fn()

        render(
            <Form onValidSubmit={handleValidSubmit}>
                <FormInputField name="fieldName" />
                <FormSubmitButton />
            </Form>
        )

        const input = screen.getByRole('textbox')

        fireEvent.change(input, {target: {value: 'fieldContent'}})

        fireEvent.click(screen.getByRole('button'))

        await waitFor(() => {
            expect(handleValidSubmit).toHaveBeenCalledWith(
                {
                    fieldName: 'fieldContent',
                },
                expect.any(Object)
            )
        })
    })

    it('should display error message when input is invalid', async () => {
        render(
            <Form onValidSubmit={jest.fn()}>
                <FormInputField
                    name="fieldName"
                    rules={{required: 'Field is required'}}
                />
                <FormSubmitButton />
            </Form>
        )

        const input = screen.getByRole('textbox')

        fireEvent.change(input, {target: {value: ''}})

        // Tries to submit the form to trigger validation
        fireEvent.click(screen.getByRole('button'))

        await waitFor(() => {
            expect(screen.getByText('Field is required')).toBeVisible()
        })
    })

    it('should disable input field when disabled is true', () => {
        render(
            <Form onValidSubmit={jest.fn()} disabled>
                <FormInputField name="fieldName" />
            </Form>
        )

        const input = screen.getByRole('textbox')

        expect(input).toBeDisabled()
    })
})
