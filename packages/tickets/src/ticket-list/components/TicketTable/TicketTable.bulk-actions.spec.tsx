import { clearViewsCount, setViewsCount } from '@repo/views'
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import type * as AxiomModule from '@gorgias/axiom'
import {
    mockGetCurrentUserHandler,
    mockGetViewHandler,
    mockGetViewResponse,
    mockListTeamsHandler,
    mockListUsersHandler,
    mockTag,
    mockTeam,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { useCreateTicketTag } from '../../../components/InfobarTicketDetails/components/InfobarTicketTags/hooks/useCreateTicketTag'
import { useListTagsSearch } from '../../../components/InfobarTicketDetails/components/InfobarTicketTags/hooks/useListTagsSearch'
import { render } from '../../../tests/render.utils'
import { TicketStatus } from '../../../types/ticket'
import { useTicketTableBulkActionShortcuts } from '../../hooks/useTicketTableBulkActionShortcuts'
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

const listUser1 = mockUser({ id: 5, name: 'Agent Smith' })
const listUser2 = mockUser({ id: 6, name: 'Alice Agent' })
const supportTeam = mockTeam({ id: 8, name: 'Support' })
const salesTeam = mockTeam({ id: 9, name: 'Sales' })
const vipTag = mockTag({ id: 11, name: 'VIP' })
const urgentTag = mockTag({ id: 12, name: 'Urgent' })

const mockListUsers = mockListUsersHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        data: [listUser1, listUser2],
        meta: { prev_cursor: null, next_cursor: null },
    }),
)

const mockListTeams = mockListTeamsHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        data: [supportTeam, salesTeam],
        meta: { prev_cursor: null, next_cursor: null },
    }),
)

const server = setupServer()
const bulkActionTestTimeout = 10000

const mockState = {
    sortOrder: 'last_message_datetime:desc',
    viewName: 'VIP Customers',
    viewFilters: '',
    hasNextPage: false,
    tickets: [
        { id: 1, subject: 'First ticket' },
        { id: 2, subject: 'Second ticket' },
    ] as Array<{ id: number; subject: string; is_unread?: boolean }>,
    error: null as Error | null,
    isBulkActionLoading: false,
    handleAddTagSpy: vi.fn(),
    handleMarkAsReadSpy: vi.fn(),
    handleUndeleteSpy: vi.fn(),
    handleSetStatusSpy: vi.fn(),
    handleAssignUserSpy: vi.fn(),
    handleAssignTeamSpy: vi.fn(),
    lastTicketListActionsArgs: null as null | {
        hasSelectedAll: boolean
        selectedTicketIds: Set<number>
        visibleTicketIds: number[]
        viewId: number
    },
    ticketListActionsArgsHistory: [] as Array<{
        hasSelectedAll: boolean
        selectedTicketIds: Set<number>
        visibleTicketIds: number[]
        viewId: number
    }>,
}

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useHistory: () => ({ push: pushMock }),
    }
})

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
    '../../../components/InfobarTicketDetails/components/InfobarTicketTags/hooks/useListTagsSearch',
    () => ({
        useListTagsSearch: vi.fn(),
    }),
)

vi.mock(
    '../../../components/InfobarTicketDetails/components/InfobarTicketTags/hooks/useCreateTicketTag',
    () => ({
        useCreateTicketTag: vi.fn(),
    }),
)

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
        markAsRead: vi.fn(),
    }),
}))

vi.mock('../../hooks/useSortOrder', () => ({
    useSortOrder: () => [mockState.sortOrder, vi.fn()],
}))

vi.mock('../../hooks/useTicketTableBulkActionShortcuts', () => ({
    useTicketTableBulkActionShortcuts: vi.fn(),
}))

