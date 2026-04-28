import type { ReactNode } from 'react'

import { act } from '@testing-library/react'

import type * as AxiomModule from '@gorgias/axiom'
import type * as HelpdeskQueriesModule from '@gorgias/helpdesk-queries'

import { render } from '../../../tests/render.utils'
import { TicketTable } from './TicketTable'

const {
    createLocalStoragePersistenceMock,
    persistenceClearMock,
    saveForEveryoneSpy,
    toastSuccessMock,
    toastErrorMock,
    setIsOpenMock,
    latestFooterProps,
    latestDataTableProps,
    columnEditingConfig,
} = vi.hoisted(() => ({
    createLocalStoragePersistenceMock: vi.fn(),
    persistenceClearMock: vi.fn(),
    saveForEveryoneSpy: vi.fn(),
    toastSuccessMock: vi.fn(),
    toastErrorMock: vi.fn(),
    setIsOpenMock: vi.fn(),
    columnEditingConfig: {
        defaultColumnOrder: ['ticket', 'subject', 'customer'],
        defaultVisibleColumns: ['ticket', 'subject'],
        canSaveForEveryone: true,
        isSavingForEveryone: false,
        viewVisibility: 'public',
        orderedColumns: ['ticket', 'customer'],
        visibleColumns: ['ticket', 'customer'],
    },
    latestDataTableProps: {
        current: null as {
            columnEditing?: {
                defaultColumnOrder?: string[]
                defaultVisibleColumns?: string[]
            }
        } | null,
    },
    latestFooterProps: {
        current: null as {
            visibleColumns: string[]
            canSaveForEveryone: boolean
            isSavingForEveryone: boolean
            onClose: () => void
            onResetToDefault: () => void
            onSaveForEveryone: (visibleColumns: string[]) => Promise<void>
        } | null,
    },
}))

vi.mock('@gorgias/axiom', async () => {
    const actual = await vi.importActual<typeof AxiomModule>('@gorgias/axiom')

    return {
        ...actual,
        DataTable: ({
            columnEditing,
            topContent,
            children,
        }: {
            columnEditing?: {
                defaultColumnOrder?: string[]
                defaultVisibleColumns?: string[]
            }
            topContent?: ReactNode
            children?: ReactNode
        }) => {
            latestDataTableProps.current = { columnEditing }

            return (
                <div>
                    <div role="table" />
                    {topContent}
                    {children}
                </div>
            )
        },
        DataTablePagination: () => <div />,
        createLocalStoragePersistence: createLocalStoragePersistenceMock,
        toast: {
            success: toastSuccessMock,
            error: toastErrorMock,
        },
    }
})

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
                    visibility: columnEditingConfig.viewVisibility,
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
        defaultColumnOrder: columnEditingConfig.defaultColumnOrder,
        defaultVisibleColumns: columnEditingConfig.defaultVisibleColumns,
        onLocalChange: vi.fn(),
        onColumnOrderChange: vi.fn(),
        saveForEveryone: saveForEveryoneSpy,
        canSaveForEveryone: columnEditingConfig.canSaveForEveryone,
        isSavingForEveryone: columnEditingConfig.isSavingForEveryone,
    }),
}))

vi.mock('../../hooks/useTicketTableData', () => ({
    useTicketTableData: () => ({
        items: [],
        isLoading: false,
        hasNextPage: false,
        hasPreviousPage: false,
        currentPageIndex: 0,
        onPageChange: vi.fn(),
        onPageSizeChange: vi.fn(),
        onSortChange: vi.fn(),
        onRefresh: vi.fn(),
        pageSize: 20,
        sortOrder: 'last_message_datetime:desc',
        error: null,
    }),
}))

vi.mock('../../hooks/useViewVisibleTickets', () => ({
    useViewVisibleTickets: () => ({
        viewVisibleTickets: vi.fn(),
    }),
}))

vi.mock('./TicketTableColumns', () => ({
    createTicketTableColumns: () => [
        {
            id: 'ticket',
            accessorKey: 'subject',
            header: 'Ticket',
        },
    ],
}))

vi.mock('./components/TicketTableColumnEditingFooter', () => ({
    TicketTableColumnEditingFooter: (
        props: (typeof latestFooterProps)['current'],
    ) => {
        latestFooterProps.current = props
        return <div>Column editing footer</div>
    },
}))

vi.mock('./components/TicketTableBulkActions', () => ({
    TicketTableBulkActions: ({
        columnEditingFooter,
    }: {
        columnEditingFooter?: (props: {
            visibleColumns: string[]
            orderedColumns: string[]
            setVisibleColumns: (columns: string[]) => void
            setIsOpen: (isOpen: boolean) => void
        }) => ReactNode
    }) => (
        <div>
            {columnEditingFooter?.({
                visibleColumns: columnEditingConfig.visibleColumns,
                orderedColumns: columnEditingConfig.orderedColumns,
                setVisibleColumns: vi.fn(),
                setIsOpen: setIsOpenMock,
            })}
        </div>
    ),
}))

