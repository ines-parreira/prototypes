import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AuthenticationWarningBanner } from './AuthenticationWarningBanner'

describe('AuthenticationWarningBanner', () => {
    const mockOnSelectCustomerClick = jest.fn()

    beforeEach(() => {
        mockOnSelectCustomerClick.mockClear()
    })

    it('should render the banner with correct title and description', () => {
        render(
            <AuthenticationWarningBanner
                onSelectCustomerClick={mockOnSelectCustomerClick}
            />,
        )

        expect(
            screen.getByText("Authentication doesn't work in test mode."),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                /The AI Agent asked the customer to verify their identity/,
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                /but this can't be completed without a real customer/,
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                /in the test configuration to test order-related flows/,
            ),
        ).toBeInTheDocument()
    })

    it('should call onSelectCustomerClick when "Select a customer" link is clicked', async () => {
        const user = userEvent.setup()

        render(
            <AuthenticationWarningBanner
                onSelectCustomerClick={mockOnSelectCustomerClick}
            />,
        )

        const selectCustomerLink = screen.getByText('Select a customer')
        await user.click(selectCustomerLink)

        expect(mockOnSelectCustomerClick).toHaveBeenCalledTimes(1)
    })

    it('should call onSelectCustomerClick when enter key is pressed', async () => {
        const user = userEvent.setup()

        render(
            <AuthenticationWarningBanner
                onSelectCustomerClick={mockOnSelectCustomerClick}
            />,
        )

        const selectCustomerLink = screen.getByRole('button', {
            name: 'Select a customer',
        })
        selectCustomerLink.focus()
        await user.keyboard('{Enter}')

        expect(mockOnSelectCustomerClick).toHaveBeenCalledTimes(1)
    })
})
