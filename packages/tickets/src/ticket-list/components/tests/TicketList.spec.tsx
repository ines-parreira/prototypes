import * as React from 'react'

import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { VirtuosoMockContext } from 'react-virtuoso'

import {
    mockGetCurrentUserHandler,
    mockGetViewHandler,
    mockListViewItemsHandler,
    mockListViewItemsUpdatesHandler,
    mockTicket,
} from '@gorgias/helpdesk-mocks'

import { render, testAppQueryClient } from '../../../tests/render.utils'
import { TicketList } from '../TicketList'

const mockViewTickets = vi.fn()
const mockGetTicketActivity = vi.fn(() => ({
    viewing: [] as Array<{ id: number; name?: string; email?: string }>,
}))

vi.mock('@gorgias/realtime-ably', () => ({
    useAgentActivity: () => ({
        viewTickets: mockViewTickets,
        getTicketActivity: mockGetTicketActivity,
    }),
}))

vi.mock('@repo/feature-flags', () => ({
    useFlag: vi.fn().mockReturnValue(false),
    FeatureFlagKey: {},
}))

const viewId = 123
const mockTicket1 = mockTicket({ id: 1, subject: 'First Ticket' })
const mockTicket2 = mockTicket({ id: 2, subject: 'Second Ticket' })
const mockTicket3 = mockTicket({ id: 3, subject: 'Third Ticket' })
const nextItemsUrl = `/api/views/${viewId}/items/?cursor=page-2`

const mockListViewItems = mockListViewItemsHandler(async () =>
    HttpResponse.json({
        data: [mockTicket1, mockTicket2],
        meta: {
            current_cursor: null,
            next_items: null, // No next page
            prev_items: null,
        },
        object: 'list',
        uri: `/api/views/${viewId}/items/`,
    } as any),
)

const mockListViewItemsUpdatesNoOp = mockListViewItemsUpdatesHandler(async () =>
    HttpResponse.json({
        data: [],
        meta: { next_cursor: null, prev_cursor: null },
    }),
)

const mockCurrentUser = mockGetCurrentUserHandler()
const mockGetView = mockGetViewHandler()

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    testAppQueryClient.clear()
    vi.clearAllMocks()
    mockGetTicketActivity.mockReturnValue({ viewing: [] })
    server.use(
        mockListViewItems.handler,
        mockListViewItemsUpdatesNoOp.handler,
        mockCurrentUser.handler,
        mockGetView.handler,
    )
})

function renderWithVirtuoso(component: React.ReactElement) {
    return render(
        <VirtuosoMockContext.Provider
            value={{ viewportHeight: 600, itemHeight: 100 }}
        >
            {component}
        </VirtuosoMockContext.Provider>,
    )
}

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('TicketList', () => {
    it('should render loading state', () => {
        renderWithVirtuoso(<TicketList viewId={viewId} />)

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('should render tickets with subjects', async () => {
        renderWithVirtuoso(<TicketList viewId={viewId} />)

        await waitFor(() => {
            expect(screen.getByText('First Ticket')).toBeInTheDocument()
        })

        const allFirstTickets = screen.getAllByText('First Ticket')
        const allSecondTickets = screen.getAllByText('Second Ticket')

        expect(allFirstTickets).toHaveLength(1)
        expect(allSecondTickets).toHaveLength(1)
    })

    it('should render error state', async () => {
        const consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        server.use(
            mockListViewItemsHandler(async () =>
                HttpResponse.json({ error: 'Not found' } as any, {
                    status: 404,
                }),
            ).handler,
        )

        renderWithVirtuoso(<TicketList viewId={viewId} />)

        await waitFor(() => {
            expect(
                screen.getByText('Error loading tickets'),
            ).toBeInTheDocument()
        })

        consoleErrorSpy.mockRestore()
    })

    it('should render empty state', async () => {
        server.use(
            mockListViewItemsHandler(async () =>
                HttpResponse.json({
                    data: [],
                    meta: {
                        current_cursor: null,
                        next_items: null,
                        prev_items: null,
                    },
                    object: 'list',
                    uri: `/api/views/${viewId}/items/`,
                } as any),
            ).handler,
        )

        renderWithVirtuoso(<TicketList viewId={viewId} />)

        await waitFor(() => {
            expect(screen.getByText('No tickets found')).toBeInTheDocument()
        })
    })

    it('should show another agent viewing indicator when other agents are viewing', async () => {
        mockGetTicketActivity.mockReturnValue({
            viewing: [{ id: 99, name: 'Viewing Agent' }],
        })

        renderWithVirtuoso(<TicketList viewId={viewId} currentUserId={1} />)

        await waitFor(() => {
            expect(screen.getAllByText('VA')).toHaveLength(2)
        })
    })

    it('fetches the next page when the end of the list is reached', async () => {
        server.use(
            mockListViewItemsHandler(async ({ request }) => {
                const cursor = new URL(request.url).searchParams.get('cursor')
                if (cursor === 'page-2') {
                    return HttpResponse.json({
                        data: [mockTicket3],
                        meta: {
                            current_cursor: 'page-2',
                            next_items: null,
                            prev_items: null,
                        },
                        object: 'list',
                        uri: `/api/views/${viewId}/items/`,
                    } as any)
                }
                return HttpResponse.json({
                    data: [mockTicket1, mockTicket2],
                    meta: {
                        current_cursor: null,
                        next_items: nextItemsUrl,
                        prev_items: null,
                    },
                    object: 'list',
                    uri: `/api/views/${viewId}/items/`,
                } as any)
            }).handler,
        )

        renderWithVirtuoso(<TicketList viewId={viewId} />)

        await waitFor(() => {
            expect(screen.getByText('Third Ticket')).toBeInTheDocument()
        })
    })

    it('shows footer loading skeletons while fetching the next page', async () => {
        let resolvePage2!: () => void
        const page2Promise = new Promise<void>((resolve) => {
            resolvePage2 = resolve
        })

        server.use(
            mockListViewItemsHandler(async ({ request }) => {
                const cursor = new URL(request.url).searchParams.get('cursor')
                if (cursor === 'page-2') {
                    await page2Promise
                    return HttpResponse.json({
                        data: [mockTicket3],
                        meta: {
                            current_cursor: 'page-2',
                            next_items: null,
                            prev_items: null,
                        },
                        object: 'list',
                        uri: `/api/views/${viewId}/items/`,
                    } as any)
                }
                return HttpResponse.json({
                    data: [mockTicket1, mockTicket2],
                    meta: {
                        current_cursor: null,
                        next_items: nextItemsUrl,
                        prev_items: null,
                    },
                    object: 'list',
                    uri: `/api/views/${viewId}/items/`,
                } as any)
            }).handler,
        )

        renderWithVirtuoso(<TicketList viewId={viewId} />)

        await waitFor(() => {
            expect(screen.getByText('First Ticket')).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(
                0,
            )
        })

        resolvePage2()

        await waitFor(() => {
            expect(screen.getByText('Third Ticket')).toBeInTheDocument()
        })
    })
})
