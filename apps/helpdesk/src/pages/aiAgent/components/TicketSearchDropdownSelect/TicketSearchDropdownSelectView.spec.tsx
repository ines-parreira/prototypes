import type { ComponentProps } from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import type { Ticket } from '@gorgias/helpdesk-client'
import { getTicket } from '@gorgias/helpdesk-client'

import { useSearchTickets } from 'models/aiAgent/queries'

import { TicketSearchDropdownSelectView } from './TicketSearchDropdownSelectView'

jest.mock('models/aiAgent/queries', () => ({
    useSearchTickets: jest.fn(),
}))

jest.mock('@gorgias/helpdesk-client', () => ({
    getTicket: jest.fn(),
}))

jest.mock('@repo/logging', () => ({
    reportError: jest.fn(),
}))

const mockUseSearchTickets = jest.mocked(useSearchTickets)
const mockGetTicket = jest.mocked(getTicket)

const mockTicketSearchResults = [
    {
        id: 123,
        subject: 'Test Ticket 1',
        customer: {
            id: 456,
            name: 'John Doe',
            email: 'john@example.com',
        },
    },
    {
        id: 124,
        subject: 'Test Ticket 2',
        customer: {
            id: 457,
            name: 'Jane Smith',
            email: 'jane@example.com',
        },
    },
]

const mockFullTicket = {
    id: 123,
    subject: 'Test Ticket 1',
    customer: {
        id: 456,
        name: 'John Doe',
        email: 'john@example.com',
        firstname: 'John',
        lastname: 'Doe',
    },
    messages: [
        {
            id: 1,
            isMessage: true,
            from_agent: false,
            body_text: 'Customer message content',
            created_datetime: '2023-01-01T10:00:00Z',
        },
    ],
} as unknown as Ticket

const mockOnSelect = jest.fn()

const renderComponent = (
    props?: Partial<ComponentProps<typeof TicketSearchDropdownSelectView>>,
) => {
    return render(
        <TicketSearchDropdownSelectView onSelect={mockOnSelect} {...props} />,
    )
}

