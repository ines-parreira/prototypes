import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { OrderManagementCard } from './OrderManagementCard'

const renderComponent = (
    props: Partial<Parameters<typeof OrderManagementCard>[0]> = {},
) => {
    const defaultProps = {
        isEnabled: false,
        orderManagementUrl: '/app/settings/order-management/shopify/test-shop',
        onChange: jest.fn(),
    }

    return render(
        <MemoryRouter>
            <OrderManagementCard {...defaultProps} {...props} />
        </MemoryRouter>,
    )
}

describe('OrderManagementCard', () => {
    it('should render the card with heading', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: /order management/i }),
        ).toBeInTheDocument()
    })

    it('should render the description text', () => {
        renderComponent()

        expect(
            screen.getByText(
                /allow customers to track and manage their orders directly within your chat/i,
            ),
        ).toBeInTheDocument()
    })

    it('should render toggle in unchecked state when isEnabled is false', () => {
        renderComponent({ isEnabled: false })

        const toggle = screen.getByRole('switch')
        expect(toggle).not.toBeChecked()
    })

    it('should render toggle in checked state when isEnabled is true', () => {
        renderComponent({ isEnabled: true })

        const toggle = screen.getByRole('switch')
        expect(toggle).toBeChecked()
    })

    it('should call onChange when toggle is clicked', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        renderComponent({ isEnabled: false, onChange })

        const toggle = screen.getByRole('switch')
        await user.click(toggle)

        expect(onChange).toHaveBeenCalledWith(true)
    })

    it('should disable toggle when isDisabled is true', () => {
        renderComponent({ isDisabled: true })

        const toggle = screen.getByRole('switch')
        expect(toggle).toBeDisabled()
    })

    it('should render skeleton when isLoading is true', () => {
        renderComponent({ isLoading: true })

        expect(
            screen.queryByRole('heading', { name: /order management/i }),
        ).not.toBeInTheDocument()
    })

    it('should not render store required tag by default', () => {
        renderComponent()

        expect(screen.queryByText(/store required/i)).not.toBeInTheDocument()
    })

    it('should render store required tag when showStoreRequired is true', () => {
        renderComponent({ showStoreRequired: true })

        expect(screen.getByText(/store required/i)).toBeInTheDocument()
    })
})
