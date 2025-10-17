import { ComponentProps } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { getTicket } from '@gorgias/helpdesk-client'

import { useSearchCustomer, useSearchTickets } from 'models/aiAgent/queries'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import {
    CustomerHttpIntegrationDataMock,
    DEFAULT_PLAYGROUND_CUSTOMER,
} from '../../../constants'
import {
    PlaygroundCustomerSelection,
    SenderTypeValues,
} from './PlaygroundCustomerSelection'

jest.mock('models/aiAgent/queries', () => ({
    useSearchCustomer: jest.fn(),
    useSearchTickets: jest.fn(),
}))

jest.mock('@gorgias/helpdesk-client', () => ({
    getTicket: jest.fn(),
}))

const mockUseSearchCustomer = jest.mocked(useSearchCustomer)
const mockUseSearchTickets = jest.mocked(useSearchTickets)
const mockGetTicket = jest.mocked(getTicket)

const mockOnCustomerChange = jest.fn()
const mockOnTicketChange = jest.fn()
const mockSenderType = SenderTypeValues.NEW_CUSTOMER
const mockOnSenderTypeChange = jest.fn()

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
                senderType={mockSenderType}
                onSenderTypeChange={mockOnSenderTypeChange}
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
        mockOnSenderTypeChange.mockClear()
        mockGetTicket.mockClear()

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
        mockUseSearchTickets.mockReturnValue({
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
        } as unknown as ReturnType<typeof useSearchTickets>)

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
        const selectButton = screen.getByRole('button', { expanded: false })
        expect(selectButton).toBeInTheDocument()
    })

    test('render empty input when select existing customer', () => {
        renderComponent({
            senderType: SenderTypeValues.EXISTING_CUSTOMER,
        })

        expect(
            screen.getByPlaceholderText('Search customer email'),
        ).toBeInTheDocument()
    })

    test('changes sender type and updates state', async () => {
        renderComponent()

        const selectButton = screen.getByRole('button', { expanded: false })
        fireEvent.click(selectButton)

        const existingCustomerOption = await screen.findByRole('option', {
            name: /existing customer/i,
        })
        fireEvent.click(existingCustomerOption)

        expect(mockOnSenderTypeChange).toHaveBeenCalledWith(
            SenderTypeValues.EXISTING_CUSTOMER,
        )
    })

    test('calls onCustomerChange with correct parameters for new customer', async () => {
        renderComponent({
            senderType: SenderTypeValues.EXISTING_CUSTOMER,
        })

        const selectButton = screen.getByRole('button', { expanded: false })
        fireEvent.click(selectButton)

        const newCustomerOption = await screen.findByRole('option', {
            name: /new customer/i,
        })
        fireEvent.click(newCustomerOption)

        expect(mockOnCustomerChange).toHaveBeenCalledWith({
            email: CustomerHttpIntegrationDataMock.address,
            id: CustomerHttpIntegrationDataMock.id,
            name: CustomerHttpIntegrationDataMock.name,
        })
    })

    test('shows existing ticket option', async () => {
        renderComponent()

        const selectButton = screen.getByRole('button', { expanded: false })
        fireEvent.click(selectButton)

        expect(
            await screen.findByRole('option', { name: /existing ticket/i }),
        ).toBeInTheDocument()
    })

    test('renders ticket search component when existing ticket is selected', () => {
        renderComponent({
            senderType: SenderTypeValues.EXISTING_TICKET,
        })

        expect(
            screen.getByPlaceholderText('Search by ticket id or email subject'),
        ).toBeInTheDocument()
    })

    test('real ticket search integration - searches and selects ticket', async () => {
        mockUseSearchTickets.mockReturnValue({
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
        } as unknown as ReturnType<typeof useSearchTickets>)

        renderComponent({
            senderType: SenderTypeValues.EXISTING_TICKET,
        })

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
})
