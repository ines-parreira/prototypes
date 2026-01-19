import { act, screen } from '@testing-library/react'

import { mockCustomer } from '@gorgias/helpdesk-mocks'
import type { CustomerChannelsItem } from '@gorgias/helpdesk-types'

import { render } from '../../../../../tests/render.utils'
import { CustomerListItem } from '../CustomerListItem'

const mockOnSetCustomer = vi.fn()
const mockOnPreviewCustomer = vi.fn()

const defaultProps = {
    customer: mockCustomer({
        id: 123,
        name: 'John Doe',
        email: 'john@example.com',
        channels: [
            {
                id: 1,
                type: 'email',
                address: 'john@example.com',
            } as CustomerChannelsItem,
            {
                id: 2,
                type: 'phone',
                address: '+14155552671',
            } as CustomerChannelsItem,
        ],
    }),
    onSetCustomer: mockOnSetCustomer,
    onPreviewCustomer: mockOnPreviewCustomer,
}

describe('CustomerListItem', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render customer name', () => {
        render(<CustomerListItem {...defaultProps} />)

        expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should render customer ID when name is not available', () => {
        const customerWithoutName = mockCustomer({
            id: 456,
            channels: [],
            name: undefined,
        })

        render(
            <CustomerListItem
                {...defaultProps}
                customer={customerWithoutName}
            />,
        )

        expect(screen.getByText('Customer #456')).toBeInTheDocument()
    })

    it('should render email address when available', () => {
        render(<CustomerListItem {...defaultProps} />)

        expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('should render phone number when available', () => {
        render(<CustomerListItem {...defaultProps} />)

        expect(screen.getByText('+1 415 555 2671')).toBeInTheDocument()
    })

    it('should show "Potential duplicate" tag when isDuplicate is true', () => {
        render(<CustomerListItem {...defaultProps} isDuplicate={true} />)

        expect(screen.getByText('Potential duplicate')).toBeInTheDocument()
    })

    it('should call onSetCustomer when "Set as customer" button is clicked', async () => {
        const { user } = render(<CustomerListItem {...defaultProps} />)

        const setAsCustomerButton = screen.getByRole('button', {
            name: 'Set as customer',
        })

        await act(() => user.click(setAsCustomerButton))

        expect(mockOnSetCustomer).toHaveBeenCalledWith(defaultProps.customer)
        expect(mockOnSetCustomer).toHaveBeenCalledTimes(1)
    })

    it('should call onPreviewCustomer when "View details" button is clicked', async () => {
        const { user } = render(<CustomerListItem {...defaultProps} />)

        const viewDetailsButton = screen.getByRole('button', {
            name: 'View details',
        })

        await act(() => user.click(viewDetailsButton))

        expect(mockOnPreviewCustomer).toHaveBeenCalledWith(
            defaultProps.customer,
        )
        expect(mockOnPreviewCustomer).toHaveBeenCalledTimes(1)
    })
})
