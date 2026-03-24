import { UserRole } from '@repo/utils'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

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
import { render, testAppQueryClient } from '../../../tests/render.utils'
import { TicketStatus } from '../../../types/ticket'
import { TicketTable } from './TicketTable'

const { pushMock } = vi.hoisted(() => ({
    pushMock: vi.fn(),
    getItemMock: vi.fn(),
    clearMock: vi.fn().mockResolvedValue(undefined),
    readyMock: vi.fn().mockResolvedValue(undefined),
    unsubscribeMock: vi.fn(),
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

const mockState = {
    sortOrder: 'last_message_datetime:desc',
    viewFilters: '',
    tickets: [] as Array<{ id: number; subject: string }>,
    isBulkActionLoading: false,
    handleApplyMacroSpy: vi.fn(),
    handleAddTagSpy: vi.fn(),
    handleChangePrioritySpy: vi.fn(),
    handleExportTicketsSpy: vi.fn(),
    handleMarkAsReadSpy: vi.fn(),
    handleMarkAsUnreadSpy: vi.fn(),
    handleMoveToTrashSpy: vi.fn(),
    handleUndeleteSpy: vi.fn(),
    handleDeleteForeverSpy: vi.fn(),
    handleSetStatusSpy: vi.fn(),
    handleAssignUserSpy: vi.fn(),
    handleAssignTeamSpy: vi.fn(),
    markAsRead: vi.fn(),
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
        markAsRead: mockState.markAsRead,
    }),
}))

vi.mock('../../hooks/useSortOrder', () => ({
    useSortOrder: () => [mockState.sortOrder, mockState.setSortOrder],
}))

vi.mock('../../hooks/useTicketsList', () => ({
    useTicketsList: () => ({
        tickets: mockState.tickets,
        fetchNextPage: vi.fn(),
        hasNextPage: false,
        isLoading: false,
        isFetchingNextPage: false,
        error: null,
        refetch: vi.fn(),
    }),
}))

vi.mock('../../hooks/useTicketTableColumnVisibility', () => ({
    useTicketTableColumnVisibility: () => ({
        defaultVisibleColumns: ['subject'],
        onChange: vi.fn(),
    }),
}))

vi.mock('../../hooks/useViewVisibleTickets', () => ({
    useViewVisibleTickets: () => ({
        viewVisibleTickets: vi.fn(),
    }),
}))

vi.mock('../../hooks/useTicketListActions', () => ({
    useTicketListActions: ({
        onActionComplete,
    }: {
        onActionComplete: () => void
    }) => ({
        isLoading: mockState.isBulkActionLoading,
        handleApplyMacro: () => {
            mockState.handleApplyMacroSpy()
            onActionComplete()
        },
        handleAddTag: async (tag: { id: number; name: string }) => {
            mockState.handleAddTagSpy(tag)
            onActionComplete()
        },
        handleSetStatus: async (status: TicketStatus) => {
            mockState.handleSetStatusSpy(status)
            onActionComplete()
        },
        handleAssignUser: async (user: { id: number; name: string } | null) => {
            mockState.handleAssignUserSpy(user)
            onActionComplete()
        },
        handleAssignTeam: async (team: { id: number; name: string } | null) => {
            mockState.handleAssignTeamSpy(team)
            onActionComplete()
        },
        handleChangePriority: async (priority: string) => {
            mockState.handleChangePrioritySpy(priority)
            onActionComplete()
        },
        handleExportTickets: async () => {
            mockState.handleExportTicketsSpy()
            onActionComplete()
        },
        handleMarkAsRead: async () => {
            mockState.handleMarkAsReadSpy()
            onActionComplete()
        },
        handleMarkAsUnread: async () => {
            mockState.handleMarkAsUnreadSpy()
            onActionComplete()
        },
        handleMoveToTrash: async () => {
            mockState.handleMoveToTrashSpy()
            onActionComplete()
        },
        handleUndelete: async (options?: {
            removeFromCurrentViewCache?: boolean
        }) => {
            mockState.handleUndeleteSpy(options)
            onActionComplete()
        },
        handleDeleteForever: async () => {
            mockState.handleDeleteForeverSpy()
            onActionComplete()
        },
    }),
}))

vi.mock('./TicketTableColumns', () => ({
    createTicketTableColumns: () => [
        {
            id: 'subject',
            accessorKey: 'subject',
            header: 'Ticket',
        },
    ],
}))

function renderTicketTable() {
    return render(<TicketTable viewId={123} />)
}

async function openBulkMoreActionsMenu(
    user: ReturnType<typeof render>['user'],
) {
    await user.click(screen.getByRole('button', { name: 'More actions' }))

    await waitFor(() => {
        expect(
            screen.getByRole('menuitem', { name: /mark as read/i }),
        ).toBeInTheDocument()
    })
}

