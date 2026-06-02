import type { ComponentProps } from 'react'

import { UserRole } from '@repo/permissions'
import { shortcutManager } from '@repo/utils'
import { clearViewsCount, setViewsCount } from '@repo/views'
import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetCurrentUserHandler,
    mockGetViewHandler,
    mockGetViewResponse,
    mockListViewItemsHandler,
    mockListViewItemsUpdatesHandler,
    mockListViewItemsUpdatesResponse,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { render } from '../../../tests/render.utils'
import * as useTicketsListModule from '../../hooks/useTicketsList'
import { TicketTable } from './TicketTable'

const {
    createTicketTableColumnsMock,
    pushMock,
    getItemMock,
    setItemMock,
    removeItemMock,
    clearMock,
    readyMock,
    observeTableMock,
} = vi.hoisted(() => ({
    createTicketTableColumnsMock: vi.fn(() => [
        {
            id: 'ticket',
            accessorKey: 'subject',
            header: 'Ticket',
        },
    ]),
    pushMock: vi.fn(),
    getItemMock: vi.fn(),
    setItemMock: vi.fn(),
    removeItemMock: vi.fn(),
    clearMock: vi.fn().mockResolvedValue(undefined),
    readyMock: vi.fn().mockResolvedValue(undefined),
    observeTableMock: vi.fn(() => ({ unsubscribe: vi.fn() })),
}))

const server = setupServer()

const mockState = {
    sortOrder: 'last_message_datetime:desc',
    viewFilters: '',
    tickets: [] as Array<{ id: number; subject: string; is_unread?: boolean }>,
    error: null as unknown,
    markAsRead: vi.fn(),
    refetchSpy: vi.fn(),
    setSortOrder: vi.fn(),
}

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useHistory: () => ({ push: pushMock }),
    }
})

vi.mock('@repo/preferences', () => ({
    useUserDateTimePreferences: () => ({
        dateFormat: 'en-US',
        timeFormat: '12h',
        timezone: 'UTC',
    }),
}))

vi.mock('@repo/browser-storage', () => ({
    localForageManager: {
        getTable: () => ({
            getItem: getItemMock,
            setItem: setItemMock,
            removeItem: removeItemMock,
            clear: clearMock,
            ready: readyMock,
        }),
        observeTable: observeTableMock,
    },
}))

vi.mock(
    '../../../translations/hooks/useCurrentUserLanguagePreferences',
    () => ({
        useCurrentUserLanguagePreferences: () => ({
            shouldShowTranslatedContent: () => false,
        }),
    }),
)

vi.mock('../../../translations/hooks/useTicketsTranslatedProperties', () => ({
    useTicketsTranslatedProperties: () => ({
        translationMap: {},
    }),
}))

vi.mock('../../hooks/useMarkTicketAsRead', () => ({
    useMarkTicketAsRead: () => ({
        markAsRead: mockState.markAsRead,
    }),
}))

vi.mock('../../hooks/useSortOrder', () => ({
    useSortOrder: () => [mockState.sortOrder, mockState.setSortOrder],
}))

vi.mock('../../hooks/useTicketsList', () => ({
    useTicketsList: vi.fn(() => ({
        tickets: mockState.tickets,
        fetchNextPage: vi.fn(),
        hasNextPage: false,
        isLoading: false,
        isFetchingNextPage: false,
        error: mockState.error,
        refetch: mockState.refetchSpy,
    })),
}))

vi.mock('../../hooks/useTicketTableColumnVisibility', () => ({
    useTicketTableColumnVisibility: () => ({
        defaultVisibleColumns: ['ticket', 'subject'],
        onChange: vi.fn(),
    }),
}))

vi.mock('../../hooks/useViewVisibleTickets', () => ({
    useViewVisibleTickets: () => ({
        viewVisibleTickets: vi.fn(),
    }),
}))

vi.mock('../../../hooks/useCurrentUserId', () => ({
    useCurrentUserId: () => ({
        currentUserId: 321,
    }),
}))

vi.mock('../../hooks/useTicketListActions', () => ({
    useTicketListActions: () => ({
        isLoading: false,
        handleApplyMacro: vi.fn(),
        handleAddTag: vi.fn(),
        handleSetStatus: vi.fn(),
        handleAssignUser: vi.fn(),
        handleAssignTeam: vi.fn(),
        handleChangePriority: vi.fn(),
        handleExportTickets: vi.fn(),
        handleMarkAsRead: vi.fn(),
        handleMarkAsUnread: vi.fn(),
        handleMoveToTrash: vi.fn(),
        handleUndelete: vi.fn(),
        handleDeleteForever: vi.fn(),
    }),
}))

