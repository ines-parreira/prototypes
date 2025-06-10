import React, { ComponentProps } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { getTicket } from '@gorgias/helpdesk-client'

import { useFlag } from 'core/flags'
import {
    useSearchCustomer,
    useSearchEmailTickets,
} from 'models/aiAgent/queries'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import {
    CustomerHttpIntegrationDataMock,
    DEFAULT_PLAYGROUND_CUSTOMER,
} from '../../../constants'
import { PlaygroundCustomerSelection } from './PlaygroundCustomerSelection'

jest.mock('models/aiAgent/queries', () => ({
    useSearchCustomer: jest.fn(),
    useSearchEmailTickets: jest.fn(),
}))

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

jest.mock('@gorgias/helpdesk-client', () => ({
    getTicket: jest.fn(),
}))

const mockUseSearchCustomer = jest.mocked(useSearchCustomer)
const mockUseSearchEmailTickets = jest.mocked(useSearchEmailTickets)
const mockUseFlag = jest.mocked(useFlag)
const mockGetTicket = jest.mocked(getTicket)

const mockOnCustomerChange = jest.fn()
const mockOnTicketChange = jest.fn()

const renderComponent = (
    props?: Partial<ComponentProps<typeof PlaygroundCustomerSelection>>,
) => {
    return render(
        <QueryClientProvider client={mockQueryClient()}>
            <PlaygroundCustomerSelection
                onCustomerChange={mockOnCustomerChange}
                onTicketChange={mockOnTicketChange}
                customer={DEFAULT_PLAYGROUND_CUSTOMER}
                isDisabled={false}
                {...props}
            />
        </QueryClientProvider>,
    )
}