vi.mock('../../hooks/useTicketsList', () => ({
    useTicketsList: vi.fn(() => ({
        tickets: mockState.tickets,
        fetchNextPage: vi.fn(),
        hasNextPage: mockState.hasNextPage,
        isLoading: false,
        isFetchingNextPage: false,
        error: mockState.error,
        refetch: vi.fn(),
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
    useTicketListActions: ({
        hasSelectedAll,
        onActionComplete,
        selectedTicketIds,
        visibleTicketIds,
        viewId,
    }: {
        hasSelectedAll: boolean
        onActionComplete: () => void
        selectedTicketIds: Set<number>
        visibleTicketIds: number[]
        viewId: number
    }) => {
        const argsSnapshot = {
            hasSelectedAll,
            selectedTicketIds: new Set(selectedTicketIds),
            visibleTicketIds,
            viewId,
        }
        mockState.lastTicketListActionsArgs = argsSnapshot
        mockState.ticketListActionsArgsHistory.push(argsSnapshot)

        return {
            isLoading: mockState.isBulkActionLoading,
            handleApplyMacro: vi.fn(),
            handleAddTag: async (tag: { id: number; name: string }) => {
                mockState.handleAddTagSpy(tag)
                onActionComplete()
            },
            handleSetStatus: async (status: TicketStatus) => {
                mockState.handleSetStatusSpy(status)
                onActionComplete()
            },
            handleAssignUser: async (
                user: { id: number; name: string } | null,
            ) => {
                mockState.handleAssignUserSpy(user)
                onActionComplete()
            },
            handleAssignTeam: async (
                team: { id: number; name: string } | null,
            ) => {
                mockState.handleAssignTeamSpy(team)
                onActionComplete()
            },
            handleChangePriority: vi.fn(),
            handleExportTickets: vi.fn(),
            handleMarkAsRead: async () => {
                mockState.handleMarkAsReadSpy()
                onActionComplete()
            },
            handleMarkAsUnread: vi.fn(),
            handleMoveToTrash: vi.fn(),
            handleUndelete: async (options?: {
                removeFromCurrentViewCache?: boolean
            }) => {
                mockState.handleUndeleteSpy(options)
                onActionComplete()
            },
            handleDeleteForever: vi.fn(),
        }
    },
}))

vi.mock('./TicketTableColumns', () => ({
    createTicketTableColumns: createTicketTableColumnsMock,
}))

vi.mock('./components/BulkMoreActionsMenu/components/BulkAddTagSelect', () => ({
    BulkAddTagSelect: ({
        isDisabled,
        onChange,
    }: {
        isDisabled: boolean
        onChange: (tag: { id: number; name: string }) => void | Promise<void>
    }) => (
        <div>
            <button aria-label="Add tag" disabled={isDisabled} type="button">
                Add tag
            </button>
            <button
                type="button"
                onClick={() => onChange({ id: 11, name: 'VIP' })}
            >
                VIP
            </button>
            <button
                type="button"
                onClick={() => onChange({ id: 12, name: 'Urgent' })}
            >
                Urgent
            </button>
        </div>
    ),
}))

const mockUseListTagsSearch = vi.mocked(useListTagsSearch)
const mockUseCreateTicketTag = vi.mocked(useCreateTicketTag)
const mockUseTicketTableBulkActionShortcuts = vi.mocked(
    useTicketTableBulkActionShortcuts,
)

const agentUser = mockUser({
    id: 1,
    email: 'agent@test.com',
    firstname: 'Test',
    lastname: 'Agent',
})

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    clearViewsCount()
    setViewsCount({ 123: 7 })
    mockState.lastTicketListActionsArgs = null
    mockState.ticketListActionsArgsHistory = []
    mockState.sortOrder = 'last_message_datetime:desc'
    mockState.viewName = 'VIP Customers'
    mockState.viewFilters = ''
    mockState.hasNextPage = false
    mockState.tickets = [
        { id: 1, subject: 'First ticket' },
        { id: 2, subject: 'Second ticket' },
    ]
    mockState.error = null
    mockState.isBulkActionLoading = false
    mockState.handleAddTagSpy.mockReset()
    mockState.handleMarkAsReadSpy.mockReset()
    mockState.handleUndeleteSpy.mockReset()
    mockState.handleSetStatusSpy.mockReset()
    mockState.handleAssignUserSpy.mockReset()
    mockState.handleAssignTeamSpy.mockReset()
    pushMock.mockReset()
    mockUseTicketTableBulkActionShortcuts.mockImplementation(() => undefined)

    server.use(
        mockGetCurrentUserHandler(async () => HttpResponse.json(agentUser))
            .handler,
        mockGetViewHandler(async () =>
            HttpResponse.json(
                mockGetViewResponse({
                    id: 123,
                    name: mockState.viewName,
                    deactivated_datetime: undefined,
                    filters: mockState.viewFilters,
                }),
            ),
        ).handler,
        mockListUsers.handler,
        mockListTeams.handler,
    )

    mockUseListTagsSearch.mockReturnValue({
        tags: [vipTag, urgentTag],
        search: '',
        setSearch: vi.fn(),
        isLoading: false,
        shouldLoadMore: false,
        onLoad: vi.fn(),
        data: undefined,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: vi.fn(),
        isFetching: false,
    } as unknown as ReturnType<typeof useListTagsSearch>)
    mockUseCreateTicketTag.mockReturnValue({
        createTicketTag: vi.fn(),
        isCreating: false,
    })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

function renderTicketTable(props?: { isDraftView?: boolean }) {
    return render(<TicketTable viewId={123} {...props} />)
}

function rerenderTicketTable(
    rerender: ReturnType<typeof render>['rerender'],
    props?: { isDraftView?: boolean },
) {
    rerender(
        <TicketTable viewId={123} onNavigateToTicket={vi.fn()} {...props} />,
    )
}

async function waitForTicketTableToBeReady() {
    await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
        expect(
            screen.getByRole('checkbox', { name: 'Select all rows' }),
        ).toBeEnabled()
        expect(getFirstRowSelectionCheckbox()).toBeEnabled()
    })
}

function getFirstRowSelectionCheckbox() {
    return screen.getAllByRole('checkbox').at(1)!
}

async function waitForBulkToolbarToBeReady() {
    await waitForSelectedCount()
    await waitFor(() => {
        expect(
            screen.getByRole('button', { name: 'More actions' }),
        ).toBeEnabled()
    })
}

async function selectFirstRow(user: ReturnType<typeof render>['user']) {
    await waitForTicketTableToBeReady()
    await act(async () => {
        await user.click(getFirstRowSelectionCheckbox())
    })
    await waitFor(() => {
        expect(getFirstRowSelectionCheckbox()).toBeChecked()
    })
    await waitForBulkToolbarToBeReady()
}

async function selectAllRowsOnPage(user: ReturnType<typeof render>['user']) {
    await waitForTicketTableToBeReady()
    await act(async () => {
        await user.click(
            screen.getByRole('checkbox', { name: 'Select all rows' }),
        )
    })
    await waitForSelectedCount(2)
    await waitFor(() => {
        expect(
            screen.getByRole('checkbox', { name: 'Select all rows' }),
        ).toBeChecked()
    })
    await waitFor(() => {
        expect(
            screen.getByRole('button', { name: 'More actions' }),
        ).toBeEnabled()
    })
}

async function waitForSelectedCount(count = 1) {
    await waitFor(() => {
        expect(
            screen.getAllByText(`${count} items selected`).length,
        ).toBeGreaterThan(0)
    })
}

async function openBulkMoreActionsMenu() {
    fireEvent.click(screen.getByRole('button', { name: 'More actions' }))
    const menu = (await screen.findAllByRole('menu')).at(-1)!
    await within(menu).findByRole('menuitem', { name: /mark as read/i })

    return menu
}

async function getEnabledBulkControl(label: string) {
    return waitFor(() => {
        const control = screen.getByLabelText(label)
        expect(control).toBeEnabled()
        return control
    })
}

async function openStatusSelection(user: ReturnType<typeof render>['user']) {
    const statusSelection = await getEnabledBulkControl('Status selection')
    await user.click(statusSelection)
    return screen.findByRole('listbox')
}

async function waitForSelectionToClear() {
    await waitFor(() => {
        expect(screen.queryAllByText('1 items selected')).toHaveLength(0)
        expect(
            screen.queryByLabelText('Status selection'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: 'More actions' }),
        ).not.toBeInTheDocument()
    })
}

