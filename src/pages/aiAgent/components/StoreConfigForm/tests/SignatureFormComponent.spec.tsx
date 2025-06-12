import { act, fireEvent, render, screen } from '@testing-library/react'

import '@testing-library/jest-dom'

import { INITIAL_FORM_VALUES } from 'pages/aiAgent/constants'

import { SignatureFormComponent } from '../FormComponents/SignatureFormComponent'

describe('SignatureFormComponent', () => {
    const mockUpdateValue = jest.fn()

    const renderComponent = (signature: string | null, isRequired = true) => {
        render(
            <SignatureFormComponent
                isRequired={isRequired}
                signature={signature}
                useEmailIntegrationSignature={true}
                updateValue={mockUpdateValue}
            />,
        )
    }

    test('renders the component correctly', () => {
        renderComponent(INITIAL_FORM_VALUES.signature)

        // Check if the label and tooltip are rendered
        expect(
            screen.getByText(
                'At the end of emails you can disclose that the message was created by AI, or provide a custom name for AI Agent. Do not include greetings (e.g. "Best regards"). Greetings will already be included in the message above the signature.',
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
        fireEvent.change(textArea, {
            target: { value: 'Corrected signature' },
        })

        // Error message should disappear
        expect(screen.queryByText('Email signature is required.')).toBeNull()
    })

    test('does not show error if signature is not required', () => {
        renderComponent('', false)

        expect(
            screen.queryByText('Email signature is required.'),
        ).not.toBeInTheDocument()
    })

    test('checkbox toggles useEmailIntegrationSignature correctly', () => {
        renderComponent('Initial signature')

        const checkbox = screen.getByLabelText('Use AI Agent signature')

        // Initial state - checkbox should be unchecked (useEmailIntegrationSignature is true)
        expect(checkbox).not.toBeChecked()

        // Click checkbox to enable override
        fireEvent.click(checkbox)

        // Should call updateValue with useEmailIntegrationSignature set to false
        expect(mockUpdateValue).toHaveBeenCalledWith(
            'useEmailIntegrationSignature',
            false,
        )

        // Reset mock to clear previous calls
        mockUpdateValue.mockClear()

        // Click checkbox again to disable override
        fireEvent.click(checkbox)

        // Should call updateValue with useEmailIntegrationSignature set to false again
        // because the onChange handler inverts the value (value ? false : true)
        expect(mockUpdateValue).toHaveBeenCalledWith(
            'useEmailIntegrationSignature',
            false,
        )
    })

    test('textarea is disabled when checkbox is unchecked', async () => {
        const { rerender } = render(
            <SignatureFormComponent
                isRequired={true}
                signature="Initial signature"
                useEmailIntegrationSignature={true}
                updateValue={mockUpdateValue}
            />,
        )

        const checkbox = screen.getByLabelText('Use AI Agent signature')
        const textArea = screen.getByRole('textbox', { name: /signature/i })

        // Initial state - textarea should be disabled
        expect(textArea).toBeDisabled()

        // Click checkbox to enable override
        await act(async () => {
            fireEvent.click(checkbox)
        })

        // Debug: Check if mockUpdateValue was called with the correct value
        expect(mockUpdateValue).toHaveBeenCalledWith(
            'useEmailIntegrationSignature',
            false,
        )

        // Update the component with new props
        rerender(
            <SignatureFormComponent
                isRequired={true}
                signature="Initial signature"
                useEmailIntegrationSignature={false}
                updateValue={mockUpdateValue}
            />,
        )

        // Textarea should be enabled after state update
        expect(textArea).not.toBeDisabled()
    })
})
