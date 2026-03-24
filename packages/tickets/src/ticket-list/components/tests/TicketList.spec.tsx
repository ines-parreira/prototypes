import * as React from 'react'

import { act, cleanup, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { VirtuosoMockContext } from 'react-virtuoso'

import {
    mockGetCurrentUserHandler,
    mockGetUserHandler,
    mockGetViewHandler,
    mockGetViewResponse,
    mockListTeamsHandler,
    mockListUsersHandler,
    mockListViewItemsHandler,
    mockListViewItemsResponse,
    mockListViewItemsUpdatesHandler,
    mockListViewItemsUpdatesResponse,
    mockTicket,
    mockTicketCompact,
    mockUpdateTicketHandler,
    mockUser,
} from '@gorgias/helpdesk-mocks'
import type {
    ListViewItems200DataItem,
    TicketCompact,
} from '@gorgias/helpdesk-types'

import { render, testAppQueryClient } from '../../../tests/render.utils'
import * as useCurrentUserLanguagePreferencesModule from '../../../translations/hooks/useCurrentUserLanguagePreferences'
import * as useTicketsTranslatedPropertiesModule from '../../../translations/hooks/useTicketsTranslatedProperties'
import * as useMarkTicketAsReadModule from '../../hooks/useMarkTicketAsRead'
import * as useSortOrderModule from '../../hooks/useSortOrder'
import * as useTicketSelectionModule from '../../hooks/useTicketSelection'
import * as useTicketsListModule from '../../hooks/useTicketsList'
import * as useViewVisibleTicketsModule from '../../hooks/useViewVisibleTickets'
import { TicketList } from '../TicketList'

const mockViewTickets = vi.fn()
const mockGetTicketActivity = vi.fn(() => ({
    viewing: [] as Array<{ id: number; name?: string; email?: string }>,
}))

vi.mock('@gorgias/realtime', () => ({
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
const mockTicket1 = mockTicketCompact({ id: 1, subject: 'First Ticket' })
const mockTicket2 = mockTicketCompact({ id: 2, subject: 'Second Ticket' })
const mockTicket3 = mockTicketCompact({ id: 3, subject: 'Third Ticket' })
const nextItemsUrl = `/api/views/${viewId}/items/?cursor=page-2`

function toListViewItem(ticket: TicketCompact): ListViewItems200DataItem {
    return {
        ...ticket,
        assignee_team: undefined,
        assignee_user: undefined,
    } as unknown as ListViewItems200DataItem
}

const mockListViewItems = mockListViewItemsHandler(async () =>
    HttpResponse.json(
        mockListViewItemsResponse({
            data: [toListViewItem(mockTicket1), toListViewItem(mockTicket2)],
            meta: {
                current_cursor: undefined,
                next_items: undefined,
                prev_items: undefined,
            },
        }),
    ),
)

const mockListViewItemsUpdatesNoOp = mockListViewItemsUpdatesHandler(async () =>
    HttpResponse.json(
        mockListViewItemsUpdatesResponse({
            data: [],
            meta: {},
        }),
    ),
)

const mockCurrentUser = mockGetCurrentUserHandler()
const mockGetView = mockGetViewHandler()
const mockListTeams = mockListTeamsHandler()
const mockListUsers = mockListUsersHandler()
const mockUpdateTicket = mockUpdateTicketHandler()

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
        mockListTeams.handler,
        mockListUsers.handler,
        mockGetUserHandler(async ({ params }) =>
            HttpResponse.json(
                mockUser({
                    id: Number(params?.id ?? 0),
                    name: `User ${params?.id ?? 0}`,
                    email: `user${params?.id ?? 0}@example.com`,
                }) as never,
            ),
        ).handler,
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
    cleanup()
    server.resetHandlers()
    vi.restoreAllMocks()
})

afterAll(() => {
    server.close()
})

describe('TicketList', () => {
    it('should render loading state', () => {
        renderWithVirtuoso(<TicketList viewId={viewId} onCollapse={vi.fn()} />)

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('should render tickets with subjects', async () => {
        renderWithVirtuoso(<TicketList viewId={viewId} onCollapse={vi.fn()} />)

        await waitFor(() => {
            expect(screen.getByText('First Ticket')).toBeInTheDocument()
        })

        const allFirstTickets = screen.getAllByText('First Ticket')
        const allSecondTickets = screen.getAllByText('Second Ticket')

        expect(allFirstTickets).toHaveLength(1)
        expect(allSecondTickets).toHaveLength(1)
    })

    it('should request translations only for visible tickets', async () => {
        const manyTickets = Array.from({ length: 150 }, (_, index) =>
            mockTicketCompact({
                id: index + 1,
                subject: `Ticket ${index + 1}`,
            }),
        )
        const useTicketsTranslatedPropertiesSpy = vi.spyOn(
            useTicketsTranslatedPropertiesModule,
            'useTicketsTranslatedProperties',
        )

        vi.spyOn(useTicketsListModule, 'useTicketsList').mockReturnValue({
            tickets: manyTickets,
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isLoading: false,
            isFetching: false,
            isFetchingNextPage: false,
            error: null,
            data: undefined,
            refetch: vi.fn(),
        })

        renderWithVirtuoso(<TicketList viewId={viewId} onCollapse={vi.fn()} />)

        await waitFor(() => {
            const lastCall = useTicketsTranslatedPropertiesSpy.mock.calls.at(-1)
            expect(lastCall).toBeDefined()

            const [{ ticket_ids: visibleTicketIds }] = lastCall as [
                { ticket_ids: number[] },
            ]

            expect(visibleTicketIds.length).toBeGreaterThan(0)
            expect(visibleTicketIds.length).toBeLessThan(manyTickets.length)
            expect(visibleTicketIds).toEqual(
                Array.from(
                    { length: visibleTicketIds.length },
                    (_, index) => index + 1,
                ),
            )
        })
    })

    it('should render network error state when the tickets request fails', async () => {
        vi.spyOn(useTicketsListModule, 'useTicketsList').mockReturnValue({
            tickets: [],
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isLoading: false,
            isFetching: false,
            isFetchingNextPage: false,
            error: new Error('Not found'),
            data: undefined,
            refetch: vi.fn(),
        })

        renderWithVirtuoso(<TicketList viewId={viewId} onCollapse={vi.fn()} />)

        await waitFor(() => {
            expect(
                screen.getByRole('heading', { name: 'Network error' }),
            ).toBeInTheDocument()
        })

        expect(
            screen.getByText('Unable to load this view currently'),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Refresh' }),
        ).toBeInTheDocument()
    })

    describe('view-based empty states', () => {
        const mockUseTicketsList = (error: Error | null = null) => {
            vi.spyOn(useTicketsListModule, 'useTicketsList').mockReturnValue({
                tickets: [],
                fetchNextPage: vi.fn(),
                hasNextPage: false,
                isLoading: false,
                isFetching: false,
                isFetchingNextPage: false,
                error,
                data: undefined,
                refetch: vi.fn(),
            })
        }

        it('should render invalid filters state when the view is deactivated', async () => {
            server.use(
                mockGetViewHandler(async () =>
                    HttpResponse.json(
                        mockGetViewResponse({
                            id: viewId,
                            deactivated_datetime: '2024-01-01T00:00:00Z',
                        }),
                    ),
                ).handler,
                mockListViewItemsHandler(async () =>
                    HttpResponse.json(
                        mockListViewItemsResponse({
                            data: [],
                            meta: {
                                current_cursor: undefined,
                                next_items: undefined,
                                prev_items: undefined,
                            },
                        }),
                    ),
                ).handler,
            )

            renderWithVirtuoso(
                <TicketList viewId={viewId} onCollapse={vi.fn()} />,
            )

            await waitFor(() => {
                expect(screen.getByText('Invalid filters')).toBeInTheDocument()
                expect(
                    screen.getByText(
                        'This view is deactivated as at least one filter is invalid.',
                    ),
                ).toBeInTheDocument()
            })
        })

        it('should call onFixFilters when the Fix filters button is clicked', async () => {
            const onFixFilters = vi.fn()
            mockUseTicketsList(
                new Error(
                    "We couldn't list ticket updates for a given view because View is deactivated.",
                ),
            )

            server.use(
                mockGetViewHandler(async () =>
                    HttpResponse.json(
                        mockGetViewResponse({
                            id: viewId,
                            deactivated_datetime: '2024-01-01T00:00:00Z',
                        }),
                    ),
                ).handler,
            )

            const { user } = renderWithVirtuoso(
                <TicketList
                    viewId={viewId}
                    onCollapse={vi.fn()}
                    onFixFilters={onFixFilters}
                />,
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: 'Fix filters' }),
                ).toBeInTheDocument()
            })

            await user.click(
                screen.getByRole('button', { name: 'Fix filters' }),
            )

            expect(onFixFilters).toHaveBeenCalledTimes(1)
        })

        it('should render inaccessible state when the view data is null', async () => {
            server.use(
                mockGetViewHandler(async () => HttpResponse.json(null as any))
                    .handler,
                mockListViewItemsHandler(async () =>
                    HttpResponse.json(
                        mockListViewItemsResponse({
                            data: [],
                            meta: {
                                current_cursor: undefined,
                                next_items: undefined,
                                prev_items: undefined,
                            },
                        }),
                    ),
                ).handler,
            )

            renderWithVirtuoso(
                <TicketList viewId={viewId} onCollapse={vi.fn()} />,
            )

            await waitFor(() => {
                expect(
                    screen.getByText("Can't access view"),
                ).toBeInTheDocument()
            })
            expect(
                screen.getByText(
                    'This view does not exist or you do not have the correct permissions',
                ),
            ).toBeInTheDocument()
        })

        it('should render inbox empty state', async () => {
            mockUseTicketsList()

            server.use(
                mockGetViewHandler(async () =>
                    HttpResponse.json(
                        mockGetViewResponse({
                            id: viewId,
                            deactivated_datetime: undefined,
                            slug: 'inbox',
                        }),
                    ),
                ).handler,
            )

            renderWithVirtuoso(
                <TicketList viewId={viewId} onCollapse={vi.fn()} />,
            )

            await waitFor(() => {
                expect(screen.getByText('No open tickets')).toBeInTheDocument()
                expect(
                    screen.getByText("You've closed all your tickets!"),
                ).toBeInTheDocument()
            })
        })

        it('should render filtered empty state for non-inbox views', async () => {
            mockUseTicketsList()

            server.use(
                mockGetViewHandler(async () =>
                    HttpResponse.json(
                        mockGetViewResponse({
                            id: viewId,
                            deactivated_datetime: undefined,
                            slug: 'all',
                        }),
                    ),
                ).handler,
            )

            renderWithVirtuoso(
                <TicketList viewId={viewId} onCollapse={vi.fn()} />,
            )

            await waitFor(() => {
                expect(screen.getByText('No tickets')).toBeInTheDocument()
                expect(
                    screen.getByText(
                        'There are no tickets matching these filters',
                    ),
                ).toBeInTheDocument()
            })
        })
    })

    it('should show another agent viewing indicator when other agents are viewing', async () => {
        mockGetTicketActivity.mockReturnValue({
            viewing: [{ id: 99, name: 'Viewing Agent' }],
        })

        renderWithVirtuoso(
            <TicketList
                viewId={viewId}
                currentUserId={1}
                onCollapse={vi.fn()}
            />,
        )

        await waitFor(() => {
            expect(screen.getAllByText('VA')).toHaveLength(2)
        })
    })

    it('fetches the next page when the end of the list is reached', async () => {
        server.use(
            mockListViewItemsHandler(async ({ request }) => {
                const cursor = new URL(request.url).searchParams.get('cursor')
                if (cursor === 'page-2') {
                    return HttpResponse.json(
                        mockListViewItemsResponse({
                            data: [toListViewItem(mockTicket3)],
                            meta: {
                                current_cursor: 'page-2',
                                next_items: undefined,
                                prev_items: undefined,
                            },
                        }),
                    )
                }
                return HttpResponse.json(
                    mockListViewItemsResponse({
                        data: [
                            toListViewItem(mockTicket1),
                            toListViewItem(mockTicket2),
                        ],
                        meta: {
                            current_cursor: undefined,
                            next_items: nextItemsUrl,
                            prev_items: undefined,
                        },
                    }),
                )
            }).handler,
        )

        renderWithVirtuoso(<TicketList viewId={viewId} onCollapse={vi.fn()} />)

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
                    return HttpResponse.json(
                        mockListViewItemsResponse({
                            data: [toListViewItem(mockTicket3)],
                            meta: {
                                current_cursor: 'page-2',
                                next_items: undefined,
                                prev_items: undefined,
                            },
                        }),
                    )
                }
                return HttpResponse.json(
                    mockListViewItemsResponse({
                        data: [
                            toListViewItem(mockTicket1),
                            toListViewItem(mockTicket2),
                        ],
                        meta: {
                            current_cursor: undefined,
                            next_items: nextItemsUrl,
                            prev_items: undefined,
                        },
                    }),
                )
            }).handler,
        )

        renderWithVirtuoso(<TicketList viewId={viewId} onCollapse={vi.fn()} />)

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

