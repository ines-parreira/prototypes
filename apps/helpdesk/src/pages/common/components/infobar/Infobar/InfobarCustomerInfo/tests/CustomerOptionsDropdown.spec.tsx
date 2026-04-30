import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'

import CustomerOptionsDropdownButton from '../CustomerOptionsDropdown'

const state = {
    integrations: fromJS({
        integrations: [{ type: 'shopify' }],
    }),
}

const defaultProps = {
    onEditCustomer: jest.fn(),
    onSyncToShopify: jest.fn(),
    activeCustomer: Map({ name: 'John Doe' }),
}

describe('CustomerOptionsDropdownButton', () => {
    test('renders dropdown button', () => {
        render(<CustomerOptionsDropdownButton {...defaultProps} />, {
            storeState: state,
        })
        expect(
            screen.getByTestId('test-customer-options-dropdown-button'),
        ).toBeInTheDocument()
    })

    test('opens dropdown on button click and then it closes it', () => {
        render(<CustomerOptionsDropdownButton {...defaultProps} />, {
            storeState: state,
        })

        fireEvent.click(screen.getByRole('button'))
        expect(screen.getByText('Edit Customer')).toBeInTheDocument()
        expect(screen.getByText('Sync profile to Shopify')).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button'))
        expect(screen.queryByText('Edit Customer')).not.toBeInTheDocument()
        expect(
            screen.queryByText('Sync profile to Shopify'),
        ).not.toBeInTheDocument()
    })

    test('calls onEditCustomer callback when Edit Customer is clicked', () => {
        const mockOnEditCustomer = jest.fn()
        render(
            <CustomerOptionsDropdownButton
                {...defaultProps}
                onEditCustomer={mockOnEditCustomer}
            />,
            { storeState: state },
        )

        fireEvent.click(screen.getByRole('button'))
        fireEvent.click(screen.getByText('Edit Customer'))

        expect(mockOnEditCustomer).toHaveBeenCalledTimes(1)
    })

    test('calls onSyncToShopify callback when Sync profile to Shopify is clicked', () => {
        const mockOnSyncToShopify = jest.fn()
        render(
            <CustomerOptionsDropdownButton
                {...defaultProps}
                onSyncToShopify={mockOnSyncToShopify}
            />,
            { storeState: state },
        )

        fireEvent.click(screen.getByRole('button'))
        fireEvent.click(screen.getByText('Sync profile to Shopify'))

        expect(mockOnSyncToShopify).toHaveBeenCalledTimes(1)
    })

    test('doesnt show sync options if there is no shopify integration at all', () => {
        render(<CustomerOptionsDropdownButton {...defaultProps} />, {
            storeState: {
                integrations: fromJS({
                    integrations: [],
                }),
            },
        })

        fireEvent.click(screen.getByRole('button'))
        expect(
            screen.queryByText('Sync profile to Shopify'),
        ).not.toBeInTheDocument()

        expect(
            screen.queryByText('Sync John Doe profile to Shopify'),
        ).not.toBeInTheDocument()
    })
})