describe('TicketSearchDropdownSelectView', () => {
    beforeEach(() => {
        mockUseSearchTickets.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: null,
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useSearchTickets>)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should render search input', () => {
        renderComponent()

        expect(
            screen.getByPlaceholderText('Search by ticket id or email subject'),
        ).toBeInTheDocument()
    })

    it('should show loading state when searching', async () => {
        mockUseSearchTickets.mockReturnValue({
            isLoading: true,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: null,
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useSearchTickets>)

        renderComponent()

        const searchInput = screen.getByPlaceholderText(
            'Search by ticket id or email subject',
        )
        await act(async () => {
            await userEvent.type(searchInput, 'test')
        })

        await waitFor(() => {
            const skeletons = document.getElementsByClassName(
                'react-loading-skeleton',
            )
            expect(skeletons).toHaveLength(3)
        })
    })

    it('should display search results', async () => {
        // Set up mock to simulate the actual behavior:
        // First call returns no data, second call returns search results
        const mockRefetch = jest.fn()
        mockUseSearchTickets
            .mockReturnValueOnce({
                isLoading: false,
                error: null,
                isRefetching: false,
                isRefetchError: false,
                data: null,
                refetch: mockRefetch,
            } as unknown as ReturnType<typeof useSearchTickets>)
            .mockReturnValue({
                isLoading: false,
                error: null,
                isRefetching: false,
                isRefetchError: false,
                data: { data: { data: mockTicketSearchResults } },
                refetch: mockRefetch,
            } as unknown as ReturnType<typeof useSearchTickets>)

        const { rerender } = renderComponent()

        // Start typing to trigger search
        const searchInput = screen.getByPlaceholderText(
            'Search by ticket id or email subject',
        )

        await userEvent.type(searchInput, 'test')

        // Force re-render to pick up the new mock value
        rerender(<TicketSearchDropdownSelectView onSelect={mockOnSelect} />)

        await waitFor(
            () => {
                expect(
                    screen.getByText('Test Ticket 1 - John Doe - 123'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('Test Ticket 2 - Jane Smith - 124'),
                ).toBeInTheDocument()
            },
            { timeout: 2000 },
        )
    })

    it('should show "No results found" when search returns empty results', async () => {
        // Set up mock to simulate the actual behavior:
        // First call returns no data, second call returns empty results
        const mockRefetch = jest.fn()
        mockUseSearchTickets
            .mockReturnValueOnce({
                isLoading: false,
                error: null,
                isRefetching: false,
                isRefetchError: false,
                data: null,
                refetch: mockRefetch,
            } as unknown as ReturnType<typeof useSearchTickets>)
            .mockReturnValue({
                isLoading: false,
                error: null,
                isRefetching: false,
                isRefetchError: false,
                data: { data: { data: [] } },
                refetch: mockRefetch,
            } as unknown as ReturnType<typeof useSearchTickets>)

        const { rerender } = renderComponent()

        const searchInput = screen.getByPlaceholderText(
            'Search by ticket id or email subject',
        )

        await userEvent.type(searchInput, 'nonexistent')

        // Force re-render to pick up the new mock value
        rerender(<TicketSearchDropdownSelectView onSelect={mockOnSelect} />)

        await waitFor(
            () => {
                expect(screen.getByText('No results found')).toBeInTheDocument()
            },
            { timeout: 2000 },
        )
    })

    it('should handle ticket selection and fetch full ticket', async () => {
        // Start with search results available
        mockUseSearchTickets.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: { data: { data: mockTicketSearchResults } },
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useSearchTickets>)

        mockGetTicket.mockResolvedValue({ data: mockFullTicket } as any)

        renderComponent()

        const searchInput = screen.getByPlaceholderText(
            'Search by ticket id or email subject',
        )

        await act(async () => {
            await userEvent.type(searchInput, 'test')
        })

        await waitFor(
            () => {
                expect(
                    screen.getByText('Test Ticket 1 - John Doe - 123'),
                ).toBeInTheDocument()
            },
            { timeout: 2000 },
        )

        await act(async () => {
            await userEvent.click(
                screen.getByText('Test Ticket 1 - John Doe - 123'),
            )
        })

        await waitFor(() => {
            expect(mockGetTicket).toHaveBeenCalledWith(123)
            expect(mockOnSelect).toHaveBeenCalledWith(mockFullTicket)
        })

        // Should update search term to selected ticket subject
        expect(searchInput).toHaveValue('Test Ticket 1')
    })

    it('should handle keyboard navigation', async () => {
        // Start with search results available
        mockUseSearchTickets.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: { data: { data: mockTicketSearchResults } },
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useSearchTickets>)

        mockGetTicket.mockResolvedValue({ data: mockFullTicket } as any)

        renderComponent()

        const searchInput = screen.getByPlaceholderText(
            'Search by ticket id or email subject',
        )

        await act(async () => {
            await userEvent.type(searchInput, 'test')
        })

        await waitFor(
            () => {
                expect(
                    screen.getByText('Test Ticket 1 - John Doe - 123'),
                ).toBeInTheDocument()
            },
            { timeout: 2000 },
        )

        // Test arrow down navigation
        await act(async () => {
            await userEvent.keyboard('{ArrowDown}')
        })

        // First item should be focused - check the actual dropdown item div
        const firstItem = screen.getByText('Test Ticket 1 - John Doe - 123')
        expect(firstItem).toHaveClass('focusedDropdownItem')

        // Test Enter key selection
        await act(async () => {
            await userEvent.keyboard('{Enter}')
        })

        await waitFor(() => {
            expect(mockGetTicket).toHaveBeenCalledWith(123)
            expect(mockOnSelect).toHaveBeenCalledWith(mockFullTicket)
        })
    })

    it('should handle search debouncing', async () => {
        const mockRefetch = jest.fn()
        mockUseSearchTickets.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: null,
            refetch: mockRefetch,
        } as unknown as ReturnType<typeof useSearchTickets>)

        renderComponent()

        const searchInput = screen.getByPlaceholderText(
            'Search by ticket id or email subject',
        )

        await act(async () => {
            await userEvent.type(searchInput, 'test')
        })

        // Should not call refetch immediately
        expect(mockRefetch).not.toHaveBeenCalled()

        // Should call refetch after debounce delay
        await waitFor(
            () => {
                expect(mockRefetch).toHaveBeenCalled()
            },
            { timeout: 2000 },
        )
    })

    it('should handle ticket selection error gracefully', async () => {
        // Start with search results available
        mockUseSearchTickets.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: { data: { data: mockTicketSearchResults } },
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useSearchTickets>)

        mockGetTicket.mockRejectedValue(new Error('API Error'))

        renderComponent()

        const searchInput = screen.getByPlaceholderText(
            'Search by ticket id or email subject',
        )

        await act(async () => {
            await userEvent.type(searchInput, 'test')
        })

        await waitFor(
            () => {
                expect(
                    screen.getByText('Test Ticket 1 - John Doe - 123'),
                ).toBeInTheDocument()
            },
            { timeout: 2000 },
        )

        await act(async () => {
            await userEvent.click(
                screen.getByText('Test Ticket 1 - John Doe - 123'),
            )
        })

        await waitFor(() => {
            expect(mockGetTicket).toHaveBeenCalledWith(123)
        })

        // Should not call onSelect if there's an error
        expect(mockOnSelect).not.toHaveBeenCalled()
    })

    it('should handle tickets without customer name correctly', async () => {
        const ticketWithoutCustomerName = [
            {
                id: 125,
                subject: 'Test Ticket 3',
                customer: {
                    id: 458,
                    email: 'nousername@example.com',
                },
            },
        ]

        mockUseSearchTickets.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: { data: { data: ticketWithoutCustomerName } },
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useSearchTickets>)

        renderComponent()

        const searchInput = screen.getByPlaceholderText(
            'Search by ticket id or email subject',
        )

        await act(async () => {
            await userEvent.type(searchInput, 'test')
        })

        await waitFor(
            () => {
                expect(
                    screen.getByText(
                        'Test Ticket 3 - nousername@example.com - 125',
                    ),
                ).toBeInTheDocument()
            },
            { timeout: 2000 },
        )
    })

    it('should handle tickets without customer at all', async () => {
        const ticketWithoutCustomer = [
            {
                id: 126,
                subject: 'Test Ticket 4',
                customer: undefined,
            },
        ]

        mockUseSearchTickets.mockReturnValue({
            isLoading: false,
            error: null,
            isRefetching: false,
            isRefetchError: false,
            data: { data: { data: ticketWithoutCustomer } },
            refetch: jest.fn(),
        } as unknown as ReturnType<typeof useSearchTickets>)

        renderComponent()

        const searchInput = screen.getByPlaceholderText(
            'Search by ticket id or email subject',
        )

        await act(async () => {
            await userEvent.type(searchInput, 'test')
        })

        await waitFor(
            () => {
                expect(
                    screen.getByText('Test Ticket 4 - 126'),
                ).toBeInTheDocument()
            },
            { timeout: 2000 },
        )
    })

    it('should be disabled when isDisabled prop is true', () => {
        renderComponent({ isDisabled: true })

        const searchInput = screen.getByPlaceholderText(
            'Search by ticket id or email subject',
        )
        expect(searchInput).toBeDisabled()
    })

    it('should apply custom className', () => {
        renderComponent({ className: 'custom-class' })

        const container = screen
            .getByPlaceholderText('Search by ticket id or email subject')
            .closest('.container')
        expect(container).toHaveClass('custom-class')
    })
})