async function waitForTicketTableToBeReady() {
    await waitFor(() => {
        expect(testAppQueryClient.isFetching()).toBe(0)
        expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(1)
    })
}

async function waitForBulkControlsToBeReady() {
    await waitFor(() => {
        expect(screen.getByLabelText('Status selection')).toBeEnabled()
        expect(screen.getByLabelText('Assign agent')).toBeEnabled()
        expect(screen.getByLabelText('Assign team')).toBeEnabled()
        expect(screen.getByLabelText('Add tag')).toBeEnabled()
    })
}

const mockUseListTagsSearch = vi.mocked(useListTagsSearch)
const mockUseCreateTicketTag = vi.mocked(useCreateTicketTag)
const agentUser = mockUser({
    id: 1,
    email: 'agent@test.com',
    firstname: 'Test',
    lastname: 'Agent',
    role: { name: UserRole.Agent },
})

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('TicketTable', () => {
    beforeEach(() => {
        testAppQueryClient.clear()
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
            mockListUsers.handler,
            mockListTeams.handler,
        )
        mockState.sortOrder = 'last_message_datetime:desc'
        mockState.viewFilters = ''
        mockState.tickets = [
            { id: 1, subject: 'First ticket' },
            { id: 2, subject: 'Second ticket' },
        ]
        mockState.isBulkActionLoading = false
        mockState.handleApplyMacroSpy.mockReset()
        mockState.handleAddTagSpy.mockReset()
        mockState.handleChangePrioritySpy.mockReset()
        mockState.handleExportTicketsSpy.mockReset()
        mockState.handleMarkAsReadSpy.mockReset()
        mockState.handleMarkAsUnreadSpy.mockReset()
        mockState.handleMoveToTrashSpy.mockReset()
        mockState.handleUndeleteSpy.mockReset()
        mockState.handleDeleteForeverSpy.mockReset()
        mockState.handleSetStatusSpy.mockReset()
        mockState.handleAssignUserSpy.mockReset()
        mockState.handleAssignTeamSpy.mockReset()
        pushMock.mockReset()
        mockState.markAsRead.mockReset()
        mockState.setSortOrder.mockReset()
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

    it('enables the bulk action controls and shows the selected count when a row is selected', async () => {
        const { user } = renderTicketTable()
        await waitForTicketTableToBeReady()

        const rowCheckbox = screen.getAllByRole('checkbox')[1]
        await user.click(rowCheckbox)
        await waitForBulkControlsToBeReady()

        expect(screen.getAllByText('1 items selected')).not.toHaveLength(0)
        expect(
            screen.getByRole('button', { name: 'More actions' }),
        ).toBeEnabled()
    })

    it('passes the trash-like view context to the bulk menu when the view filters are trash-like', async () => {
        mockState.viewFilters = 'isNotEmpty(ticket.trashed_datetime)'
        const { user } = renderTicketTable()
        await waitForTicketTableToBeReady()

        await user.click(screen.getAllByRole('checkbox')[1])
        await openBulkMoreActionsMenu(user)

        expect(
            screen.getByRole('menuitem', { name: /undelete/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('menuitem', { name: /delete forever/i }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('menuitem', { name: /^delete$/i }),
        ).not.toBeInTheDocument()
    })

    it('wires mark as read through the bulk more actions menu', async () => {
        const { user } = renderTicketTable()
        await waitForTicketTableToBeReady()

        await user.click(screen.getAllByRole('checkbox')[1])
        await openBulkMoreActionsMenu(user)
        await user.click(
            screen.getByRole('menuitem', { name: /mark as read/i }),
        )

        expect(mockState.handleMarkAsReadSpy).toHaveBeenCalledTimes(1)
    })

    it('passes the trash-view cache removal option when undeleting from the bulk more actions menu', async () => {
        mockState.viewFilters = 'isNotEmpty(ticket.trashed_datetime)'
        const { user } = renderTicketTable()
        await waitForTicketTableToBeReady()

        await user.click(screen.getAllByRole('checkbox')[1])
        await openBulkMoreActionsMenu(user)
        await user.click(screen.getByRole('menuitem', { name: /undelete/i }))

        expect(mockState.handleUndeleteSpy).toHaveBeenCalledWith({
            removeFromCurrentViewCache: true,
        })
    })

    it('sets the selected tickets to open and clears the selection on success', async () => {
        const { user } = renderTicketTable()
        await waitForTicketTableToBeReady()

        await user.click(screen.getAllByRole('checkbox')[1])
        await user.click(screen.getByLabelText('Status selection'))
        await user.click(screen.getByRole('option', { name: 'Open' }))

        expect(mockState.handleSetStatusSpy).toHaveBeenCalledWith(
            TicketStatus.Open,
        )

        await waitFor(() => {
            expect(screen.queryAllByText('1 items selected')).toHaveLength(0)
        })

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

    it('sets the selected tickets to closed', async () => {
        const { user } = renderTicketTable()
        await waitForTicketTableToBeReady()

        await user.click(screen.getAllByRole('checkbox')[1])
        await user.click(screen.getByLabelText('Status selection'))
        await user.click(screen.getByRole('option', { name: 'Close' }))

        expect(mockState.handleSetStatusSpy).toHaveBeenCalledWith(
            TicketStatus.Closed,
        )
    })

    it('assigns the selected tickets to an agent and clears the selection on success', async () => {
        const { user } = renderTicketTable()
        await waitForTicketTableToBeReady()

        await user.click(screen.getAllByRole('checkbox')[1])
        await waitForBulkControlsToBeReady()
        await user.click(screen.getByLabelText('Assign agent'))
        const agentOptions = await screen.findAllByText('Agent Smith')
        await user.click(agentOptions[agentOptions.length - 1])

        expect(mockState.handleAssignUserSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 5,
                name: 'Agent Smith',
            }),
        )

        await waitFor(() => {
            expect(screen.queryAllByText('1 items selected')).toHaveLength(0)
        })

        expect(screen.queryByLabelText('Assign agent')).not.toBeInTheDocument()
    })

    it('assigns the selected tickets to a team and clears the selection on success', async () => {
        const { user } = renderTicketTable()
        await waitForTicketTableToBeReady()

        await user.click(screen.getAllByRole('checkbox')[1])
        await waitForBulkControlsToBeReady()
        await user.click(screen.getByLabelText('Assign team'))
        const supportOptions = await screen.findAllByText('Support')
        await user.click(supportOptions[supportOptions.length - 1])

        expect(mockState.handleAssignTeamSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 8,
                name: 'Support',
            }),
        )

        await waitFor(() => {
            expect(screen.queryAllByText('1 items selected')).toHaveLength(0)
        })

        expect(screen.queryByLabelText('Assign team')).not.toBeInTheDocument()
    })

    it('adds a tag to the selected tickets and clears the selection on success', async () => {
        const { user } = renderTicketTable()
        await waitForTicketTableToBeReady()

        await user.click(screen.getAllByRole('checkbox')[1])
        await waitForBulkControlsToBeReady()
        await user.click(screen.getByLabelText('Add tag'))
        const vipOptions = await screen.findAllByText('VIP')
        await user.click(vipOptions[vipOptions.length - 1])

        expect(mockState.handleAddTagSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 11,
                name: 'VIP',
            }),
        )

        await waitFor(() => {
            expect(screen.queryAllByText('1 items selected')).toHaveLength(0)
        })

        expect(screen.queryByLabelText('Add tag')).not.toBeInTheDocument()
    })

    it('clears the selected team assignment when requested', async () => {
        const { user } = renderTicketTable()
        await waitForTicketTableToBeReady()

        await user.click(screen.getAllByRole('checkbox')[1])
        await waitForBulkControlsToBeReady()
        await user.click(screen.getByLabelText('Assign team'))
        const noTeamOptions = await screen.findAllByText('No team')
        await user.click(noTeamOptions[noTeamOptions.length - 1])

        expect(mockState.handleAssignTeamSpy).toHaveBeenCalledWith(null)
    })

    it('disables team assignment while the bulk action is loading', async () => {
        const { user, rerender } = renderTicketTable()
        await waitForTicketTableToBeReady()

        await user.click(screen.getAllByRole('checkbox')[1])
        await waitForBulkControlsToBeReady()

        mockState.isBulkActionLoading = true
        rerender(<TicketTable viewId={123} />)

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

    it('clears the selection when the displayed tickets change', async () => {
        const { user, rerender } = renderTicketTable()
        await waitForTicketTableToBeReady()

        await user.click(screen.getAllByRole('checkbox')[1])
        await waitFor(() => {
            expect(screen.getAllByText('1 items selected')).not.toHaveLength(0)
        })

        mockState.tickets = [
            { id: 3, subject: 'Replacement ticket' },
            { id: 4, subject: 'Another replacement ticket' },
        ]
        rerender(<TicketTable viewId={123} />)

        await waitFor(() => {
            expect(screen.queryAllByText('1 items selected')).toHaveLength(0)
        })

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

    it('clears the selection when the sort order changes', async () => {
        const { user, rerender } = renderTicketTable()
        await waitForTicketTableToBeReady()

        await user.click(screen.getAllByRole('checkbox')[1])
        await waitFor(() => {
            expect(screen.getAllByText('1 items selected')).not.toHaveLength(0)
        })

        mockState.sortOrder = 'updated_datetime:desc'
        rerender(<TicketTable viewId={123} />)

        await waitFor(() => {
            expect(screen.queryAllByText('1 items selected')).toHaveLength(0)
        })

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
})
