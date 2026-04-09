import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { ResponseMessageContent } from 'models/selfServiceConfiguration/types'

import { ReturnOrderAutomatedResponseAction } from './ReturnOrderAutomatedResponseAction'

jest.mock('../ReturnOrderFlowViewContext', () => ({
    usePropagateError: jest.fn(),
}))

describe('ReturnOrderAutomatedResponseAction', () => {
    const mockOnChange = jest.fn()

    const responseMessageContent: ResponseMessageContent = {
        html: '<p>Thank you for your return request.</p>',
        text: 'Thank you for your return request.',
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render section title', () => {
        render(
            <ReturnOrderAutomatedResponseAction
                responseMessageContent={responseMessageContent}
                onChange={mockOnChange}
            />,
        )

        expect(screen.getByText('Response text')).toBeInTheDocument()
    })

    it('should render the textarea with current value', () => {
        render(
            <ReturnOrderAutomatedResponseAction
                responseMessageContent={responseMessageContent}
                onChange={mockOnChange}
            />,
        )

        expect(
            screen.getByRole('textbox', { name: 'Response text' }),
        ).toHaveValue('Thank you for your return request.')
    })

    it('should render the description below the textarea', () => {
        render(
            <ReturnOrderAutomatedResponseAction
                responseMessageContent={responseMessageContent}
                onChange={mockOnChange}
            />,
        )

        expect(
            screen.getByText(
                /When customers request a return, an automated reply is sent/,
            ),
        ).toBeInTheDocument()
    })

    it('should call onChange when text is typed', async () => {
        const user = userEvent.setup()

        render(
            <ReturnOrderAutomatedResponseAction
                responseMessageContent={{ html: '', text: '' }}
                onChange={mockOnChange}
            />,
        )

        const textarea = screen.getByRole('textbox', { name: 'Response text' })
        await user.type(textarea, 'Hello')

        expect(mockOnChange).toHaveBeenCalled()
        const lastCall =
            mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0]
        expect(lastCall).toHaveProperty('text')
        expect(lastCall).toHaveProperty('html')
    })
})
