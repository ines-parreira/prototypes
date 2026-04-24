import type { ComponentProps } from 'react'

import { UserRole } from '@repo/permissions'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Link } from 'react-router-dom'

import type * as AxiomModule from '@gorgias/axiom'
import { DataTableBaseCell } from '@gorgias/axiom'
import {
    mockGetCurrentUserHandler,
    mockGetViewHandler,
    mockGetViewResponse,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { render } from '../../../tests/render.utils'
import * as useTicketsListModule from '../../hooks/useTicketsList'
import { TicketTable } from './TicketTable'

const {
    createTicketTableColumnsMock,
    getItemMock,
    setItemMock,
    removeItemMock,
    clearMock,
    readyMock,
    observeTableMock,
    clearViewsCountMock,
    setViewsCountMock,
    useViewCountMock,
} = vi.hoisted(() => ({
    createTicketTableColumnsMock: vi.fn(),
    getItemMock: vi.fn(),
    setItemMock: vi.fn(),
    removeItemMock: vi.fn(),
    clearMock: vi.fn().mockResolvedValue(undefined),
    readyMock: vi.fn().mockResolvedValue(undefined),
    observeTableMock: vi.fn(() => ({ unsubscribe: vi.fn() })),
    clearViewsCountMock: vi.fn(),
    setViewsCountMock: vi.fn(),
    useViewCountMock: vi.fn(),
}))

const server = setupServer()

const mockState = {
    sortOrder: 'last_message_datetime:desc',
    viewFilters: '',
    tickets: [] as Array<{ id: number; subject: string; is_unread?: boolean }>,
    error: null as Error | null,
    markAsRead: vi.fn(),
    refetchSpy: vi.fn(),
    setSortOrder: vi.fn(),
}

vi.mock('@gorgias/axiom', async () => {
    const actual = await vi.importActual<typeof AxiomModule>('@gorgias/axiom')

    return {
        ...actual,
        createLocalStoragePersistence: () => ({
            read: () => ({}),
            write: vi.fn(),
            clear: vi.fn(() => true),
        }),
    }
})

vi.mock('@repo/preferences', () => ({
    useUserDateTimePreferences: () => ({
        dateFormat: 'en-US',
        timeFormat: '12h',
        timezone: 'UTC',
    }),
}))

vi.mock('@repo/views', () => ({
    useViewCount: useViewCountMock,
    clearViewsCount: clearViewsCountMock,
    setViewsCount: setViewsCountMock,
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

const agentUser = mockUser({
    id: 1,
    email: 'agent@test.com',
    firstname: 'Test',
    lastname: 'Agent',
    role: { name: UserRole.Agent },
})

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
    clearViewsCountMock()
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('TicketTable', () => {
    beforeEach(() => {
        createTicketTableColumnsMock.mockReset()
        clearViewsCountMock.mockReset()
        setViewsCountMock.mockReset()
        useViewCountMock.mockReset()
        createTicketTableColumnsMock.mockImplementation(
            ({
                onNavigateToTicket,
            }: {
                onNavigateToTicket?: (ticket: {
                    id: number
                    subject: string
                    is_unread?: boolean
                }) => void
            }) => [
                {
                    id: 'ticket',
                    accessorKey: 'subject',
                    header: 'Ticket',
                    cell: (cell: {
                        row: {
                            original: {
                                id: number
                                subject: string
                                is_unread?: boolean
                            }
                        }
                    }) => (
                        <DataTableBaseCell {...cell} p={0}>
                            <Link
                                to={`/app/ticket/${cell.row.original.id}`}
                                onClick={(event) => {
                                    if (
                                        event.button !== 0 ||
                                        event.metaKey ||
                                        event.ctrlKey ||
                                        event.shiftKey ||
                                        event.altKey
                                    ) {
                                        return
                                    }

                                    onNavigateToTicket?.(cell.row.original)
                                }}
                            >
                                {cell.row.original.subject}
                            </Link>
                        </DataTableBaseCell>
                    ),
                },
            ],
        )
        setViewsCountMock({ 123: 7 })
        useViewCountMock.mockReturnValue(7)
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
        mockState.markAsRead.mockReset()
        mockState.refetchSpy.mockReset()
        mockState.setSortOrder.mockReset()
        vi.mocked(useTicketsListModule.useTicketsList).mockClear()
    })

    it('keeps rendering loaded rows when a refresh fails', async () => {
        mockState.error = new Error('Not found')

        renderTicketTable()

        await waitForTicketTableToBeReady()

        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(getRowSelectionCheckbox()).toBeInTheDocument()
        expect(screen.queryByText('Network error')).not.toBeInTheDocument()
    })

    it('renders ticket cells as links', async () => {
        renderTicketTable()

        await waitForTicketTableToBeReady()

        expect(
            screen.getByRole('link', { name: 'First ticket' }),
        ).toHaveAttribute('href', '/app/ticket/1')
    })

    it('marks unread tickets as read and navigates when a ticket link is clicked', async () => {
        mockState.tickets = [
            { id: 1, subject: 'First ticket', is_unread: true },
            { id: 2, subject: 'Second ticket', is_unread: false },
        ]
        const onNavigateToTicket = vi.fn()
        const { user } = renderTicketTable({ onNavigateToTicket })
        await waitForTicketTableToBeReady()

        await user.click(screen.getByRole('link', { name: 'First ticket' }))

        expect(mockState.markAsRead).toHaveBeenCalledWith(1)
        expect(onNavigateToTicket).toHaveBeenCalledTimes(1)
    })

    it('does not mark already read tickets as read when a ticket link is clicked', async () => {
        mockState.tickets = [
            { id: 1, subject: 'First ticket', is_unread: false },
            { id: 2, subject: 'Second ticket', is_unread: false },
        ]
        const { user } = renderTicketTable()
        await waitForTicketTableToBeReady()

        await user.click(screen.getByRole('link', { name: 'First ticket' }))

        expect(mockState.markAsRead).not.toHaveBeenCalled()
    })

    it('does not trigger navigation side effects on modified clicks', async () => {
        mockState.tickets = [
            { id: 1, subject: 'First ticket', is_unread: true },
        ]
        const onNavigateToTicket = vi.fn()
        renderTicketTable({ onNavigateToTicket })

        await waitForTicketTableToBeReady()

        fireEvent.click(screen.getByRole('link', { name: 'First ticket' }), {
            metaKey: true,
        })

        expect(mockState.markAsRead).not.toHaveBeenCalled()
        expect(onNavigateToTicket).not.toHaveBeenCalled()
    })

    it('does not navigate when the row checkbox is clicked', async () => {
        const onNavigateToTicket = vi.fn()
        const { user } = renderTicketTable({ onNavigateToTicket })

        await waitForTicketTableToBeReady()

        await user.click(getRowSelectionCheckbox())

        expect(onNavigateToTicket).not.toHaveBeenCalled()
        expect(mockState.markAsRead).not.toHaveBeenCalled()
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