describe('mark as read on navigation', () => {
    it('marks an unread ticket as read when it becomes the active ticket', async () => {
        const unreadTicket = mockTicketCompact({
            id: 1,
            subject: 'First Ticket',
            is_unread: true,
        })
        server.use(
            mockListViewItemsHandler(async () =>
                HttpResponse.json(
                    mockListViewItemsResponse({
                        data: [toListViewItem(unreadTicket)],
                        meta: {
                            current_cursor: undefined,
                            next_items: undefined,
                            prev_items: undefined,
                        },
                    }),
                ),
            ).handler,
            mockUpdateTicket.handler,
        )

        const waitForRequest = mockUpdateTicket.waitForRequest(server)

        renderWithVirtuoso(
            <TicketList
                viewId={viewId}
                onCollapse={vi.fn()}
                activeTicketId={1}
            />,
        )

        await waitForRequest(async (request) => {
            const body = await request.json()
            expect(body).toMatchObject({ is_unread: false })
        })
    })

    it('does not mark a ticket as read when it is already read', async () => {
        const readTicket = mockTicketCompact({
            id: 1,
            subject: 'First Ticket',
            is_unread: false,
        })
        const readTicketResponse = mockTicket({
            id: 1,
            subject: 'First Ticket',
            is_unread: false,
        })
        const updateSpy = vi.fn()
        server.use(
            mockListViewItemsHandler(async () =>
                HttpResponse.json(
                    mockListViewItemsResponse({
                        data: [toListViewItem(readTicket)],
                        meta: {
                            current_cursor: undefined,
                            next_items: undefined,
                            prev_items: undefined,
                        },
                    }),
                ),
            ).handler,
            mockUpdateTicketHandler(async (info) => {
                updateSpy(info)
                return HttpResponse.json(readTicketResponse)
            }).handler,
        )

        renderWithVirtuoso(
            <TicketList
                viewId={viewId}
                onCollapse={vi.fn()}
                activeTicketId={1}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('First Ticket')).toBeInTheDocument()
        })

        expect(updateSpy).not.toHaveBeenCalled()
    })
})