describe('TicketTable column editing footer wiring', () => {
    beforeEach(() => {
        persistenceClearMock.mockReset()
        createLocalStoragePersistenceMock.mockReset()
        createLocalStoragePersistenceMock.mockReturnValue({
            clear: persistenceClearMock,
            ready: vi.fn().mockResolvedValue(undefined),
            getItem: vi.fn(),
            observeTable: vi.fn(() => ({ unsubscribe: vi.fn() })),
        })
        saveForEveryoneSpy.mockReset()
        saveForEveryoneSpy.mockResolvedValue(undefined)
        toastSuccessMock.mockReset()
        toastErrorMock.mockReset()
        setIsOpenMock.mockReset()
        latestDataTableProps.current = null
        latestFooterProps.current = null
        columnEditingConfig.defaultColumnOrder = [
            'ticket',
            'subject',
            'customer',
        ]
        columnEditingConfig.defaultVisibleColumns = ['ticket', 'subject']
        columnEditingConfig.canSaveForEveryone = true
        columnEditingConfig.isSavingForEveryone = false
        columnEditingConfig.viewVisibility = 'public'
        columnEditingConfig.orderedColumns = ['ticket', 'customer']
        columnEditingConfig.visibleColumns = ['ticket', 'customer']
    })

    it('passes default visible columns and column order to column editing', () => {
        columnEditingConfig.defaultColumnOrder = [
            'ticket',
            'assignee',
            'customer',
            'status',
        ]
        columnEditingConfig.defaultVisibleColumns = [
            'ticket',
            'assignee',
            'customer',
        ]

        render(<TicketTable viewId={123} />)

        expect(latestDataTableProps.current?.columnEditing).toMatchObject({
            defaultColumnOrder: ['ticket', 'assignee', 'customer', 'status'],
            defaultVisibleColumns: ['ticket', 'assignee', 'customer'],
        })
    })

    it('does not render the footer when backend-managed columns match the saved view', () => {
        columnEditingConfig.defaultVisibleColumns = [
            'select',
            'ticket',
            'customer',
        ]

        render(<TicketTable viewId={123} />)

        expect(latestFooterProps.current).toBeNull()
    })

    it('does not render the footer for private views', () => {
        columnEditingConfig.viewVisibility = 'private'

        render(<TicketTable viewId={123} />)

        expect(latestFooterProps.current).toBeNull()
    })

    it('does not render the footer for draft views', () => {
        render(<TicketTable viewId={123} isDraftView={true} />)

        expect(latestFooterProps.current).toBeNull()
    })

    it('passes save permissions and loading state to the footer when columns diverge', () => {
        columnEditingConfig.canSaveForEveryone = false
        columnEditingConfig.isSavingForEveryone = true

        render(<TicketTable viewId={123} />)

        expect(latestFooterProps.current).not.toBeNull()
        expect(latestFooterProps.current).toMatchObject({
            canSaveForEveryone: false,
            isSavingForEveryone: true,
            visibleColumns: ['ticket', 'customer'],
        })
    })

    it('closes the column editing panel through setIsOpen(false)', () => {
        render(<TicketTable viewId={123} />)

        expect(latestFooterProps.current).not.toBeNull()

        act(() => {
            latestFooterProps.current?.onClose()
        })

        expect(setIsOpenMock).toHaveBeenCalledWith(false)
    })

    it('does nothing when resetting without a persistence adapter', () => {
        createLocalStoragePersistenceMock.mockReturnValue(undefined)

        render(<TicketTable viewId={123} />)

        expect(latestFooterProps.current).not.toBeNull()

        act(() => {
            latestFooterProps.current?.onResetToDefault()
        })

        expect(persistenceClearMock).not.toHaveBeenCalled()
    })

    it('clears persisted state when resetting to the saved view', () => {
        render(<TicketTable viewId={123} />)

        expect(latestFooterProps.current).not.toBeNull()

        act(() => {
            latestFooterProps.current?.onResetToDefault()
        })

        expect(persistenceClearMock).toHaveBeenCalledTimes(1)
    })

    it('shows a success toast when saving columns for everyone succeeds', async () => {
        render(<TicketTable viewId={123} />)

        expect(latestFooterProps.current).not.toBeNull()

        await latestFooterProps.current?.onSaveForEveryone([
            'ticket',
            'customer',
        ])

        expect(saveForEveryoneSpy).toHaveBeenCalledWith(['ticket', 'customer'])
        expect(toastSuccessMock).toHaveBeenCalledWith(
            'Columns saved for everyone',
        )
    })

    it('shows an error toast and rethrows when saving columns for everyone fails', async () => {
        saveForEveryoneSpy.mockRejectedValue(new Error('boom'))
        render(<TicketTable viewId={123} />)

        expect(latestFooterProps.current).not.toBeNull()

        await expect(
            latestFooterProps.current?.onSaveForEveryone([
                'ticket',
                'customer',
            ]),
        ).rejects.toThrow('Failed to save columns for everyone')

        expect(toastErrorMock).toHaveBeenCalledWith(
            'Failed to save columns for everyone',
        )
    })
})
