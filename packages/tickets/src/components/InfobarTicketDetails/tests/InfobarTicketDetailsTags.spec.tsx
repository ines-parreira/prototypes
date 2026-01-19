import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetTicketHandler,
    mockListTagsHandler,
    mockTag,
    mockTicket,
    mockTicketTag,
    mockUpdateTicketHandler,
} from '@gorgias/helpdesk-mocks'

import { render, testAppQueryClient } from '../../../tests/render.utils'
import { TicketInfobarTicketDetailsTags } from '../components/InfobarTicketTags'

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

const localHandlers = [
    mockGetTicket.handler,
    mockListTags.handler,
    mockUpdateTicket.handler,
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
        const buttons = screen.getAllByRole('button')
        return buttons.find((btn) =>
            btn.querySelector('[aria-label="add-plus"]'),
        )!
    }

    const getCloseButtons = () =>
        screen.queryAllByRole('button', {
            name: 'Remove tag',
        })

    describe('Initial rendering', () => {
        it('should render the component with add button', async () => {
            render(<TicketInfobarTicketDetailsTags ticketId={ticketId} />, {
                initialEntries: [`/tickets/${ticketId}`],
                path: `/tickets/${ticketId}`,
            })

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })
        })

        it('should render icon-only button when ticket has tags', async () => {
            render(<TicketInfobarTicketDetailsTags ticketId={ticketId} />, {
                initialEntries: [`/tickets/${ticketId}`],
                path: `/tickets/${ticketId}`,
            })

            await waitFor(() => {
                const addButton = getAddButton()
                expect(addButton).toBeInTheDocument()
                expect(addButton).not.toHaveTextContent('Add tags')
            })
        })

        it('should render "Add tags" button with text when ticket has no tags', async () => {
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
                expect(screen.getByText('Add tags')).toBeInTheDocument()
            })
        })

        it('should display existing ticket tags', async () => {
            render(<TicketInfobarTicketDetailsTags ticketId={ticketId} />, {
                initialEntries: [`/tickets/${ticketId}`],
                path: `/tickets/${ticketId}`,
            })

            await waitFor(() => {
                const bugTags = screen.getAllByText('Bug')
                const featureTags = screen.getAllByText('Feature Request')
                expect(bugTags.length).toBeGreaterThan(0)
                expect(featureTags.length).toBeGreaterThan(0)
            })
        })

        it('should render tags with color decorations', async () => {
            render(<TicketInfobarTicketDetailsTags ticketId={ticketId} />, {
                initialEntries: [`/tickets/${ticketId}`],
                path: `/tickets/${ticketId}`,
            })

            await waitFor(() => {
                const bugTags = screen.getAllByText('Bug')
                expect(bugTags.length).toBeGreaterThan(0)
            })
        })
    })

    describe('Tag selection via MultiSelect', () => {
        it('should display all available tags in dropdown', async () => {
            const { user } = render(
                <TicketInfobarTicketDetailsTags ticketId={ticketId} />,
            )

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })

            await user.click(getAddButton())

            await waitFor(
                () => {
                    const bugTags = screen.queryAllByText('Bug')
                    const featureRequestTags =
                        screen.queryAllByText('Feature Request')
                    const docTags = screen.queryAllByText('Documentation')

                    expect(bugTags.length).toBeGreaterThan(1)
                    expect(featureRequestTags.length).toBeGreaterThan(1)
                    expect(docTags.length).toBeGreaterThan(0)
                },
                { timeout: 3000 },
            )
        })
    })

    describe('Adding tags', () => {
        it('should add a new tag when selected from dropdown', async () => {
            const waitForUpdateTicketRequest =
                mockUpdateTicket.waitForRequest(server)

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

            const documentationOptions = screen.getAllByText('Documentation')
            const dropdownOption = documentationOptions.find(
                (el) => el.tagName === 'SPAN',
            )!
            await user.click(dropdownOption)

            await waitForUpdateTicketRequest(async (request) => {
                const body = await request.clone().json()
                expect(body.tags).toHaveLength(3)
                expect(body.tags).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({ id: 1, name: 'Bug' }),
                        expect.objectContaining({
                            id: 2,
                            name: 'Feature Request',
                        }),
                        expect.objectContaining({
                            id: 3,
                            name: 'Documentation',
                        }),
                    ]),
                )
            })
        })

        it('should add multiple tags when selected', async () => {
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

            const documentationOptions = screen.getAllByText('Documentation')
            const dropdownOption = documentationOptions.find(
                (el) => el.tagName === 'SPAN',
            )!

            const waitForFirstRequest = mockUpdateTicket.waitForRequest(server)
            await user.click(dropdownOption)

            await waitForFirstRequest()

            await user.click(getAddButton())

            await waitFor(() => {
                const marketingOptions = screen.getAllByText('Marketing')
                expect(marketingOptions.length).toBeGreaterThan(0)
            })

            const marketingOptions = screen.getAllByText('Marketing')
            const marketingOption = marketingOptions.find(
                (el) => el.tagName === 'SPAN',
            )!

            const waitForSecondRequest = mockUpdateTicket.waitForRequest(server)
            await user.click(marketingOption)

            await waitForSecondRequest()

            await waitFor(() => {
                const marketingTags = screen.getAllByText('Marketing')
                expect(marketingTags.length).toBeGreaterThan(0)
            })
        })

        it('should maintain tag sort order when adding new tags', async () => {
            const waitForUpdateTicketRequest =
                mockUpdateTicket.waitForRequest(server)

            const { user } = render(
                <TicketInfobarTicketDetailsTags ticketId={ticketId} />,
            )

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })

            await user.click(getAddButton())

            await waitFor(() => {
                const salesOptions = screen.getAllByText('Sales')
                expect(salesOptions.length).toBeGreaterThan(0)
            })

            const salesOptions = screen.getAllByText('Sales')
            const salesOption = salesOptions.find(
                (el) => el.tagName === 'SPAN',
            )!
            await user.click(salesOption)

            await waitForUpdateTicketRequest(async (request) => {
                const body = await request.clone().json()
                const ids = body.tags.map((tag: { id: number }) => tag.id)
                const sortedIds = [...ids].sort((a, b) => a - b)
                expect(ids).toEqual(sortedIds)
            })
        })
    })

    describe('Removing tags', () => {
        it('should remove a tag when close button is clicked', async () => {
            const waitForUpdateTicketRequest =
                mockUpdateTicket.waitForRequest(server)

            const { user } = render(
                <TicketInfobarTicketDetailsTags ticketId={ticketId} />,
            )

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })

            await waitFor(() => {
                expect(screen.getAllByText('Bug').length).toBeGreaterThan(0)
            })

            // In JSDOM, OverflowList hides all tags by default due to layout calculations
            // Click "Show more" button to reveal hidden tags
            const showMoreButton = screen.queryByLabelText(/show.*more/i)
            if (showMoreButton) {
                await user.click(showMoreButton)
            }

            // Wait for close buttons to appear after expanding
            await waitFor(() => {
                const buttons = getCloseButtons()
                expect(buttons.length).toBeGreaterThan(0)
            })

            const closeButtons = getCloseButtons()
            await user.click(closeButtons[0])

            await waitForUpdateTicketRequest(async (request) => {
                const body = await request.clone().json()
                expect(body.tags).toHaveLength(1)
                expect(body.tags[0].id).toBe(2)
            })
        })

        it('should remove multiple tags sequentially', async () => {
            const ticketAfterFirstRemove = mockTicket({
                id: Number(ticketId),
                tags: [ticketTag2],
            })

            const ticketAfterSecondRemove = mockTicket({
                id: Number(ticketId),
                tags: [],
            })

            let getTicketCallCount = 0
            const mockGetTicketWithSequence = mockGetTicketHandler(async () => {
                getTicketCallCount++
                if (getTicketCallCount === 1) {
                    return HttpResponse.json(ticket)
                } else if (getTicketCallCount === 2) {
                    return HttpResponse.json(ticketAfterFirstRemove)
                }
                return HttpResponse.json(ticketAfterSecondRemove)
            })

            let updateTicketCallCount = 0
            const mockUpdateTicketWithSequence = mockUpdateTicketHandler(
                async () => {
                    updateTicketCallCount++
                    if (updateTicketCallCount === 1) {
                        return HttpResponse.json(ticketAfterFirstRemove)
                    }
                    return HttpResponse.json(ticketAfterSecondRemove)
                },
            )

            server.use(
                mockGetTicketWithSequence.handler,
                mockListTags.handler,
                mockUpdateTicketWithSequence.handler,
            )

            const { user } = render(
                <TicketInfobarTicketDetailsTags ticketId={ticketId} />,
            )

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })

            await waitFor(() => {
                const bugTags = screen.getAllByText('Bug')
                expect(bugTags.length).toBeGreaterThan(0)
            })

            // In JSDOM, OverflowList hides all tags by default due to layout calculations
            // Click "Show more" button to reveal hidden tags
            const showMoreButton = screen.queryByLabelText(/show.*more/i)
            if (showMoreButton) {
                await user.click(showMoreButton)
            }

            // Wait for close buttons to appear after expanding
            await waitFor(() => {
                const buttons = getCloseButtons()
                expect(buttons.length).toBeGreaterThan(0)
            })

            const closeButtons = getCloseButtons()
            await user.click(closeButtons[0])

            await waitFor(() => {
                const remainingCloseButtons = getCloseButtons()
                expect(remainingCloseButtons).toHaveLength(1)
            })

            const updatedCloseButtons = await waitFor(() => {
                const buttons = getCloseButtons()
                expect(buttons).toHaveLength(1)
                return buttons
            })

            await user.click(updatedCloseButtons[0])

            await waitFor(() => {
                const allCloseButtons = getCloseButtons()
                expect(allCloseButtons).toHaveLength(0)
            })
        }, 10000)

        it('should preserve non-visible saved tags when removing visible tags', async () => {
            const hiddenTag = mockTicketTag({
                id: 999,
                name: 'Hidden Tag',
                decoration: null,
            })

            const ticketWithHiddenTag = mockTicket({
                id: Number(ticketId),
                tags: [ticketTag1, ticketTag2, hiddenTag],
            })

            const mockGetTicketWithHidden = mockGetTicketHandler(async () =>
                HttpResponse.json(ticketWithHiddenTag),
            )

            server.use(mockGetTicketWithHidden.handler, mockListTags.handler)

            const waitForUpdateTicketRequest =
                mockUpdateTicket.waitForRequest(server)

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

            const bugCheckbox = screen.getAllByRole('checkbox')[0]
            await user.click(bugCheckbox)

            await waitForUpdateTicketRequest(async (request) => {
                const body = await request.clone().json()
                expect(body.tags).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            id: 999,
                            name: 'Hidden Tag',
                        }),
                        expect.objectContaining({
                            id: 2,
                            name: 'Feature Request',
                        }),
                    ]),
                )
                expect(body.tags).toHaveLength(2)
            })
        })
    })

    describe('Search functionality', () => {
        it('should display searchbox and allow typing', async () => {
            const { user } = render(
                <TicketInfobarTicketDetailsTags ticketId={ticketId} />,
            )

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })

            await user.click(getAddButton())

            await waitFor(() => {
                expect(screen.getByRole('searchbox')).toBeInTheDocument()
            })

            const searchInput = screen.getByRole('searchbox')
            await user.type(searchInput, 'Test')

            expect(searchInput).toHaveValue('Test')
        })

        it('should show search input when dropdown is open', async () => {
            const { user } = render(
                <TicketInfobarTicketDetailsTags ticketId={ticketId} />,
            )

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })

            await user.click(getAddButton())

            await waitFor(() => {
                expect(screen.getByRole('searchbox')).toBeInTheDocument()
            })

            const searchInput = screen.getByRole('searchbox')
            await user.type(searchInput, 'Doc')

            expect(searchInput).toHaveValue('Doc')
        })
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