describe('selection behaviour', () => {
    it('clears the selection when the sort order changes', async () => {
        const clear = vi.fn()
        vi.spyOn(
            useTicketSelectionModule,
            'useTicketSelection',
        ).mockReturnValue({
            hasSelectedAll: false,
            selectedTicketIds: new Set([mockTicket1.id]),
            selectionCount: 1,
            hasAnySelection: true,
            onSelect: vi.fn(),
            onSelectAll: vi.fn(),
            clear,
        })

        renderWithVirtuoso(<TicketList viewId={viewId} onCollapse={vi.fn()} />)

        await waitFor(() => {
            expect(screen.getByText('First Ticket')).toBeInTheDocument()
        })

        expect(clear).not.toHaveBeenCalled()

        act(() => {
            localStorage.setItem(
                'ticket-list-view-sort-orders',
                JSON.stringify({
                    [viewId]: 'last_received_message_datetime:desc',
                }),
            )
            window.dispatchEvent(
                new CustomEvent('local-storage', {
                    detail: { key: 'ticket-list-view-sort-orders' },
                }),
            )
        })

        await waitFor(() => {
            expect(clear).toHaveBeenCalledTimes(1)
        })
    }, 10000)

    afterEach(() => {
        localStorage.clear()
    })
})

describe('polling pause behaviour', () => {
    it('resumes list updates after selection is cleared', async () => {
        const useTicketsListSpy = vi.spyOn(
            useTicketsListModule,
            'useTicketsList',
        )
        const useTicketSelectionSpy = vi.spyOn(
            useTicketSelectionModule,
            'useTicketSelection',
        )
        const setHasAnySelection = vi.fn<(value: boolean) => void>()
        const markAsRead = vi.fn()

        vi.spyOn(useSortOrderModule, 'useSortOrder').mockReturnValue([
            'last_received_message_datetime:asc',
            vi.fn(),
        ] as ReturnType<typeof useSortOrderModule.useSortOrder>)
        vi.spyOn(
            useViewVisibleTicketsModule,
            'useViewVisibleTickets',
        ).mockReturnValue({ viewVisibleTickets: vi.fn() })
        vi.spyOn(
            useMarkTicketAsReadModule,
            'useMarkTicketAsRead',
        ).mockReturnValue({
            markAsRead,
        })
        vi.spyOn(
            useTicketsTranslatedPropertiesModule,
            'useTicketsTranslatedProperties',
        ).mockReturnValue({
            translationMap: {},
            isInitialLoading: false,
            updateTicketTranslatedSubject: vi.fn(),
        })
        vi.spyOn(
            useCurrentUserLanguagePreferencesModule,
            'useCurrentUserLanguagePreferences',
        ).mockReturnValue({
            isFetching: false,
            primary: undefined,
            proficient: undefined,
            shouldShowTranslatedContent: () => false,
        })

        useTicketsListSpy.mockImplementation(() => ({
            tickets: [
                {
                    ...mockTicket1,
                    excerpt: '',
                    integrations: [],
                    last_sent_message_not_delivered: false,
                    messages_count: 0,
                },
            ],
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isLoading: false,
            isFetching: false,
            isFetchingNextPage: false,
            error: null,
            data: undefined,
            refetch: vi.fn(),
        }))

        useTicketSelectionSpy.mockImplementation(() => {
            const [hasAnySelection, setSelection] = React.useState(false)

            setHasAnySelection.mockImplementation((value: boolean) => {
                setSelection(value)
            })

            return {
                hasSelectedAll: false,
                selectedTicketIds: new Set<number>(),
                selectionCount: hasAnySelection ? 1 : 0,
                hasAnySelection,
                onSelect: vi.fn(),
                onSelectAll: vi.fn(),
                clear: () => setSelection(false),
            }
        })

        renderWithVirtuoso(<TicketList viewId={viewId} onCollapse={vi.fn()} />)

        await waitFor(() => {
            expect(useTicketsListSpy).toHaveBeenLastCalledWith(
                viewId,
                expect.objectContaining({
                    params: {
                        order_by: 'last_received_message_datetime:asc',
                    },
                    pauseUpdates: false,
                    enableStaleUpdates: expect.any(Boolean),
                }),
            )
        })

        act(() => {
            setHasAnySelection(true)
        })

        await waitFor(() => {
            expect(useTicketsListSpy).toHaveBeenLastCalledWith(
                viewId,
                expect.objectContaining({
                    params: {
                        order_by: 'last_received_message_datetime:asc',
                    },
                    pauseUpdates: true,
                    enableStaleUpdates: expect.any(Boolean),
                }),
            )
        })

        act(() => {
            setHasAnySelection(false)
        })

        await waitFor(() => {
            expect(useTicketsListSpy).toHaveBeenLastCalledWith(
                viewId,
                expect.objectContaining({
                    params: {
                        order_by: 'last_received_message_datetime:asc',
                    },
                    pauseUpdates: false,
                    enableStaleUpdates: expect.any(Boolean),
                }),
            )
        })
    })
})

