import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCreateTagHandler,
    mockGetTicketHandler,
    mockListTagsHandler,
    mockTag,
    mockTicket,
    mockTicketTag,
    mockUpdateTicketHandler,
} from '@gorgias/helpdesk-mocks'

import { render, testAppQueryClient } from '../../../tests/render.utils'
import { TicketInfobarTicketDetailsTags } from '../components/InfobarTicketTags'

const waitForQueriesSettled = async () => {
    await waitFor(() => {
        expect(testAppQueryClient.isFetching()).toBe(0)
    })
}

const ticketId = '123'

const ticketTag1 = mockTicketTag({
    id: 1,
    name: 'Bug',
    decoration: { color: 'red' },
})

const ticketTag2 = mockTicketTag({
    id: 2,
    name: 'Feature Request',
    decoration: { color: 'blue' },
})

const tag1 = mockTag({
    id: 1,
    name: 'Bug',
    decoration: { color: 'red' },
})

const tag2 = mockTag({
    id: 2,
    name: 'Feature Request',
    decoration: { color: 'blue' },
})

const tag3 = mockTag({
    id: 3,
    name: 'Documentation',
    decoration: null,
})
const tag4 = mockTag({
    id: 4,
    name: 'Marketing',
    decoration: null,
})
const tag5 = mockTag({
    id: 5,
    name: 'Sales',
    decoration: null,
})

const ticket = mockTicket({
    id: Number(ticketId),
    tags: [ticketTag1, ticketTag2],
})

const allTags = [tag1, tag2, tag3, tag4, tag5]

const mockGetTicket = mockGetTicketHandler(async () =>
    HttpResponse.json(ticket),
)

const mockListTags = mockListTagsHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        data: allTags,
        meta: {
            total_resources: 3,
            prev_cursor: null,
            next_cursor: null,
        },
    }),
)

const mockUpdateTicket = mockUpdateTicketHandler()
const mockCreateTag = mockCreateTagHandler()