describe('PlaygroundCustomerSelection', () => {
    beforeEach(() => {
        jest.useFakeTimers()
        mockOnCustomerChange.mockClear()
        mockOnTicketChange.mockClear()
        mockGetTicket.mockClear()
        mockUseFlag.mockReturnValue(true) // Default: feature flag enabled

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

        // Mock for search email tickets - returns empty initially
        mockUseSearchEmailTickets.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: null,
            refetch: jest.fn().mockResolvedValue({
                data: {
                    data: [
                        {
                            id: 123,
                            subject: 'Test Ticket Subject',
                            customer: {
                                id: 456,
                                name: 'Test Customer',
                                email: 'test@example.com',
                            },
                        },
                    ],
                },
            }),
        } as unknown as ReturnType<typeof useSearchEmailTickets>)

        // Mock getTicket to return a full ticket
        mockGetTicket.mockResolvedValue({
            data: {
                id: 123,
                subject: 'Test Ticket Subject',
                customer: {
                    id: 456,
                    name: 'Test Customer',
                    email: 'test@example.com',
                },
                messages: [
                    {
                        id: 1,
                        from_agent: false,
                        stripped_text: 'Test message content',
                        created_datetime: '2023-01-01T10:00:00Z',
                    },
                ],
            },
        } as any)
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    test('renders with default props', () => {
        renderComponent()
        expect(screen.getByText('Existing customer')).toBeInTheDocument()
    })

    test('render empty input when select existing customer', () => {
        renderComponent()

        const existingCustomerOption = screen.getByText('Existing customer')
        fireEvent.click(existingCustomerOption)

        expect(
            screen.getByPlaceholderText('Search customer email'),
        ).toBeInTheDocument()
    })

    test('changes sender type and updates state', () => {
        renderComponent()

        const existingCustomerOption = screen.getByText('Existing customer')
        fireEvent.click(existingCustomerOption)
        expect(mockOnCustomerChange).toHaveBeenCalledWith(
            DEFAULT_PLAYGROUND_CUSTOMER,
        )
    })

    test('calls onCustomerChange with correct parameters for new customer', () => {
        renderComponent()

        const newCustomerOption = screen.getAllByText('New customer')[1]
        fireEvent.click(newCustomerOption)
        expect(mockOnCustomerChange).toHaveBeenCalledWith({
            email: CustomerHttpIntegrationDataMock.address,
            id: CustomerHttpIntegrationDataMock.id,
            name: CustomerHttpIntegrationDataMock.name,
        })
    })

    test('shows existing ticket option when feature flag is enabled', () => {
        mockUseFlag.mockReturnValue(true)
        renderComponent()

        expect(screen.getByText('Existing ticket')).toBeInTheDocument()
    })

    test('hides existing ticket option when feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)
        renderComponent()

        expect(screen.queryByText('Existing ticket')).not.toBeInTheDocument()
        expect(screen.getAllByText('New customer')).toHaveLength(2) // One in selected value, one in options
        expect(screen.getByText('Existing customer')).toBeInTheDocument()
    })

    test('renders ticket search component when existing ticket is selected', () => {
        mockUseFlag.mockReturnValue(true)
        renderComponent()

        // Select existing ticket option
        const existingTicketOption = screen.getByText('Existing ticket')
        fireEvent.click(existingTicketOption)

        // Verify that the real ticket search component is rendered
        expect(
            screen.getByPlaceholderText('Search by ticket id or email subject'),
        ).toBeInTheDocument()
    })

    test('real ticket search integration - searches and selects ticket', async () => {
        mockUseFlag.mockReturnValue(true)

        mockUseSearchEmailTickets.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: {
                data: {
                    data: [
                        {
                            id: 123,
                            subject: 'Test Ticket Subject',
                            customer: {
                                id: 456,
                                name: 'Test Customer',
                                email: 'test@example.com',
                            },
                        },
                    ],
                },
            },
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useSearchEmailTickets>)

        renderComponent()

        // Select existing ticket option
        const existingTicketOption = screen.getByText('Existing ticket')
        fireEvent.click(existingTicketOption)

        // Type in the search input
        const searchInput = screen.getByPlaceholderText(
            'Search by ticket id or email subject',
        )
        fireEvent.change(searchInput, 'test search')

        // Fast-forward timers to trigger the debounced search
        jest.advanceTimersByTime(1000)

        // Wait for the search results to appear
        await waitFor(() => {
            expect(
                screen.getByText(/Test Ticket Subject.*Test Customer.*123/),
            ).toBeInTheDocument()
        })

        // Click on the ticket in the dropdown
        const ticketOption = screen.getByText(
            /Test Ticket Subject.*Test Customer.*123/,
        )
        fireEvent.click(ticketOption)

        // Wait for the getTicket call and onTicketChange to be called
        await waitFor(() => {
            expect(mockGetTicket).toHaveBeenCalledWith(123)
            expect(mockOnTicketChange).toHaveBeenCalledWith({
                customer: {
                    id: 456,
                    name: 'Test Customer',
                    email: 'test@example.com',
                },
                subject: 'Test Ticket Subject',
                message: 'Test message content',
            })
        })
    })

    test('resets to new customer when feature flag becomes disabled and existing ticket was selected', () => {
        // Start with flag enabled
        mockUseFlag.mockReturnValue(true)
        const { rerender } = renderComponent()

        // Select existing ticket option
        const existingTicketOption = screen.getByText('Existing ticket')
        fireEvent.click(existingTicketOption)

        // Verify existing ticket is selected (ticket search input should be visible)
        expect(
            screen.getByPlaceholderText('Search by ticket id or email subject'),
        ).toBeInTheDocument()

        // Now disable the feature flag
        mockUseFlag.mockReturnValue(false)

        // Re-render with disabled flag
        rerender(
            <QueryClientProvider client={mockQueryClient()}>
                <PlaygroundCustomerSelection
                    onCustomerChange={mockOnCustomerChange}
                    onTicketChange={mockOnTicketChange}
                    customer={DEFAULT_PLAYGROUND_CUSTOMER}
                    isDisabled={false}
                />
            </QueryClientProvider>,
        )

        // Should automatically reset to "New customer" and hide existing ticket option
        // This covers line 104 - the feature flag reset logic
        expect(screen.queryByText('Existing ticket')).not.toBeInTheDocument()
        expect(
            screen.queryByPlaceholderText(
                'Search by ticket id or email subject',
            ),
        ).not.toBeInTheDocument()
    })
})