describe('Select all checkbox', () => {
    it('is disabled when there are no tickets', () => {
        vi.spyOn(useTicketsListModule, 'useTicketsList').mockReturnValue({
            tickets: [],
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isLoading: false,
            isFetching: false,
            isFetchingNextPage: false,
            error: null,
            data: undefined,
            refetch: vi.fn(),
        })

        renderWithVirtuoso(<TicketList viewId={viewId} onCollapse={vi.fn()} />)

        expect(screen.getByText('No open tickets')).toBeInTheDocument()
        expect(
            screen.getByRole('checkbox', { name: 'Select all' }),
        ).toBeDisabled()
    })

    it('is disabled when there is a network error', async () => {
        vi.spyOn(useTicketsListModule, 'useTicketsList').mockReturnValue({
            tickets: [],
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isLoading: false,
            isFetching: false,
            isFetchingNextPage: false,
            error: new Error('Not found'),
            data: undefined,
            refetch: vi.fn(),
        })

        renderWithVirtuoso(<TicketList viewId={viewId} onCollapse={vi.fn()} />)

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument()
        })

        expect(
            screen.queryByRole('checkbox', { name: 'Select all' }),
        ).not.toBeInTheDocument()
    })

    it('is enabled when tickets are loaded', async () => {
        renderWithVirtuoso(<TicketList viewId={viewId} onCollapse={vi.fn()} />)

        await waitFor(() => {
            expect(screen.getByText('First Ticket')).toBeInTheDocument()
        })

        expect(
            screen.getByRole('checkbox', { name: 'Select all' }),
        ).not.toBeDisabled()
    })
})
