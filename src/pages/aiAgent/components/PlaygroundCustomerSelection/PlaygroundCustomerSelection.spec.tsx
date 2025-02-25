import React, { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useSearchCustomer } from 'models/aiAgent/queries'

import {
    CustomerHttpIntegrationDataMock,
    DEFAULT_PLAYGROUND_CUSTOMER,
} from '../../constants'
import { PlaygroundCustomerSelection } from './PlaygroundCustomerSelection'

jest.mock('models/aiAgent/queries', () => ({
    useSearchCustomer: jest.fn(),
}))
const mockUseSearchCustomer = jest.mocked(useSearchCustomer)

const mockOnCustomerEmailChange = jest.fn()
const renderComponent = (
    props?: Partial<ComponentProps<typeof PlaygroundCustomerSelection>>,
) => {
    return render(
        <PlaygroundCustomerSelection
            onCustomerEmailChange={mockOnCustomerEmailChange}
            customer={DEFAULT_PLAYGROUND_CUSTOMER}
            isDisabled={false}
            {...props}
        />,
    )
}

describe('PlaygroundCustomerSelection', () => {
    beforeEach(() => {
        mockOnCustomerEmailChange.mockClear()
        mockUseSearchCustomer.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: {
                data: { data: [] },
            },
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useSearchCustomer>)
    })

    test('renders with default props', () => {
        renderComponent()
        expect(screen.getByText('Existing customer')).toBeInTheDocument()
    })

    test('render empty input when select existing customer', () => {
        renderComponent()

        const existingCustomerOption = screen.getByText('Existing customer')
        userEvent.click(existingCustomerOption)

        expect(screen.getByPlaceholderText('Search')).toBeInTheDocument()
    })

    test('changes sender type and updates state', () => {
        renderComponent()

        const existingCustomerOption = screen.getByText('Existing customer')
        userEvent.click(existingCustomerOption)
        expect(mockOnCustomerEmailChange).toHaveBeenCalledWith(
            DEFAULT_PLAYGROUND_CUSTOMER,
        )
    })

    test('calls onCustomerEmailChange with correct parameters for new customer', () => {
        renderComponent()

        const newCustomerOption = screen.getAllByText('New customer')[1]
        userEvent.click(newCustomerOption)
        expect(mockOnCustomerEmailChange).toHaveBeenCalledWith({
            email: CustomerHttpIntegrationDataMock.address,
            id: CustomerHttpIntegrationDataMock.id,
            name: CustomerHttpIntegrationDataMock.name,
        })
    })
})
