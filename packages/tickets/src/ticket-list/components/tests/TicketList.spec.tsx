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
    viewing: [] as Array<{ id: number }>,
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

        expect(screen.getByText('Loading...')).toBeInTheDocument()
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

    it('should highlight active ticket (covers TicketListItem)', async () => {
        renderWithVirtuoso(<TicketList viewId={viewId} activeTicketId={1} />)

        await waitFor(() => {
            expect(screen.getByText('First Ticket')).toBeInTheDocument()
        })

        const activeTicket = screen.getByText('First Ticket').parentElement
        const inactiveTicket = screen.getByText('Second Ticket').parentElement

        expect(activeTicket).toHaveStyle({ background: '#e0e0e0' })
        expect(inactiveTicket).toHaveStyle({ background: 'white' })
    })

    it('should show another agent viewing indicator when other agents are viewing', async () => {
        mockGetTicketActivity.mockReturnValue({ viewing: [{ id: 99 }] })

        renderWithVirtuoso(<TicketList viewId={viewId} currentUserId={1} />)

        await waitFor(() => {
            expect(screen.getAllByText('another agent viewing')).toHaveLength(2)
        })
    })
})
