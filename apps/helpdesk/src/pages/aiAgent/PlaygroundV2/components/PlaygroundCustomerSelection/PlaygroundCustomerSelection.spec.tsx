import type { ComponentProps } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { getTicket } from '@gorgias/helpdesk-client'

import { useSearchCustomer, useSearchTickets } from 'models/aiAgent/queries'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import {
    CustomerHttpIntegrationDataMock,
    DEFAULT_PLAYGROUND_CUSTOMER,
} from '../../../constants'
import { useCoreContext } from '../../contexts/CoreContext'
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

jest.mock('../../contexts/CoreContext', () => ({
    useCoreContext: jest.fn(),
}))

const mockUseSearchCustomer = jest.mocked(useSearchCustomer)
const mockUseSearchTickets = jest.mocked(useSearchTickets)
const mockGetTicket = jest.mocked(getTicket)
const mockUseCoreContext = jest.mocked(useCoreContext)

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

        mockUseCoreContext.mockReturnValue({
            shouldFocusCustomerSelection: false,
            setShouldFocusCustomerSelection: jest.fn(),
        } as any)

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
        expect(screen.getByText('Existing customer')).toBeInTheDocument()
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
        const user = userEvent.setup({ delay: null })
        renderComponent()

        const selectButton = screen.getByRole('button', {
            name: /New customer/i,
        })
        await user.click(selectButton)

        const existingCustomerOption = screen.getByRole('option', {
            name: 'Existing customer',
        })
        await user.click(existingCustomerOption)

        expect(mockOnSenderTypeChange).toHaveBeenCalledWith(
            SenderTypeValues.EXISTING_CUSTOMER,
        )
    })

    test('calls onCustomerChange with correct parameters for new customer', async () => {
        const user = userEvent.setup({ delay: null })
        renderComponent({
            senderType: SenderTypeValues.EXISTING_CUSTOMER,
        })

        const selectButton = screen.getByRole('button', {
            name: /Existing customer/i,
        })
        await user.click(selectButton)

        const newCustomerOption = screen.getByRole('option', {
            name: 'New customer',
        })
        await user.click(newCustomerOption)

        expect(mockOnCustomerChange).toHaveBeenCalledWith({
            email: CustomerHttpIntegrationDataMock.address,
            id: CustomerHttpIntegrationDataMock.id,
            name: CustomerHttpIntegrationDataMock.name,
        })
    })

    test('shows existing ticket option', () => {
        renderComponent()

        expect(screen.getByText('Existing ticket')).toBeInTheDocument()
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
        const user = userEvent.setup({ delay: null })
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

        const searchInput = screen.getByPlaceholderText(
            'Search by ticket id or email subject',
        )
        await user.type(searchInput, 'test search')

        jest.advanceTimersByTime(1000)

        await waitFor(() => {
            expect(
                screen.getByText(/Test Ticket Subject.*Test Customer.*123/),
            ).toBeInTheDocument()
        })

        const ticketOption = screen.getByText(
            /Test Ticket Subject.*Test Customer.*123/,
        )
        await user.click(ticketOption)

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

    test('focuses input when shouldFocusCustomerSelection is true and resets on blur', async () => {
        const user = userEvent.setup({ delay: null })
        const mockSetShouldFocusCustomerSelection = jest.fn()

        mockUseCoreContext.mockReturnValue({
            shouldFocusCustomerSelection: true,
            setShouldFocusCustomerSelection:
                mockSetShouldFocusCustomerSelection,
        } as any)

        renderComponent()

        const input = screen.getByRole('textbox')

        await waitFor(() => {
            expect(input).toHaveFocus()
        })

        await user.tab()

        expect(mockSetShouldFocusCustomerSelection).toHaveBeenCalledWith(false)
    })
})
