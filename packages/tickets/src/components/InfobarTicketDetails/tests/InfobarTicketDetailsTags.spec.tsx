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
import type { TicketTag } from '@gorgias/helpdesk-queries'

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

    const waitUntilTagMenuIsOpen = async () => {
        await waitFor(
            () => {
                expect(getAddButton()).toHaveAttribute('aria-expanded', 'true')
            },
            { timeout: 2000 },
        )
    }

    const openTagMenu = async (user: ReturnType<typeof render>['user']) => {
        if (getAddButton().getAttribute('aria-expanded') === 'true') {
            return
        }

        await user.click(getAddButton())

        try {
            await waitUntilTagMenuIsOpen()
        } catch {
            await user.click(getAddButton())
            await waitUntilTagMenuIsOpen()
        }
    }

    const createUpdateTicketCapture = () => {
        const requests: Array<{ tags: TicketTag[] }> = []
        const mockUpdateTicketCapture = mockUpdateTicketHandler(
            async ({ request }) => {
                const body = await request.clone().json()
                requests.push(body)

                return HttpResponse.json(
                    mockTicket({
                        id: Number(ticketId),
                        tags: body.tags,
                    }),
                )
            },
        )

        return {
            handler: mockUpdateTicketCapture.handler,
            requests,
        }
    }

    const createCreateTagCapture = (createdTag = mockTag({ id: 100 })) => {
        let requestBody: { name: string } | undefined
        const mockCreateTagCapture = mockCreateTagHandler(
            async ({ request }) => {
                requestBody = await request.clone().json()
                return HttpResponse.json(createdTag)
            },
        )

        return {
            handler: mockCreateTagCapture.handler,
            getRequestBody: () => requestBody,
        }
    }

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
    })

    describe('Tag selection via MultiSelect', () => {
        it('should display all available tags in dropdown', async () => {
            const { user } = render(
                <TicketInfobarTicketDetailsTags ticketId={ticketId} />,
            )

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })

            await openTagMenu(user)

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

            await waitForQueriesSettled()
        })
    })

    describe('Adding tags', () => {
        it('should add a new tag when selected from dropdown', async () => {
            const updateTicketCapture = createUpdateTicketCapture()
            server.use(
                mockGetTicket.handler,
                mockListTags.handler,
                updateTicketCapture.handler,
            )

            const { user } = render(
                <TicketInfobarTicketDetailsTags ticketId={ticketId} />,
            )

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })

            await openTagMenu(user)

            const documentationOption = await screen.findByRole('option', {
                name: 'Documentation',
            })
            await user.click(documentationOption)

            await waitFor(() => {
                expect(updateTicketCapture.requests).toHaveLength(1)
            })
            const [updateTicketRequestBody] = updateTicketCapture.requests
            expect(updateTicketRequestBody.tags).toHaveLength(3)
            expect(updateTicketRequestBody.tags).toEqual(
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

            await waitForQueriesSettled()
        })

        it('should add multiple tags when selected', async () => {
            const updateTicketCapture = createUpdateTicketCapture()
            server.use(
                mockGetTicket.handler,
                mockListTags.handler,
                updateTicketCapture.handler,
            )
            const { user } = render(
                <TicketInfobarTicketDetailsTags ticketId={ticketId} />,
            )

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })

            await openTagMenu(user)

            const documentationOption = await screen.findByRole('option', {
                name: 'Documentation',
            })
            await user.click(documentationOption)

            await waitFor(() => {
                expect(updateTicketCapture.requests).toHaveLength(1)
            })
            const [firstRequestBody] = updateTicketCapture.requests
            expect(firstRequestBody.tags).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: 3,
                        name: 'Documentation',
                    }),
                ]),
            )
            await waitForQueriesSettled()

            await openTagMenu(user)

            const marketingOption = await screen.findByRole('option', {
                name: 'Marketing',
            })

            await user.click(marketingOption)

            await waitFor(() => {
                expect(updateTicketCapture.requests).toHaveLength(2)
            })
            const secondRequestBody = updateTicketCapture.requests[1]
            expect(secondRequestBody.tags).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: 4,
                        name: 'Marketing',
                    }),
                ]),
            )

            await waitFor(() => {
                const marketingTags = screen.getAllByText('Marketing')
                expect(marketingTags.length).toBeGreaterThan(0)
            })

            await waitForQueriesSettled()
        }, 10000)

        it('should maintain tag sort order when adding new tags', async () => {
            const updateTicketCapture = createUpdateTicketCapture()
            server.use(
                mockGetTicket.handler,
                mockListTags.handler,
                updateTicketCapture.handler,
            )

            const { user } = render(
                <TicketInfobarTicketDetailsTags ticketId={ticketId} />,
            )

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })

            await openTagMenu(user)

            const salesOption = await screen.findByRole('option', {
                name: 'Sales',
            })
            await user.click(salesOption)

            await waitFor(() => {
                expect(updateTicketCapture.requests).toHaveLength(1)
            })
            const [updateTicketRequestBody] = updateTicketCapture.requests
            const names = updateTicketRequestBody.tags.map(
                (tag: { name: string }) => tag.name,
            )
            expect(names).toEqual(['Bug', 'Feature Request', 'Sales'])

            await waitForQueriesSettled()
        })
    })

    describe('Creating tags', () => {
        it('should create a new tag when search returns no results and create is clicked', async () => {
            const createdTag = mockTag({
                id: 100,
                name: 'NewTag',
                decoration: null,
            })
            const createTagCapture = createCreateTagCapture(createdTag)
            const updateTicketCapture = createUpdateTicketCapture()

            const mockCreateTagCustom = mockCreateTagHandler(async () =>
                HttpResponse.json(createdTag),
            )

            const mockListTagsSearchAware = mockListTagsHandler(
                async ({ data, request }) => {
                    const url = new URL(request.url)
                    const search = url.searchParams.get('search') || ''

                    if (search) {
                        return HttpResponse.json({
                            ...data,
                            data: [],
                            meta: {
                                total_resources: 0,
                                prev_cursor: null,
                                next_cursor: null,
                            },
                        })
                    }

                    return HttpResponse.json({
                        ...data,
                        data: allTags,
                        meta: {
                            total_resources: allTags.length,
                            prev_cursor: null,
                            next_cursor: null,
                        },
                    })
                },
            )

            server.use(
                mockGetTicket.handler,
                mockListTagsSearchAware.handler,
                mockCreateTagCustom.handler,
                mockUpdateTicket.handler,
            )
            server.use(createTagCapture.handler, updateTicketCapture.handler)
            const { user } = render(
                <TicketInfobarTicketDetailsTags ticketId={ticketId} />,
            )

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })

            await waitFor(() => {
                expect(screen.getAllByText('Bug').length).toBeGreaterThan(0)
                expect(
                    screen.getAllByText('Feature Request').length,
                ).toBeGreaterThan(0)
            })

            await openTagMenu(user)

            const searchInput = await screen.findByRole(
                'searchbox',
                {},
                { timeout: 3000 },
            )
            await user.type(searchInput, 'NewTag')

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /create tag/i }),
                ).toBeInTheDocument()
            })

            await user.click(
                screen.getByRole('button', { name: /create tag/i }),
            )

            await waitFor(() => {
                expect(createTagCapture.getRequestBody()).toBeDefined()
            })
            const createTagRequestBody = createTagCapture.getRequestBody()!
            expect(createTagRequestBody.name).toBe('NewTag')

            await waitFor(() => {
                expect(updateTicketCapture.requests).toHaveLength(1)
            })
            const [updateTicketRequestBody] = updateTicketCapture.requests
            expect(updateTicketRequestBody.tags).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ id: 1, name: 'Bug' }),
                    expect.objectContaining({
                        id: 2,
                        name: 'Feature Request',
                    }),
                    expect.objectContaining({
                        id: 100,
                        name: 'NewTag',
                    }),
                ]),
            )

            await waitForQueriesSettled()
        })
    })

    describe('Removing tags', () => {
        it('should remove a tag when close button is clicked', async () => {
            const updateTicketCapture = createUpdateTicketCapture()
            server.use(
                mockGetTicket.handler,
                mockListTags.handler,
                updateTicketCapture.handler,
            )

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

            await waitFor(() => {
                expect(updateTicketCapture.requests).toHaveLength(1)
            })
            const [updateTicketRequestBody] = updateTicketCapture.requests
            expect(updateTicketRequestBody.tags).toHaveLength(1)
            expect(updateTicketRequestBody.tags[0].id).toBe(2)

            await waitForQueriesSettled()
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

            await waitForQueriesSettled()
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
            const updateTicketCapture = createUpdateTicketCapture()

            server.use(
                mockGetTicketWithHidden.handler,
                mockListTags.handler,
                updateTicketCapture.handler,
            )

            const { user } = render(
                <TicketInfobarTicketDetailsTags ticketId={ticketId} />,
            )

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })

            await openTagMenu(user)

            await waitFor(() => {
                const documentationOptions =
                    screen.getAllByText('Documentation')
                expect(documentationOptions.length).toBeGreaterThan(0)
            })

            const bugOption = await screen.findByRole('option', {
                name: 'Bug',
            })
            await user.click(bugOption)

            await waitFor(() => {
                expect(updateTicketCapture.requests).toHaveLength(1)
            })
            const [updateTicketRequestBody] = updateTicketCapture.requests
            expect(updateTicketRequestBody.tags).toEqual(
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
            expect(updateTicketRequestBody.tags).toHaveLength(2)

            await waitForQueriesSettled()
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

            await openTagMenu(user)

            const searchInput = await screen.findByRole('searchbox')
            await user.type(searchInput, 'Test')

            await waitFor(() => {
                expect(searchInput).toHaveValue('Test')
            })

            await waitForQueriesSettled()
        }, 10000)

        it('should show search input when dropdown is open', async () => {
            const { user } = render(
                <TicketInfobarTicketDetailsTags ticketId={ticketId} />,
            )

            await waitFor(() => {
                expect(getAddButton()).toBeInTheDocument()
            })

            await openTagMenu(user)

            await waitFor(() => {
                expect(screen.getByRole('searchbox')).toBeInTheDocument()
            })

            const searchInput = screen.getByRole('searchbox')
            await user.type(searchInput, 'Doc')

            expect(searchInput).toHaveValue('Doc')

            await waitForQueriesSettled()
        })
    })
})
