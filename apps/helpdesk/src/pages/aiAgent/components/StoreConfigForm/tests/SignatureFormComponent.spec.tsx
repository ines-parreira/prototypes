import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'

import { INITIAL_FORM_VALUES } from 'pages/aiAgent/constants'
import { mockStore } from 'utils/testing'

import { SignatureFormComponent } from '../FormComponents/SignatureFormComponent'

const store = mockStore({})

describe('SignatureFormComponent', () => {
    const mockUpdateValue = jest.fn()

    beforeEach(() => {
        mockUpdateValue.mockClear()
    })

    const defaultProps = {
        isRequired: true,
        signature: INITIAL_FORM_VALUES.signature,
        useEmailIntegrationSignature: true,
        updateValue: mockUpdateValue,
    }

    const renderComponent = (overrides = {}) => {
        return render(
            <Provider store={store}>
                <SignatureFormComponent {...defaultProps} {...overrides} />
            </Provider>,
        )
    }

    test('renders the component correctly', () => {
        renderComponent()

        expect(
            screen.getByText(
                'At the end of emails you can disclose that the message was created by AI, or provide a custom name for AI Agent. Do not include greetings (e.g. "Best regards"). Greetings will already be included in the message above the signature.',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(INITIAL_FORM_VALUES.signature),
        ).toBeInTheDocument()
    })

    test('renders signature text when provided', () => {
        renderComponent({ signature: 'Custom signature text' })

        expect(screen.getByText('Custom signature text')).toBeInTheDocument()
    })

    test('does not show error if signature is not required', () => {
        renderComponent({ isRequired: false, signature: '' })

        expect(
            screen.queryByText('Email signature is required.'),
        ).not.toBeInTheDocument()
    })

    test('does not show error when checkbox is unchecked (useEmailIntegrationSignature is true)', () => {
        renderComponent({
            signature: '',
            useEmailIntegrationSignature: true,
        })

        expect(
            screen.queryByText('Email signature is required.'),
        ).not.toBeInTheDocument()
    })

    test('checkbox toggles useEmailIntegrationSignature correctly', async () => {
        const user = userEvent.setup()
        renderComponent()

        const checkbox = screen.getByLabelText('Use AI Agent signature')

        expect(checkbox).not.toBeChecked()

        await user.click(checkbox)

        expect(mockUpdateValue).toHaveBeenCalledWith(
            'useEmailIntegrationSignature',
            false,
        )
    })

    test('editor is disabled when checkbox is unchecked', () => {
        renderComponent({ useEmailIntegrationSignature: true })

        const checkbox = screen.getByLabelText('Use AI Agent signature')
        expect(checkbox).not.toBeChecked()

        const editorWrapper = screen
            .getByText(INITIAL_FORM_VALUES.signature)
            .closest('[class*="editorWrapper"]')
        expect(editorWrapper?.className).toContain('Disabled')
    })

    test('editor is enabled when checkbox is checked', () => {
        renderComponent({ useEmailIntegrationSignature: false })

        const checkbox = screen.getByLabelText('Use AI Agent signature')
        expect(checkbox).toBeChecked()

        const editorWrapper = screen
            .getByText(INITIAL_FORM_VALUES.signature)
            .closest('[class*="editorWrapper"]')
        expect(editorWrapper?.className).not.toContain('Disabled')
    })
})
