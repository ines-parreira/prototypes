import type { ComponentProps } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'

import { useSearchCustomer, useSearchTickets } from 'models/aiAgent/queries'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { DEFAULT_PLAYGROUND_CUSTOMER } from '../../../constants'
import { TargetSelection } from './TargetSelection'

jest.mock('models/aiAgent/queries', () => ({
    useSearchCustomer: jest.fn(),
    useSearchTickets: jest.fn(),
}))

const mockUseSearchCustomer = jest.mocked(useSearchCustomer)
const mockUseSearchTickets = jest.mocked(useSearchTickets)

const mockOnChange = jest.fn()

const renderComponent = (
    props?: Partial<ComponentProps<typeof TargetSelection>>,
) => {
    return render(
        <QueryClientProvider client={mockQueryClient()}>
            <TargetSelection
                customer={DEFAULT_PLAYGROUND_CUSTOMER}
                onChange={mockOnChange}
                {...props}
            />
        </QueryClientProvider>,
    )
}

describe('TargetSelection', () => {
    beforeEach(() => {
        mockOnChange.mockClear()

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

        mockUseSearchTickets.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: null,
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useSearchTickets>)
    })

    describe('rendering', () => {
        it('renders with Target label', () => {
            renderComponent()

            expect(screen.getByText('Target')).toBeInTheDocument()
        })

        it('renders PlaygroundCustomerSelection component', () => {
            renderComponent()

            const container = screen.getByText('Target').nextElementSibling
            expect(container).toBeInTheDocument()
            expect(
                within(container as HTMLElement).getAllByText(
                    'New customer',
                )[0],
            ).toBeInTheDocument()
        })
    })

    describe('customer selection', () => {
        it('calls onChange with customer when switching to new customer', async () => {
            renderComponent({
                customer: {
                    ...DEFAULT_PLAYGROUND_CUSTOMER,
                    email: 'different@example.com',
                },
            })

            const selectDropdown = screen
                .getAllByText('New customer')[0]
                .closest('[data-toggle="dropdown"]')
            if (selectDropdown) {
                fireEvent.click(selectDropdown)
            }

            const existingCustomerOption = await screen.findByRole('menuitem', {
                name: /existing customer/i,
            })
            fireEvent.click(existingCustomerOption)

            const selectDropdownAgain = screen
                .getAllByText('Existing customer')[0]
                .closest('[data-toggle="dropdown"]')
            if (selectDropdownAgain) {
                fireEvent.click(selectDropdownAgain)
            }

            const newCustomerOption = await screen.findByRole('menuitem', {
                name: /new customer/i,
            })
            fireEvent.click(newCustomerOption)

            expect(mockOnChange).toHaveBeenCalledWith({
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            })
        })
    })

    describe('sender type state', () => {
        it('initializes with NEW_CUSTOMER sender type', () => {
            renderComponent()

            const selectedLabel = screen
                .getAllByText('New customer')
                .find((el) => el.className.includes('label'))
            expect(selectedLabel).toBeInTheDocument()
        })

        it('updates sender type when selection changes', async () => {
            renderComponent()

            const selectDropdown = screen
                .getAllByText('New customer')[0]
                .closest('[data-toggle="dropdown"]')
            if (selectDropdown) {
                fireEvent.click(selectDropdown)
            }

            const existingTicketOption = await screen.findByRole('menuitem', {
                name: /existing ticket/i,
            })
            fireEvent.click(existingTicketOption)

            expect(
                screen.getByPlaceholderText(
                    'Search by ticket id or email subject',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('default customer initialization', () => {
        it('passes DEFAULT_PLAYGROUND_CUSTOMER to PlaygroundCustomerSelection', () => {
            renderComponent()

            const selectedLabel = screen
                .getAllByText('New customer')
                .find((el) => el.className.includes('label'))
            expect(selectedLabel).toBeInTheDocument()
        })
    })

    describe('integration with PlaygroundCustomerSelection', () => {
        it('shows ticket search when existing ticket is selected', async () => {
            renderComponent()

            const selectDropdown = screen
                .getAllByText('New customer')[0]
                .closest('[data-toggle="dropdown"]')
            if (selectDropdown) {
                fireEvent.click(selectDropdown)
            }

            const existingTicketOption = await screen.findByRole('menuitem', {
                name: /existing ticket/i,
            })
            fireEvent.click(existingTicketOption)

            expect(
                screen.getByPlaceholderText(
                    'Search by ticket id or email subject',
                ),
            ).toBeInTheDocument()
        })

        it('shows customer search when existing customer is selected', async () => {
            renderComponent()

            const selectDropdown = screen
                .getAllByText('New customer')[0]
                .closest('[data-toggle="dropdown"]')
            if (selectDropdown) {
                fireEvent.click(selectDropdown)
            }

            const existingCustomerOption = await screen.findByRole('menuitem', {
                name: /existing customer/i,
            })
            fireEvent.click(existingCustomerOption)

            expect(
                screen.getByPlaceholderText('Search customer email'),
            ).toBeInTheDocument()
        })

        it('hides conditional content when new customer is selected', async () => {
            renderComponent()

            const selectDropdown = screen
                .getAllByText('New customer')[0]
                .closest('[data-toggle="dropdown"]')
            if (selectDropdown) {
                fireEvent.click(selectDropdown)
            }

            const existingCustomerOption = await screen.findByRole('menuitem', {
                name: /existing customer/i,
            })
            fireEvent.click(existingCustomerOption)

            expect(
                screen.getByPlaceholderText('Search customer email'),
            ).toBeInTheDocument()

            const selectDropdownAgain = screen
                .getAllByText('Existing customer')[0]
                .closest('[data-toggle="dropdown"]')
            if (selectDropdownAgain) {
                fireEvent.click(selectDropdownAgain)
            }

            const newCustomerOption = await screen.findByRole('menuitem', {
                name: /new customer/i,
            })
            fireEvent.click(newCustomerOption)

            expect(
                screen.queryByPlaceholderText('Search customer email'),
            ).not.toBeInTheDocument()
        })
    })
})
