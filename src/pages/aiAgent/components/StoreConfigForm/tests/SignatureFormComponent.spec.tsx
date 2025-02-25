import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import '@testing-library/jest-dom'

import { INITIAL_FORM_VALUES } from '../../../constants'
import { SignatureFormComponent } from '../FormComponents/SignatureFormComponent'

describe('SignatureFormComponent', () => {
    const mockUpdateValue = jest.fn()

    const renderComponent = (signature: string | null, isRequired = true) => {
        render(
            <SignatureFormComponent
                isRequired={isRequired}
                signature={signature}
                updateValue={mockUpdateValue}
            />,
        )
    }

    test('renders the component correctly', () => {
        renderComponent(INITIAL_FORM_VALUES.signature)

        // Check if the label and tooltip are rendered
        expect(screen.getByText('Signature')).toBeInTheDocument()
        expect(
            screen.getByText(
                /At the end of emails you can disclose that the message was created by AI/i,
            ),
        ).toBeInTheDocument()

        // Check if the textarea is rendered with correct placeholder
        const textArea = screen.getByPlaceholderText('AI Agent email signature')
        expect(textArea).toBeInTheDocument()
        expect(textArea).toHaveValue(INITIAL_FORM_VALUES.signature)
    })

    test('shows initial value correctly when signature is provided', () => {
        renderComponent('Initial signature')

        const textArea = screen.getByPlaceholderText('AI Agent email signature')
        expect(textArea).toHaveValue('Initial signature')
    })

    test('calls updateValue when the user types in the textarea', () => {
        renderComponent(null)

        const textArea = screen.getByPlaceholderText('AI Agent email signature')

        // Simulate typing
        fireEvent.change(textArea, { target: { value: 'New signature' } })
        fireEvent.blur(textArea)

        expect(mockUpdateValue).toHaveBeenCalledWith(
            'signature',
            'New signature',
        )
    })

    test('displays an error message when the signature is blurred and invalid', () => {
        renderComponent('')

        const textArea = screen.getByPlaceholderText('AI Agent email signature')

        // Simulate blur event (leaving the textarea)
        fireEvent.blur(textArea)

        expect(
            screen.getByText('Email signature is required.'),
        ).toBeInTheDocument()
    })

    test('does not display error message when signature is valid', () => {
        renderComponent('Valid signature')

        const textArea = screen.getByPlaceholderText('AI Agent email signature')

        // Simulate blur event
        fireEvent.blur(textArea)

        // Error message should not be present
        expect(screen.queryByText('Email signature is required.')).toBeNull()
    })

    test('displays info message when signature is valid', () => {
        renderComponent('Valid signature')

        const textArea = screen.getByPlaceholderText('AI Agent email signature')

        // Simulate blur event
        fireEvent.blur(textArea)

        // Check if the info message is displayed
        expect(
            screen.getByText(
                /At the end of emails you can disclose that the message was created by AI/i,
            ),
        ).toBeInTheDocument()
    })

    test('does not show error if input is modified after an invalid state', () => {
        renderComponent('')

        const textArea = screen.getByPlaceholderText('AI Agent email signature')

        // Simulate blur event
        fireEvent.blur(textArea)

        // Error message should be present
        expect(
            screen.getByText('Email signature is required.'),
        ).toBeInTheDocument()

        // Now type something to fix the error
        fireEvent.change(textArea, { target: { value: 'Corrected signature' } })

        // Error message should disappear
        expect(screen.queryByText('Email signature is required.')).toBeNull()
    })

    test('does not show error if signature is not required', () => {
        renderComponent('', false)

        expect(
            screen.queryByText('Email signature is required.'),
        ).not.toBeInTheDocument()
    })
})