vi.mock('./TicketTableColumns', () => ({
    createTicketTableColumns: createTicketTableColumnsMock,
}))

function renderTicketTable(
    props?: Partial<ComponentProps<typeof TicketTable>>,
) {
    return render(<TicketTable viewId={123} {...props} />)
}

async function waitForTicketTableToBeReady() {
    await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(getRowSelectionCheckbox()).toBeEnabled()
    })
}

function getRowSelectionCheckbox() {
    return screen.getAllByRole('checkbox').at(1)!
}

async function triggerShortcut(shortcut: string) {
    await act(async () => {
        shortcutManager.trigger(shortcut)
    })
}

const agentUser = mockUser({
    id: 1,
    email: 'agent@test.com',
    firstname: 'Test',
    lastname: 'Agent',
    role: { name: UserRole.Agent },
})

function createListViewItemsErrorHandler(status: number, message: string) {
    return mockListViewItemsHandler(async () =>
        HttpResponse.json(
            {
                error: {
                    msg: message,
                },
            } as any,
            { status },
        ),
    ).handler
}

const mockListViewItemsUpdatesNoOp = mockListViewItemsUpdatesHandler(async () =>
    HttpResponse.json(
        mockListViewItemsUpdatesResponse({
            data: [],
            meta: {},
        }),
    ),
)

beforeAll(() => {
    server.listen({
        onUnhandledRequest({ method, url }) {
            throw new Error(
                `[TicketTable.spec] unhandled request: ${method} ${url}`,
            )
        },
    })
})