function getLatestBulkShortcutConfig() {
    const [config] = mockUseTicketTableBulkActionShortcuts.mock.lastCall ?? []

    if (!config) {
        throw new Error('Expected bulk shortcut config to be registered')
    }

    expect(config.handleOpenAssignUser).toBeDefined()
    expect(config.handleOpenTags).toBeDefined()

    return config as typeof config & {
        handleOpenAssignUser: () => void
        handleOpenTags: () => void
    }
}

describe('TicketTable bulk actions', () => {
    it('does not render the bulk action controls with no selection', () => {
        renderTicketTable()

        expect(
            screen.queryByLabelText('Status selection'),
        ).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Assign agent')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Assign team')).not.toBeInTheDocument()
        expect(screen.queryByLabelText('Add tag')).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: 'More actions' }),
        ).not.toBeInTheDocument()
    })

    it(
        'enables the bulk action controls and shows the selected count when a row is selected',
        async () => {
            const { user } = renderTicketTable()
            await selectFirstRow(user)

            expect(
                screen.getAllByText('1 items selected').length,
            ).toBeGreaterThan(0)
            expect(
                screen.getByRole('button', { name: 'More actions' }),
            ).toBeEnabled()
        },
        bulkActionTestTimeout,
    )

    it('shows the Axiom select-all CTA when the view count is available', async () => {
        mockState.hasNextPage = true
        const { user } = renderTicketTable()
        await selectAllRowsOnPage(user)

        expect(
            await screen.findByRole('button', {
                name: 'Select all 7 tickets in VIP Customers',
            }),
        ).toBeInTheDocument()
    })

    it('switches bulk actions to full-view mode when the Axiom select-all CTA is used', async () => {
        mockState.hasNextPage = true
        const { user } = renderTicketTable()
        await selectAllRowsOnPage(user)
        await user.click(
            await screen.findByRole('button', {
                name: 'Select all 7 tickets in VIP Customers',
            }),
        )

        await waitFor(() => {
            expect(
                screen.getAllByText('All 7 tickets in VIP Customers selected')
                    .length,
            ).toBeGreaterThan(0)
            expect(mockState.lastTicketListActionsArgs).toMatchObject({
                hasSelectedAll: true,
                viewId: 123,
                visibleTicketIds: [1, 2],
            })
        })
    })

    it(
        'clears full-view selection when the header checkbox is unchecked',
        async () => {
            mockState.hasNextPage = true
            const { user } = renderTicketTable()
            await selectAllRowsOnPage(user)
            await user.click(
                await screen.findByRole('button', {
                    name: 'Select all 7 tickets in VIP Customers',
                }),
            )

            await waitFor(() => {
                expect(
                    screen.getAllByText(
                        'All 7 tickets in VIP Customers selected',
                    ).length,
                ).toBeGreaterThan(0)
            })

            await user.click(
                screen.getByRole('checkbox', {
                    name: 'Select all rows',
                }),
            )

            await waitFor(() => {
                expect(
                    screen.queryByText(
                        'All 7 tickets in VIP Customers selected',
                    ),
                ).not.toBeInTheDocument()
                expect(mockState.lastTicketListActionsArgs).toMatchObject({
                    hasSelectedAll: false,
                    viewId: 123,
                    visibleTicketIds: [1, 2],
                })
                expect(
                    mockState.lastTicketListActionsArgs?.selectedTicketIds.size,
                ).toBe(0)
            })
        },
        bulkActionTestTimeout,
    )

    it('shows the fallback cross-page select-all CTA when the view count is unavailable', async () => {
        mockState.hasNextPage = true
        clearViewsCount()
        const { user } = renderTicketTable()
        await selectAllRowsOnPage(user)

        expect(
            await screen.findByRole('button', {
                name: 'Select all tickets in VIP Customers',
            }),
        ).toBeInTheDocument()
    })

    it('switches bulk actions to full-view mode with fallback copy when the view count is unavailable', async () => {
        mockState.hasNextPage = true
        clearViewsCount()
        const { user } = renderTicketTable()
        await selectAllRowsOnPage(user)
        await user.click(
            await screen.findByRole('button', {
                name: 'Select all tickets in VIP Customers',
            }),
        )

        await waitFor(() => {
            expect(
                screen.getAllByText('All tickets in VIP Customers selected')
                    .length,
            ).toBeGreaterThan(0)
            expect(mockState.lastTicketListActionsArgs).toMatchObject({
                hasSelectedAll: true,
                viewId: 123,
                visibleTicketIds: [1, 2],
            })
        })
    })

    it('keeps draft views on page-only selection', async () => {
        const { user } = renderTicketTable({ isDraftView: true })
        await waitForTicketTableToBeReady()

        await user.click(
            screen.getByRole('checkbox', { name: 'Select all rows' }),
        )

        expect(
            screen.queryByRole('button', { name: /Select all/i }),
        ).not.toBeInTheDocument()
    })

    it(
        'passes the trash-like view context to the bulk menu when the view filters are trash-like',
        async () => {
            mockState.viewFilters = 'isNotEmpty(ticket.trashed_datetime)'
            const { user } = renderTicketTable()
            await selectFirstRow(user)
            const menu = await openBulkMoreActionsMenu()

            expect(
                within(menu).getByRole('menuitem', { name: /undelete/i }),
            ).toBeInTheDocument()
            expect(
                within(menu).getByRole('menuitem', { name: /delete forever/i }),
            ).toBeInTheDocument()
            expect(
                within(menu).queryByRole('menuitem', { name: /^delete$/i }),
            ).not.toBeInTheDocument()
        },
        bulkActionTestTimeout,
    )

    it(
        'wires mark as read through the bulk more actions menu',
        async () => {
            const { user } = renderTicketTable()
            await selectFirstRow(user)
            const menu = await openBulkMoreActionsMenu()
            await user.click(
                within(menu).getByRole('menuitem', { name: /mark as read/i }),
            )

            await waitFor(() => {
                expect(mockState.handleMarkAsReadSpy).toHaveBeenCalledTimes(1)
            })

            await waitForSelectionToClear()
        },
        bulkActionTestTimeout,
    )

    it(
        'passes the trash-view cache removal option when undeleting from the bulk more actions menu',
        async () => {
            mockState.viewFilters = 'isNotEmpty(ticket.trashed_datetime)'
            const { user } = renderTicketTable()
            await selectFirstRow(user)
            const menu = await openBulkMoreActionsMenu()
            await user.click(
                within(menu).getByRole('menuitem', { name: /undelete/i }),
            )

            await waitFor(() => {
                expect(mockState.handleUndeleteSpy).toHaveBeenCalledWith({
                    removeFromCurrentViewCache: true,
                })
            })
        },
        bulkActionTestTimeout,
    )

    it(
        'opens the assignee and tag menus from the bulk action shortcuts',
        async () => {
            const { user } = renderTicketTable()
            await selectFirstRow(user)

            act(() => {
                getLatestBulkShortcutConfig().handleOpenAssignUser()
            })

            expect(
                await screen.findByRole('button', { name: /unassigned/i }),
            ).toBeInTheDocument()

            act(() => {
                getLatestBulkShortcutConfig().handleOpenTags()
            })

            await waitFor(() => {
                expect(
                    screen.queryByRole('button', { name: /unassigned/i }),
                ).not.toBeInTheDocument()
            })
            expect((await screen.findAllByText('VIP')).length).toBeGreaterThan(
                0,
            )
        },
        bulkActionTestTimeout,
    )

    it(
        'sets the selected tickets to open and clears the selection on success',
        async () => {
            const { user } = renderTicketTable()
            await selectFirstRow(user)

            const statusListbox = await openStatusSelection(user)
            await user.click(
                within(statusListbox).getByRole('option', { name: 'Open' }),
            )

            await waitFor(() => {
                expect(mockState.handleSetStatusSpy).toHaveBeenCalledWith(
                    TicketStatus.Open,
                )
            })

            await waitForSelectionToClear()
        },
        bulkActionTestTimeout,
    )

    it(
        'sets the selected tickets to closed',
        async () => {
            const { user } = renderTicketTable()
            await selectFirstRow(user)

            const statusListbox = await openStatusSelection(user)
            await user.click(
                within(statusListbox).getByRole('option', { name: 'Close' }),
            )

            await waitFor(() => {
                expect(mockState.handleSetStatusSpy).toHaveBeenCalledWith(
                    TicketStatus.Closed,
                )
            })

            await waitForSelectionToClear()
        },
        bulkActionTestTimeout,
    )

    it(
        'assigns the selected tickets to an agent and clears the selection on success',
        async () => {
            const { user } = renderTicketTable()
            await selectFirstRow(user)
            await user.click(await getEnabledBulkControl('Assign agent'))
            const agentOptions = await screen.findAllByText('Agent Smith')
            await user.click(agentOptions[agentOptions.length - 1])

            expect(mockState.handleAssignUserSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 5,
                    name: 'Agent Smith',
                }),
            )

            await waitForSelectionToClear()
        },
        bulkActionTestTimeout,
    )

    it(
        'assigns the selected tickets to a team and clears the selection on success',
        async () => {
            const { user } = renderTicketTable()
            await selectFirstRow(user)
            await user.click(await getEnabledBulkControl('Assign team'))
            const supportOptions = await screen.findAllByText('Support')
            await user.click(supportOptions[supportOptions.length - 1])

            expect(mockState.handleAssignTeamSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 8,
                    name: 'Support',
                }),
            )

            await waitForSelectionToClear()
        },
        bulkActionTestTimeout,
    )

    it(
        'adds a tag to the selected tickets and clears the selection on success',
        async () => {
            const { user } = renderTicketTable()
            await selectFirstRow(user)
            await user.click(await getEnabledBulkControl('Add tag'))
            const vipOptions = await screen.findAllByText('VIP')
            await user.click(vipOptions[vipOptions.length - 1])

            expect(mockState.handleAddTagSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 11,
                    name: 'VIP',
                }),
            )

            await waitForSelectionToClear()
        },
        bulkActionTestTimeout,
    )

    it(
        'clears the selected team assignment when requested',
        async () => {
            const { user } = renderTicketTable()
            await selectFirstRow(user)
            await user.click(await getEnabledBulkControl('Assign team'))
            const noTeamOptions = await screen.findAllByText('No team')
            await user.click(noTeamOptions[noTeamOptions.length - 1])

            expect(mockState.handleAssignTeamSpy).toHaveBeenCalledWith(null)
        },
        bulkActionTestTimeout,
    )

    it('passes the bulk action loading state to the shortcut layer', async () => {
        const { user, rerender } = renderTicketTable()
        await selectFirstRow(user)

        mockState.isBulkActionLoading = true
        act(() => {
            rerenderTicketTable(rerender)
        })

        await waitFor(() => {
            expect(screen.getByLabelText('Status selection')).toBeDisabled()
            expect(screen.getByLabelText('Assign agent')).toBeDisabled()
            expect(screen.getByLabelText('Assign team')).toBeDisabled()
            expect(screen.getByLabelText('Add tag')).toBeDisabled()
            expect(
                screen.getByRole('button', { name: 'More actions' }),
            ).toBeDisabled()
        })
    })

    it('clears the selected ticket ids when the displayed tickets change', async () => {
        const { user, rerender } = renderTicketTable()
        await selectFirstRow(user)

        mockState.tickets = [
            { id: 3, subject: 'Replacement ticket' },
            { id: 4, subject: 'Another replacement ticket' },
        ]
        act(() => {
            rerenderTicketTable(rerender)
        })

        await waitFor(() => {
            expect(
                mockState.ticketListActionsArgsHistory.some(
                    ({ hasSelectedAll, selectedTicketIds, visibleTicketIds }) =>
                        !hasSelectedAll &&
                        selectedTicketIds.size === 0 &&
                        visibleTicketIds.join(',') === '3,4',
                ),
            ).toBe(true)
        })
    })

    it('clears the selected ticket ids when the sort order changes', async () => {
        const { user, rerender } = renderTicketTable()
        await selectFirstRow(user)

        mockState.sortOrder = 'updated_datetime:desc'
        act(() => {
            rerenderTicketTable(rerender)
        })

        await waitFor(() => {
            expect(
                mockState.ticketListActionsArgsHistory.some(
                    ({ hasSelectedAll, selectedTicketIds, visibleTicketIds }) =>
                        !hasSelectedAll &&
                        selectedTicketIds.size === 0 &&
                        visibleTicketIds.join(',') === '1,2',
                ),
            ).toBe(true)
        })
    })
})