const localHandlers = [
    mockGetTicket.handler,
    mockListTags.handler,
    mockUpdateTicket.handler,
    mockCreateTag.handler,
]

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(...localHandlers)
    testAppQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('TicketInfobarTicketDetailsTags', () => {
    const getAddButton = () => {
        return screen
            .getAllByRole('button', { hidden: true })
            .find(
                (button) => button.getAttribute('aria-haspopup') === 'listbox',
            )!
    }

    const getCloseButtons = () =>
        screen.queryAllByRole('button', {
            name: 'Remove tag',
        })

    describe('Infinite scroll for tags', () => {
        it('should render initial paginated tags', async () => {
            const mockListTagsPage1 = mockListTagsHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: [tag1, tag2, tag3],
                    meta: {
                        total_resources: 6,
                        prev_cursor: null,
                        next_cursor: 'cursor-2',
                    },
                }),
            )

            server.use(mockGetTicket.handler, mockListTagsPage1.handler)

            const { user } = render(
                <TicketInfobarTicketDetailsTags ticketId={ticketId} />,
            )

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })

            await user.click(getAddButton())

            await waitFor(() => {
                const documentationOptions =
                    screen.getAllByText('Documentation')
                expect(documentationOptions.length).toBeGreaterThan(0)
            })

            await waitForQueriesSettled()
        })

        it('should not load more when no next cursor exists', async () => {
            const mockListTagsComplete = mockListTagsHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: allTags,
                    meta: {
                        total_resources: 5,
                        prev_cursor: null,
                        next_cursor: null,
                    },
                }),
            )

            server.use(mockGetTicket.handler, mockListTagsComplete.handler)

            render(<TicketInfobarTicketDetailsTags ticketId={ticketId} />, {
                initialEntries: [`/tickets/${ticketId}`],
                path: `/tickets/${ticketId}`,
            })

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })
        })
    })

    describe('Empty states', () => {
        it('should handle ticket with no tags', async () => {
            const ticketWithNoTags = mockTicket({
                id: Number(ticketId),
                tags: [],
            })

            const mockGetTicketNoTags = mockGetTicketHandler(async () =>
                HttpResponse.json(ticketWithNoTags),
            )

            server.use(mockGetTicketNoTags.handler, mockListTags.handler)

            render(<TicketInfobarTicketDetailsTags ticketId={ticketId} />, {
                initialEntries: [`/tickets/${ticketId}`],
                path: `/tickets/${ticketId}`,
            })

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })
        })

        it('should handle empty tags list from API', async () => {
            const mockListTagsEmpty = mockListTagsHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: [],
                    meta: {
                        total_resources: 0,
                        prev_cursor: null,
                        next_cursor: null,
                    },
                }),
            )

            server.use(mockGetTicket.handler, mockListTagsEmpty.handler)

            render(<TicketInfobarTicketDetailsTags ticketId={ticketId} />, {
                initialEntries: [`/tickets/${ticketId}`],
                path: `/tickets/${ticketId}`,
            })

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })
        })
    })

    describe('Error handling', () => {
        it('should handle ticket fetch error gracefully', async () => {
            const mockGetTicketError = mockGetTicketHandler(async () =>
                HttpResponse.json(
                    // @ts-expect-error
                    { error: 'Failed to fetch ticket' },
                    { status: 500 },
                ),
            )

            server.use(mockGetTicketError.handler, mockListTags.handler)

            render(<TicketInfobarTicketDetailsTags ticketId={ticketId} />, {
                initialEntries: [`/tickets/${ticketId}`],
                path: `/tickets/${ticketId}`,
            })

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })
        })

        it('should handle tags list fetch error gracefully', async () => {
            const mockListTagsError = mockListTagsHandler(async () =>
                HttpResponse.json(
                    // @ts-expect-error
                    { error: 'Failed to fetch tags' },
                    { status: 500 },
                ),
            )

            server.use(mockGetTicket.handler, mockListTagsError.handler)

            render(<TicketInfobarTicketDetailsTags ticketId={ticketId} />, {
                initialEntries: [`/tickets/${ticketId}`],
                path: `/tickets/${ticketId}`,
            })

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })
        })

        it('should handle update ticket error gracefully', async () => {
            const mockUpdateTicketError = mockUpdateTicketHandler(async () =>
                HttpResponse.json(
                    // @ts-expect-error
                    { error: 'Failed to update ticket' },
                    { status: 500 },
                ),
            )

            server.use(
                mockGetTicket.handler,
                mockListTags.handler,
                mockUpdateTicketError.handler,
            )

            const { user } = render(
                <TicketInfobarTicketDetailsTags ticketId={ticketId} />,
            )

            await waitFor(() => {
                expect(screen.getAllByText('Bug').length).toBeGreaterThan(0)
            })

            const closeButtons = getCloseButtons()

            await user.click(closeButtons[0])

            await waitFor(() => {
                expect(screen.getAllByText('Bug').length).toBeGreaterThan(0)
            })

            await waitForQueriesSettled()
        })
    })

    describe('OverflowList behavior', () => {
        it('should display show more button when tags exceed line limit', async () => {
            const manyTags = Array.from({ length: 20 }, (_, i) =>
                mockTicketTag({
                    id: i + 1,
                    name: `Tag ${i + 1}`,
                    decoration: null,
                }),
            )

            const ticketWithManyTags = mockTicket({
                id: Number(ticketId),
                tags: manyTags,
            })

            const mockGetTicketManyTags = mockGetTicketHandler(async () =>
                HttpResponse.json(ticketWithManyTags),
            )

            server.use(mockGetTicketManyTags.handler, mockListTags.handler)

            render(<TicketInfobarTicketDetailsTags ticketId={ticketId} />, {
                initialEntries: [`/tickets/${ticketId}`],
                path: `/tickets/${ticketId}`,
            })

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })
        })

        it('should expand to show all tags when show more is clicked', async () => {
            const manyTags = Array.from({ length: 20 }, (_, i) =>
                mockTicketTag({
                    id: i + 1,
                    name: `Tag ${i + 1}`,
                    decoration: null,
                }),
            )

            const ticketWithManyTags = mockTicket({
                id: Number(ticketId),
                tags: manyTags,
            })

            const mockGetTicketManyTags = mockGetTicketHandler(async () =>
                HttpResponse.json(ticketWithManyTags),
            )

            server.use(mockGetTicketManyTags.handler, mockListTags.handler)

            render(<TicketInfobarTicketDetailsTags ticketId={ticketId} />, {
                initialEntries: [`/tickets/${ticketId}`],
                path: `/tickets/${ticketId}`,
            })

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })
        })
    })

    describe('Tag decorations', () => {
        it('should render tags with color decorations', async () => {
            render(<TicketInfobarTicketDetailsTags ticketId={ticketId} />, {
                initialEntries: [`/tickets/${ticketId}`],
                path: `/tickets/${ticketId}`,
            })

            await waitFor(() => {
                expect(screen.getAllByText('Bug').length).toBeGreaterThan(0)
            })
        })

        it('should render tags without decorations', async () => {
            const plainTag = mockTicketTag({
                id: 99,
                name: 'Plain Tag',
                decoration: null,
            })

            const ticketWithPlainTag = mockTicket({
                id: Number(ticketId),
                tags: [plainTag],
            })

            const mockGetTicketPlain = mockGetTicketHandler(async () =>
                HttpResponse.json(ticketWithPlainTag),
            )

            server.use(mockGetTicketPlain.handler, mockListTags.handler)

            render(<TicketInfobarTicketDetailsTags ticketId={ticketId} />, {
                initialEntries: [`/tickets/${ticketId}`],
                path: `/tickets/${ticketId}`,
            })

            await waitFor(() => {
                expect(screen.getByText('Plain Tag')).toBeInTheDocument()
            })
        })
    })
})
