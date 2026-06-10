import { screen, waitFor, within } from '@testing-library/react'

import type * as HelpdeskQueriesModule from '@gorgias/helpdesk-queries'

import { render } from '../../../tests/render.utils'
import { TicketTable } from './TicketTable'

const { saveForEveryoneSpy, columnVisibilityConfig } = vi.hoisted(() => ({
    saveForEveryoneSpy: vi.fn(),
    columnVisibilityConfig: {
        defaultColumnOrder: [
            'ticket',
            'subject',
            'customer',
            'assignee',
            'status',
        ],
        defaultVisibleColumns: ['ticket', 'subject'],
        canSaveForEveryone: true,
        isSavingForEveryone: false,
        viewVisibility: 'public' as string,
    },
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')

    return {
        ...actual,
        useHistory: () => ({ push: vi.fn() }),
    }
})

vi.mock('@repo/preferences', () => ({
    useUserDateTimePreferences: () => ({
        dateFormat: 'en-US',
        timeFormat: '12h',
        timezone: 'UTC',
    }),
}))

vi.mock('@gorgias/helpdesk-queries', async () => {
    const actual = await vi.importActual<typeof HelpdeskQueriesModule>(
        '@gorgias/helpdesk-queries',
    )

    return {
        ...actual,
        useGetView: () => ({
            data: {
                data: {
                    id: 123,
                    visibility: columnVisibilityConfig.viewVisibility,
                },
            },
        }),
    }
})

vi.mock('../../../hooks/useCurrentUserId', () => ({
    useCurrentUserId: () => ({
        currentUserId: 321,
    }),
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

vi.mock('../../hooks/useBulkActionMenuState', () => ({
    useBulkActionMenuState: () => ({
        canUseRestrictedBulkActions: true,
    }),
}))

vi.mock('../../hooks/useIsTrashLikeView', () => ({
    useIsTrashLikeView: () => false,
}))

vi.mock('../../hooks/useMarkTicketAsRead', () => ({
    useMarkTicketAsRead: () => ({
        markAsRead: vi.fn(),
    }),
}))

vi.mock('../../hooks/useTicketListActions', () => ({
    useTicketListActions: () => ({
        isLoading: false,
        handleApplyMacro: vi.fn(),
        handleAddTag: vi.fn(),
        handleAssignTeam: vi.fn(),
        handleAssignUser: vi.fn(),
        handleChangePriority: vi.fn(),
        handleExportTickets: vi.fn(),
        handleMarkAsRead: vi.fn(),
        handleMarkAsUnread: vi.fn(),
        handleMoveToTrash: vi.fn(),
        handleUndelete: vi.fn(),
        handleDeleteForever: vi.fn(),
        handleSetStatus: vi.fn(),
    }),
}))

vi.mock('../../hooks/useTicketTableBulkActionShortcuts', () => ({
    useTicketTableBulkActionShortcuts: () => undefined,
}))

vi.mock('../../hooks/useTicketTableColumnVisibility', () => ({
    useTicketTableColumnVisibility: () => ({
        defaultColumnOrder: columnVisibilityConfig.defaultColumnOrder,
        defaultVisibleColumns: columnVisibilityConfig.defaultVisibleColumns,
        onLocalChange: vi.fn(),
        onColumnOrderChange: vi.fn(),
        saveForEveryone: saveForEveryoneSpy,
        canSaveForEveryone: columnVisibilityConfig.canSaveForEveryone,
        isSavingForEveryone: columnVisibilityConfig.isSavingForEveryone,
    }),
}))

vi.mock('../../hooks/useTicketTableData', () => ({
    useTicketTableData: () => ({
        items: [{ id: 1, subject: 'First ticket' }],
        isLoading: false,
        hasNextPage: false,
        hasPreviousPage: false,
        onPageChange: vi.fn(),
        onSortChange: vi.fn(),
        onRefresh: vi.fn(),
        sortOrder: 'last_message_datetime:desc',
        error: null,
    }),
}))

vi.mock('../../hooks/useViewVisibleTickets', () => ({
    useViewVisibleTickets: () => ({
        viewVisibleTickets: vi.fn(),
    }),
}))

vi.mock('./components/TicketTableBulkActions', () => ({
    TicketTableBulkActions: () => <div />,
}))

vi.mock('./TicketTableColumns', () => ({
    createTicketTableColumns: () => [
        {
            id: 'ticket',
            accessorKey: 'subject',
            header: 'Ticket',
            enableHiding: false,
        },
        { id: 'subject', accessorKey: 'subject', header: 'Subject' },
        { id: 'customer', accessorKey: 'subject', header: 'Customer' },
        { id: 'assignee', accessorKey: 'subject', header: 'Assignee' },
        { id: 'status', accessorKey: 'subject', header: 'Status' },
    ],
}))

const PERSISTENCE_KEY = 'axiom-datatable-ticket-table-123'

function seedDivergedColumns() {
    window.localStorage.setItem(
        PERSISTENCE_KEY,
        JSON.stringify({
            visibleColumns: ['ticket', 'subject', 'customer'],
            columnOrder: [
                'ticket',
                'subject',
                'customer',
                'assignee',
                'status',
            ],
        }),
    )
}

async function openColumnEditingPanel(user: ReturnType<typeof render>['user']) {
    await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /edit table/i }))
}

async function findColumnEditingPanel() {
    return screen.findByRole('dialog')
}

describe('TicketTable column editing footer', () => {
    beforeEach(() => {
        window.localStorage.clear()
        saveForEveryoneSpy.mockReset()
        saveForEveryoneSpy.mockResolvedValue(undefined)
        columnVisibilityConfig.defaultColumnOrder = [
            'ticket',
            'subject',
            'customer',
            'assignee',
            'status',
        ]
        columnVisibilityConfig.defaultVisibleColumns = ['ticket', 'subject']
        columnVisibilityConfig.canSaveForEveryone = true
        columnVisibilityConfig.isSavingForEveryone = false
        columnVisibilityConfig.viewVisibility = 'public'
    })

    it('lists the configured columns in the column editing panel', async () => {
        const { user } = render(<TicketTable viewId={123} />)

        await openColumnEditingPanel(user)

        const panel = await findColumnEditingPanel()
        expect(within(panel).getByText('Customer')).toBeInTheDocument()
        expect(within(panel).getByText('Assignee')).toBeInTheDocument()
        expect(within(panel).getByText('Status')).toBeInTheDocument()
    })

    it('shows the footer actions when the visible columns diverge from the saved view', async () => {
        seedDivergedColumns()

        const { user } = render(<TicketTable viewId={123} />)

        await openColumnEditingPanel(user)
        const panel = await findColumnEditingPanel()

        expect(
            await within(panel).findByRole('button', {
                name: /restore saved view/i,
            }),
        ).toBeInTheDocument()
        expect(
            within(panel).getByRole('button', { name: /save for everyone/i }),
        ).toBeInTheDocument()
    })

    it('does not show the footer when the visible columns match the saved view', async () => {
        columnVisibilityConfig.defaultVisibleColumns = [
            'ticket',
            'subject',
            'customer',
            'assignee',
            'status',
        ]

        const { user } = render(<TicketTable viewId={123} />)

        await openColumnEditingPanel(user)
        const panel = await findColumnEditingPanel()

        expect(
            within(panel).queryByRole('button', {
                name: /restore saved view/i,
            }),
        ).not.toBeInTheDocument()
    })

    it('does not show the footer for private views', async () => {
        columnVisibilityConfig.viewVisibility = 'private'
        seedDivergedColumns()

        const { user } = render(<TicketTable viewId={123} />)

        await openColumnEditingPanel(user)
        const panel = await findColumnEditingPanel()

        expect(
            within(panel).queryByRole('button', {
                name: /restore saved view/i,
            }),
        ).not.toBeInTheDocument()
    })

    it('does not show the footer for draft views', async () => {
        seedDivergedColumns()

        const { user } = render(<TicketTable viewId={123} isDraftView />)

        await openColumnEditingPanel(user)
        const panel = await findColumnEditingPanel()

        expect(
            within(panel).queryByRole('button', {
                name: /restore saved view/i,
            }),
        ).not.toBeInTheDocument()
    })

    it('hides the save action when the user cannot save for everyone', async () => {
        columnVisibilityConfig.canSaveForEveryone = false
        seedDivergedColumns()

        const { user } = render(<TicketTable viewId={123} />)

        await openColumnEditingPanel(user)
        const panel = await findColumnEditingPanel()

        expect(
            await within(panel).findByRole('button', {
                name: /restore saved view/i,
            }),
        ).toBeInTheDocument()
        expect(
            within(panel).queryByRole('button', {
                name: /save for everyone/i,
            }),
        ).not.toBeInTheDocument()
    })

    it('clears persisted state and closes the panel when restoring the saved view', async () => {
        seedDivergedColumns()

        const { user } = render(<TicketTable viewId={123} />)

        await openColumnEditingPanel(user)
        const panel = await findColumnEditingPanel()
        await user.click(
            await within(panel).findByRole('button', {
                name: /restore saved view/i,
            }),
        )

        await waitFor(() => {
            expect(window.localStorage.getItem(PERSISTENCE_KEY)).toBeNull()
        })
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    it('saves columns for everyone and shows a success toast', async () => {
        seedDivergedColumns()

        const { user } = render(<TicketTable viewId={123} />)

        await openColumnEditingPanel(user)
        const panel = await findColumnEditingPanel()
        await user.click(
            await within(panel).findByRole('button', {
                name: /save for everyone/i,
            }),
        )

        await waitFor(() => {
            expect(saveForEveryoneSpy).toHaveBeenCalledTimes(1)
        })
        expect(saveForEveryoneSpy).toHaveBeenCalledWith(
            expect.arrayContaining(['subject', 'customer']),
        )
        expect(
            await screen.findByText('Columns saved for everyone'),
        ).toBeInTheDocument()
    })

    it('shows an error toast when saving columns for everyone fails', async () => {
        saveForEveryoneSpy.mockRejectedValue(new Error('boom'))
        seedDivergedColumns()

        // The footer's save handler rethrows on failure so the panel stays
        // open; that rejection is surfaced through React's event system and is
        // expected here, so swallow it to keep the run free of noise.
        const swallowExpectedRejection = (reason: unknown) => {
            if (
                reason instanceof Error &&
                reason.message === 'Failed to save columns for everyone'
            ) {
                return
            }

            throw reason
        }
        process.on('unhandledRejection', swallowExpectedRejection)

        try {
            const { user } = render(<TicketTable viewId={123} />)

            await openColumnEditingPanel(user)
            const panel = await findColumnEditingPanel()
            await user.click(
                await within(panel).findByRole('button', {
                    name: /save for everyone/i,
                }),
            )

            expect(
                await screen.findByText('Failed to save columns for everyone'),
            ).toBeInTheDocument()
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        } finally {
            process.off('unhandledRejection', swallowExpectedRejection)
        }
    })
})