afterEach(() => {
    clearViewsCount()
    window.history.pushState({}, '', '/')
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('TicketTable', () => {
    beforeEach(() => {
        createTicketTableColumnsMock.mockClear()
        setViewsCount({ 123: 7 })
        server.use(
            mockGetCurrentUserHandler(async () => HttpResponse.json(agentUser))
                .handler,
            mockGetViewHandler(async () =>
                HttpResponse.json(
                    mockGetViewResponse({
                        id: 123,
                        deactivated_datetime: undefined,
                        filters: mockState.viewFilters,
                    }),
                ),
            ).handler,
        )
        mockState.sortOrder = 'last_message_datetime:desc'
        mockState.viewFilters = ''
        mockState.tickets = [
            { id: 1, subject: 'First ticket' },
            { id: 2, subject: 'Second ticket' },
        ]
        mockState.error = null
        pushMock.mockReset()
        mockState.markAsRead.mockReset()
        mockState.refetchSpy.mockReset()
        mockState.setSortOrder.mockReset()
        vi.mocked(useTicketsListModule.useTicketsList).mockImplementation(
            () => ({
                tickets: mockState.tickets as any,
                fetchNextPage: vi.fn(),
                hasNextPage: false,
                isLoading: false,
                isFetching: false,
                isFetchingNextPage: false,
                error: mockState.error,
                data: undefined,
                refetch: mockState.refetchSpy,
            }),
        )
    })

    it('keeps rendering loaded rows when a refresh fails', async () => {
        mockState.error = new Error('Not found')

        renderTicketTable()

        await waitForTicketTableToBeReady()

        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(getRowSelectionCheckbox()).toBeInTheDocument()
        expect(screen.queryByText('Network error')).not.toBeInTheDocument()
    })

    it('marks unread tickets as read and navigates when a row is clicked', async () => {
        mockState.tickets = [
            { id: 1, subject: 'First ticket', is_unread: true },
            { id: 2, subject: 'Second ticket', is_unread: false },
        ]
        const onNavigateToTicket = vi.fn()
        const { user } = renderTicketTable({ onNavigateToTicket })
        await waitForTicketTableToBeReady()

        await user.click(screen.getByText('First ticket'))

        expect(mockState.markAsRead).toHaveBeenCalledWith(1)
        expect(onNavigateToTicket).toHaveBeenCalledTimes(1)
        expect(pushMock).toHaveBeenCalledWith('/app/ticket/1')
    })

    it('does not mark already read tickets as read when a row is clicked', async () => {
        mockState.tickets = [
            { id: 1, subject: 'First ticket', is_unread: false },
            { id: 2, subject: 'Second ticket', is_unread: false },
        ]
        const { user } = renderTicketTable()
        await waitForTicketTableToBeReady()

        await user.click(screen.getByText('First ticket'))

        expect(mockState.markAsRead).not.toHaveBeenCalled()
        expect(pushMock).toHaveBeenCalledWith('/app/ticket/1')
    })

    it('pauses updates while a row is selected and resumes after clearing the selection', async () => {
        const { user } = renderTicketTable()
        await waitForTicketTableToBeReady()

        await waitFor(() => {
            expect(
                useTicketsListModule.useTicketsList,
            ).toHaveBeenLastCalledWith(
                123,
                expect.objectContaining({
                    params: {
                        order_by: 'last_message_datetime:desc',
                        limit: 20,
                    },
                    pauseUpdates: false,
                    enableStaleUpdates: true,
                }),
            )
        })

        await user.click(screen.getAllByRole('checkbox')[1])

        await waitFor(() => {
            expect(
                useTicketsListModule.useTicketsList,
            ).toHaveBeenLastCalledWith(
                123,
                expect.objectContaining({
                    params: {
                        order_by: 'last_message_datetime:desc',
                        limit: 20,
                    },
                    pauseUpdates: true,
                    enableStaleUpdates: true,
                }),
            )
        })

        await user.click(screen.getAllByRole('checkbox')[1])

        await waitFor(() => {
            expect(
                useTicketsListModule.useTicketsList,
            ).toHaveBeenLastCalledWith(
                123,
                expect.objectContaining({
                    params: {
                        order_by: 'last_message_datetime:desc',
                        limit: 20,
                    },
                    pauseUpdates: false,
                    enableStaleUpdates: true,
                }),
            )
        })
    })

    it('hydrates page size and page index from DataTable URL persistence', async () => {
        setViewsCount({ 123: 700 })
        mockState.tickets = Array.from({ length: 700 }, (_, index) => ({
            id: index + 1,
            subject: `Ticket ${index + 1}`,
        }))
        window.history.pushState({}, '', '/?pageIndex=5&pageSize=100')

        renderTicketTable()
        await waitForTicketTableToBeReady()

        expect(screen.getByText('Ticket 501')).toBeInTheDocument()
        expect(screen.queryByText('Ticket 600')).not.toBeInTheDocument()
        expect(screen.getByText(/501.*600/)).toBeInTheDocument()
        await waitFor(() => {
            expect(
                useTicketsListModule.useTicketsList,
            ).toHaveBeenLastCalledWith(
                123,
                expect.objectContaining({
                    params: {
                        order_by: 'last_message_datetime:desc',
                        limit: 100,
                    },
                }),
            )
        })
    })

    it('moves to the next page when the right arrow shortcut is triggered', async () => {
        setViewsCount({ 123: 40 })
        mockState.tickets = Array.from({ length: 40 }, (_, index) => ({
            id: index + 1,
            subject: `Ticket ${index + 1}`,
        }))

        renderTicketTable()
        await waitForTicketTableToBeReady()

        expect(screen.getByText('Ticket 1')).toBeInTheDocument()
        expect(screen.queryByText('Ticket 21')).not.toBeInTheDocument()

        await triggerShortcut('right')

        await waitFor(() => {
            expect(screen.getByText('Ticket 21')).toBeInTheDocument()
        })
        expect(screen.queryByText('Ticket 1')).not.toBeInTheDocument()
    })

    it('moves to the previous page when the left arrow shortcut is triggered', async () => {
        setViewsCount({ 123: 40 })
        mockState.tickets = Array.from({ length: 40 }, (_, index) => ({
            id: index + 1,
            subject: `Ticket ${index + 1}`,
        }))

        renderTicketTable()
        await waitForTicketTableToBeReady()

        await triggerShortcut('right')

        await waitFor(() => {
            expect(screen.getByText('Ticket 21')).toBeInTheDocument()
        })

        await triggerShortcut('left')

        await waitFor(() => {
            expect(screen.getByText('Ticket 1')).toBeInTheDocument()
        })
        expect(screen.queryByText('Ticket 21')).not.toBeInTheDocument()
    })

    it('does not move to the previous page when the left arrow shortcut is triggered on the first page', async () => {
        setViewsCount({ 123: 40 })
        mockState.tickets = Array.from({ length: 40 }, (_, index) => ({
            id: index + 1,
            subject: `Ticket ${index + 1}`,
        }))

        renderTicketTable()
        await waitForTicketTableToBeReady()

        await triggerShortcut('left')

        expect(screen.getByText('Ticket 1')).toBeInTheDocument()
        expect(screen.queryByText('Ticket 21')).not.toBeInTheDocument()
    })

    it('does not move to the next page when the right arrow shortcut is triggered on the last page', async () => {
        setViewsCount({ 123: 40 })
        mockState.tickets = Array.from({ length: 40 }, (_, index) => ({
            id: index + 1,
            subject: `Ticket ${index + 1}`,
        }))

        renderTicketTable()
        await waitForTicketTableToBeReady()

        await triggerShortcut('right')

        await waitFor(() => {
            expect(screen.getByText('Ticket 21')).toBeInTheDocument()
        })

        await triggerShortcut('right')

        expect(screen.getByText('Ticket 21')).toBeInTheDocument()
        expect(screen.queryByText('Ticket 1')).not.toBeInTheDocument()
    })

    it('renders all rows when page size is below 50', async () => {
        setViewsCount({ 123: 49 })
        mockState.tickets = Array.from({ length: 49 }, (_, index) => ({
            id: index + 1,
            subject: `Ticket ${index + 1}`,
        }))
        window.history.pushState({}, '', '/?pageIndex=0&pageSize=49')

        renderTicketTable()
        await waitForTicketTableToBeReady()

        expect(screen.getByText('Ticket 1')).toBeInTheDocument()
        expect(screen.getByText('Ticket 49')).toBeInTheDocument()
    })

    it('virtualizes rows when page size is 50', async () => {
        setViewsCount({ 123: 50 })
        mockState.tickets = Array.from({ length: 50 }, (_, index) => ({
            id: index + 1,
            subject: `Ticket ${index + 1}`,
        }))
        window.history.pushState({}, '', '/?pageIndex=0&pageSize=50')

        renderTicketTable()
        await waitForTicketTableToBeReady()

        expect(screen.getByText('Ticket 1')).toBeInTheDocument()
        expect(screen.queryByText('Ticket 50')).not.toBeInTheDocument()
    })

    it('renders the table empty state when the loaded view has no tickets', async () => {
        mockState.tickets = []
        server.use(
            mockGetViewHandler(async () =>
                HttpResponse.json(
                    mockGetViewResponse({
                        id: 123,
                        deactivated_datetime: undefined,
                        filters: mockState.viewFilters,
                        slug: 'all',
                    }),
                ),
            ).handler,
        )

        renderTicketTable()

        await waitFor(() => {
            expect(screen.getByText('No tickets')).toBeInTheDocument()
            expect(
                screen.getByText('There are no tickets matching these filters'),
            ).toBeInTheDocument()
        })
    })

    it('renders the error placeholder and refresh action when loading tickets fails', async () => {
        mockState.tickets = []
        mockState.error = new Error('Failed to load tickets')
        const { user } = renderTicketTable()

        await waitFor(() => {
            expect(
                screen.getByRole('heading', { name: 'Network error' }),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Unable to load this view currently'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Refresh' }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: 'Refresh' }))

        expect(mockState.refetchSpy).toHaveBeenCalledTimes(1)
    })

    it('renders the inaccessible placeholder when loading tickets returns 404', async () => {
        const { useTicketsList: actualUseTicketsList } = await vi.importActual<
            typeof useTicketsListModule
        >('../../hooks/useTicketsList')

        vi.mocked(useTicketsListModule.useTicketsList).mockImplementation(
            (...args) => actualUseTicketsList(...args),
        )
        server.use(
            createListViewItemsErrorHandler(
                404,
                'The view #123 does not exist',
            ),
            mockListViewItemsUpdatesNoOp.handler,
        )

        renderTicketTable()

        await waitFor(() => {
            expect(
                screen.getByRole('heading', { name: "Can't access view" }),
            ).toBeInTheDocument()
        })

        expect(
            screen.getByText(
                'This view does not exist or you do not have the correct permissions',
            ),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('heading', { name: 'Network error' }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: 'Refresh' }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('Request failed with status code 404'),
        ).not.toBeInTheDocument()
    })

    it('renders loading placeholders while the view is still loading', () => {
        renderTicketTable()

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })

    it('renders draft views with the table content', async () => {
        renderTicketTable({ isDraftView: true })

        await waitForTicketTableToBeReady()

        expect(screen.getByRole('table')).toBeInTheDocument()
    })
})
