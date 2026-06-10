vi.mock('@repo/feature-flags', async () => ({
    ...(await vi.importActual('@repo/feature-flags')),
    useFlag: vi.fn().mockReturnValue(false),
}))

import { useSearchRankScenario } from '@repo/logging'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

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

import { render } from '../../../../../tests/render.utils'
import { server } from '../../../../../tests/server'
import { SearchAndPreviewCustomersPanel } from '../SearchAndPreviewCustomersPanel'

const mockOnClose = vi.fn()
const mockOnSetCustomer = vi.fn()
const mockOnMergeCustomer = vi.fn()
const mockRegisterResultsRequest = vi.fn()
const mockRegisterResultsResponse = vi.fn()
const mockRegisterResultSelection = vi.fn()
const mockEndScenario = vi.fn()

vi.mock('@repo/logging', async () => ({
    ...(await vi.importActual('@repo/logging')),
    useSearchRankScenario: vi.fn(),
}))

const mockUseSearchRankScenario = vi.mocked(useSearchRankScenario)

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

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    vi.clearAllMocks()
    window.GORGIAS_STATE = {
        currentAccount: {
            domain: 'acme',
        },
        currentUser: {
            id: 123,
        },
    } as Window['GORGIAS_STATE']
    mockUseSearchRankScenario.mockReturnValue({
        isRunning: false,
        registerResultsRequest: mockRegisterResultsRequest,
        registerResultsResponse: mockRegisterResultsResponse,
        registerResultSelection: mockRegisterResultSelection,
        endScenario: mockEndScenario,
    })
    server.use(
        mockSearchCustomers.handler,
        mockGetCurrentUser.handler,
        mockListCustomFields.handler,
        mockListCustomerFieldsValues.handler,
        mockListIntegrationsHandler().handler,
        mockListPhoneNumbersHandler().handler,
    )
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
        const waitForSearchRequest = mockSearchCustomers.waitForRequest(server)
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

        await waitForSearchRequest()

        await waitFor(() => {
            expect(
                screen.queryByText('Searching customers...'),
            ).not.toBeInTheDocument()
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

    it('should tag the current customer in search results and hide merge/switch actions for that row', async () => {
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
            <SearchAndPreviewCustomersPanel
                {...defaultProps}
                currentCustomerId={1}
            />,
        )

        const searchInput = screen.getByPlaceholderText(
            'Search by name, email or order no.',
        )

        await user.type(searchInput, 'John')

        await waitFor(() => {
            expect(screen.getByText('2 results')).toBeInTheDocument()
        })

        expect(screen.getByText('Current customer')).toBeInTheDocument()

        const johnRow = screen
            .getByText(/John/)
            .closest('article, div, section')
        expect(johnRow).not.toBeNull()
        expect(screen.getAllByRole('button', { name: 'Merge' })).toHaveLength(1)
        expect(
            screen.getAllByRole('button', { name: 'Switch customer' }),
        ).toHaveLength(1)
    })

    it('should tag the previewed (duplicate) customer in search results', async () => {
        server.use(
            mockSearchCustomersHandler(async () =>
                HttpResponse.json(
                    mockSearchCustomersResponse({
                        data: mockSearchResults,
                    }),
                ),
            ).handler,
        )

        const previewedCustomer = mockCustomer({
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
        })

        const { user } = render(
            <SearchAndPreviewCustomersPanel
                {...defaultProps}
                previewedCustomer={previewedCustomer}
            />,
        )

        const searchInput = screen.getByPlaceholderText(
            'Search by name, email or order no.',
        )

        await user.type(searchInput, 'Jane')

        await waitFor(() => {
            expect(screen.getByText('2 results')).toBeInTheDocument()
        })

        expect(screen.getByText('Potential duplicate')).toBeInTheDocument()
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

    it('should display an error message when search fails', async () => {
        server.use(
            mockSearchCustomersHandler(async () =>
                HttpResponse.json(
                    mockSearchCustomersResponse({
                        data: [],
                    }),
                    { status: 500 },
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

        expect(
            await screen.findByText(
                'Failed to search customers. Please try again.',
            ),
        ).toBeInTheDocument()
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

    it('should open the preview screen and set the selected customer from preview actions', async () => {
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

        expect(await screen.findByText('1 result')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'View details' }))

        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Back to previous screen' }),
        ).toBeInTheDocument()

        await user.click(
            screen.getByRole('button', { name: 'Switch customer' }),
        )

        expect(mockOnSetCustomer).toHaveBeenCalledWith(
            mockSearchResults[0].entity,
        )
        expect(mockOnSetCustomer).toHaveBeenCalledTimes(1)
    })

    it('should register result selection when previewing a searched customer', async () => {
        server.use(
            mockSearchCustomersHandler(async () =>
                HttpResponse.json(
                    mockSearchCustomersResponse({
                        data: [mockSearchResults[1]],
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

        await user.type(searchInput, 'Jane')

        expect(await screen.findByText('1 result')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'View details' }))

        expect(mockRegisterResultSelection).toHaveBeenCalledWith({
            id: 2,
            index: 0,
            type: 'customer',
        })
    })

    it('should reset search term and preview mode after the panel closes and reopens', async () => {
        server.use(
            mockSearchCustomersHandler(async () =>
                HttpResponse.json(
                    mockSearchCustomersResponse({
                        data: [mockSearchResults[0]],
                    }),
                ),
            ).handler,
        )

        const { user, rerender } = render(
            <SearchAndPreviewCustomersPanel {...defaultProps} />,
        )

        const searchInput = screen.getByPlaceholderText(
            'Search by name, email or order no.',
        )
        await user.type(searchInput, 'John')

        expect(await screen.findByText('1 result')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'View details' }))
        expect(
            screen.getByRole('button', { name: 'Back to previous screen' }),
        ).toBeInTheDocument()

        rerender(
            <SearchAndPreviewCustomersPanel {...defaultProps} isOpen={false} />,
        )

        rerender(
            <SearchAndPreviewCustomersPanel {...defaultProps} isOpen={true} />,
        )

        await waitFor(() => {
            expect(
                screen.queryByRole('button', {
                    name: 'Back to previous screen',
                }),
            ).not.toBeInTheDocument()
        })

        expect(
            screen.getByPlaceholderText('Search by name, email or order no.'),
        ).toHaveValue('')
    })

    it('should hide previewed customer when user starts typing in search', async () => {
        const previewedCustomer = mockCustomer({
            id: 999,
            name: 'Preview Customer',
            email: 'preview@example.com',
            channels: [],
        })
        const mockSearchCustomersWithoutResults = mockSearchCustomersHandler(
            async () =>
                HttpResponse.json(
                    mockSearchCustomersResponse({
                        data: [],
                    }),
                ),
        )
        const waitForSearchRequest =
            mockSearchCustomersWithoutResults.waitForRequest(server)

        server.use(mockSearchCustomersWithoutResults.handler)

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

        await waitForSearchRequest()

        await waitFor(() => {
            expect(screen.getByText('No customers found.')).toBeInTheDocument()
        })
    })
})
