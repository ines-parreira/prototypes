import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCustomer,
    mockGetCurrentUserHandler,
    mockListCustomerCustomFieldsValuesHandler,
    mockListCustomerCustomFieldsValuesResponse,
    mockListCustomFieldsHandler,
    mockListCustomFieldsResponse,
    mockListIntegrationsHandler,
    mockListPhoneNumbersHandler,
    mockSearchCustomersHandler,
    mockSearchCustomersResponse,
    mockUser,
} from '@gorgias/helpdesk-mocks'
import type { TicketCustomerChannel } from '@gorgias/helpdesk-queries'
import type { CustomerHighlightDataItem } from '@gorgias/helpdesk-types'

import { render, testAppQueryClient } from '../../../../../tests/render.utils'
import { SearchAndPreviewCustomersPanel } from '../SearchAndPreviewCustomersPanel'

const mockOnClose = vi.fn()
const mockOnSetCustomer = vi.fn()
const mockOnMergeCustomer = vi.fn()

const mockSearchResults: CustomerHighlightDataItem[] = [
    {
        entity: mockCustomer({
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            channels: [
                {
                    id: 1,
                    type: 'email',
                    address: 'john@example.com',
                } as TicketCustomerChannel,
            ],
        }),
        highlights: {
            name: ['<em>John</em> Doe'],
            email: ['<em>john</em>@example.com'],
        },
    },
    {
        entity: mockCustomer({
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            channels: [
                {
                    id: 2,
                    type: 'email',
                    address: 'jane@example.com',
                } as TicketCustomerChannel,
            ],
        }),
        highlights: {
            name: ['<em>Jane</em> Smith'],
        },
    },
] as CustomerHighlightDataItem[]

const mockSearchCustomers = mockSearchCustomersHandler()
const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
    HttpResponse.json(mockUser()),
)
const mockListCustomFields = mockListCustomFieldsHandler(async () =>
    HttpResponse.json(mockListCustomFieldsResponse({ data: [] })),
)
const mockListCustomerFieldsValues = mockListCustomerCustomFieldsValuesHandler(
    async () =>
        HttpResponse.json(
            mockListCustomerCustomFieldsValuesResponse({ data: [] }),
        ),
)

const server = setupServer(
    mockSearchCustomers.handler,
    mockGetCurrentUser.handler,
    mockListCustomFields.handler,
    mockListCustomerFieldsValues.handler,
    mockListIntegrationsHandler().handler,
    mockListPhoneNumbersHandler().handler,
)

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    vi.clearAllMocks()
    testAppQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSetCustomer: mockOnSetCustomer,
    onMergeCustomer: mockOnMergeCustomer,
}

describe('SearchAndPreviewCustomersPanel', () => {
    it('should render the search input', () => {
        render(<SearchAndPreviewCustomersPanel {...defaultProps} />)

        expect(
            screen.getByPlaceholderText('Search by name, email or order no.'),
        ).toBeInTheDocument()
    })

    it('should display empty state message when no search is performed', () => {
        render(<SearchAndPreviewCustomersPanel {...defaultProps} />)

        expect(
            screen.getByText(
                'Search to find customers to merge or reassign to this ticket.',
            ),
        ).toBeInTheDocument()
    })

    it('should display loading state when searching', async () => {
        const { user } = render(
            <SearchAndPreviewCustomersPanel {...defaultProps} />,
        )

        const searchInput = screen.getByPlaceholderText(
            'Search by name, email or order no.',
        )

        await user.type(searchInput, 'John')

        await waitFor(() => {
            expect(
                screen.getByText('Searching customers...'),
            ).toBeInTheDocument()
        })
    })

    it('should display search results with count', async () => {
        server.use(
            mockSearchCustomersHandler(async () =>
                HttpResponse.json(
                    mockSearchCustomersResponse({
                        data: mockSearchResults,
                    }),
                ),
            ).handler,
        )

        const { user } = render(
            <SearchAndPreviewCustomersPanel {...defaultProps} />,
        )

        const searchInput = screen.getByPlaceholderText(
            'Search by name, email or order no.',
        )

        await user.type(searchInput, 'John')

        await waitFor(() => {
            expect(screen.getByText('2 results')).toBeInTheDocument()
        })

        expect(screen.getByText(/John/)).toBeInTheDocument()
        expect(screen.getByText(/Jane/)).toBeInTheDocument()
    })

    it('should display singular result count for one result', async () => {
        server.use(
            mockSearchCustomersHandler(async () =>
                HttpResponse.json(
                    mockSearchCustomersResponse({
                        data: [mockSearchResults[0]],
                    }),
                ),
            ).handler,
        )

        const { user } = render(
            <SearchAndPreviewCustomersPanel {...defaultProps} />,
        )

        const searchInput = screen.getByPlaceholderText(
            'Search by name, email or order no.',
        )

        await user.type(searchInput, 'John')

        await waitFor(() => {
            expect(screen.getByText('1 result')).toBeInTheDocument()
        })
    })

    it('should display no results message when search returns empty', async () => {
        server.use(
            mockSearchCustomersHandler(async () =>
                HttpResponse.json(
                    mockSearchCustomersResponse({
                        data: [],
                    }),
                ),
            ).handler,
        )

        const { user } = render(
            <SearchAndPreviewCustomersPanel {...defaultProps} />,
        )

        const searchInput = screen.getByPlaceholderText(
            'Search by name, email or order no.',
        )

        await user.type(searchInput, 'NonExistent')

        await waitFor(
            () => {
                expect(
                    screen.queryByText('Searching customers...'),
                ).not.toBeInTheDocument()
                expect(
                    screen.getByText('No customers found.'),
                ).toBeInTheDocument()
            },
            { timeout: 3000 },
        )
    })

    it('should display previewed customer when provided', () => {
        const previewedCustomer = mockCustomer({
            id: 999,
            name: 'Preview Customer',
            email: 'preview@example.com',
            channels: [
                {
                    id: 1,
                    type: 'email',
                    address: 'preview@example.com',
                } as TicketCustomerChannel,
            ],
        })

        render(
            <SearchAndPreviewCustomersPanel
                {...defaultProps}
                previewedCustomer={previewedCustomer}
            />,
        )

        expect(
            screen.getByText(
                'Another profile looks similar to this one. Click to view profile or search for other customers.',
            ),
        ).toBeInTheDocument()

        expect(screen.getByText('Preview Customer')).toBeInTheDocument()
    })

    it('should hide previewed customer when user starts typing in search', async () => {
        const previewedCustomer = mockCustomer({
            id: 999,
            name: 'Preview Customer',
            email: 'preview@example.com',
            channels: [],
        })

        server.use(
            mockSearchCustomersHandler(async () =>
                HttpResponse.json(
                    mockSearchCustomersResponse({
                        data: [],
                    }),
                ),
            ).handler,
        )

        const { user } = render(
            <SearchAndPreviewCustomersPanel
                {...defaultProps}
                previewedCustomer={previewedCustomer}
            />,
        )

        expect(screen.getByText('Preview Customer')).toBeInTheDocument()

        const searchInput = screen.getByPlaceholderText(
            'Search by name, email or order no.',
        )

        await user.type(searchInput, 'Test')

        await waitFor(() => {
            expect(
                screen.queryByText('Preview Customer'),
            ).not.toBeInTheDocument()
        })
    })
})
