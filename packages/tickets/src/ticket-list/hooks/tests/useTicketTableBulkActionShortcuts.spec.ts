import { shortcutManager } from '@repo/utils'
import { renderHook } from '@testing-library/react'

import { TicketStatus } from '../../../types/ticket'
import { useTicketTableBulkActionShortcuts } from '../useTicketTableBulkActionShortcuts'

type ShortcutAction = {
    action?: (event: Event) => void
}

vi.mock('@repo/utils', async (importOriginal) => ({
    ...((await importOriginal()) as Record<string, unknown>),
    shortcutManager: {
        bind: vi.fn(),
        unbind: vi.fn(),
    },
    useShortcuts: (
        component: string,
        actions: Record<string, ShortcutAction>,
    ) => {
        shortcutManager.bind(component, actions)
    },
}))

function setup(
    overrides: Partial<
        Parameters<typeof useTicketTableBulkActionShortcuts>[0]
    > = {},
) {
    const params = {
        hasSelection: true,
        isBulkActionLoading: false,
        canUseRestrictedBulkActions: true,
        isTrashLikeView: false,
        handleOpenAssignUser: vi.fn(),
        handleOpenTags: vi.fn(),
        handleApplyMacro: vi.fn(),
        handleSetStatus: vi.fn(),
        handleMarkAsRead: vi.fn(),
        handleMarkAsUnread: vi.fn(),
        handleMoveToTrash: vi.fn(),
        handleDeleteForever: vi.fn(),
        ...overrides,
    }

    renderHook(() => useTicketTableBulkActionShortcuts(params))

    const [, actions] = vi.mocked(shortcutManager.bind).mock.calls.at(-1) ?? []

    return {
        params,
        actions: actions as Record<string, ShortcutAction>,
    }
}

describe('useTicketTableBulkActionShortcuts', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('binds the shortcuts to TicketListActions', () => {
        setup()

        expect(shortcutManager.bind).toHaveBeenCalledWith(
            'TicketListActions',
            expect.any(Object),
        )
    })

    it('calls handleSetStatus with closed when CLOSE_TICKET is triggered', () => {
        const { params, actions } = setup()

        actions.CLOSE_TICKET.action?.(new Event('keydown'))

        expect(params.handleSetStatus).toHaveBeenCalledWith(TicketStatus.Closed)
    })

    it('calls handleSetStatus with open when OPEN_TICKET is triggered', () => {
        const { params, actions } = setup()

        actions.OPEN_TICKET.action?.(new Event('keydown'))

        expect(params.handleSetStatus).toHaveBeenCalledWith(TicketStatus.Open)
    })

    it('calls the unread handlers when read shortcuts are triggered', () => {
        const { params, actions } = setup()

        actions.MARK_TICKET_READ.action?.(new Event('keydown'))
        actions.MARK_TICKET_UNREAD.action?.(new Event('keydown'))

        expect(params.handleMarkAsRead).toHaveBeenCalledTimes(1)
        expect(params.handleMarkAsUnread).toHaveBeenCalledTimes(1)
    })

    it('calls handleApplyMacro when OPEN_MACRO is triggered', () => {
        const { params, actions } = setup()

        actions.OPEN_MACRO.action?.(new Event('keydown'))

        expect(params.handleApplyMacro).toHaveBeenCalledTimes(1)
    })

    it('opens the assign user control when OPEN_ASSIGNEE is triggered', () => {
        const { params, actions } = setup()

        actions.OPEN_ASSIGNEE.action?.(new Event('keydown'))

        expect(params.handleOpenAssignUser).toHaveBeenCalledTimes(1)
    })

    it('opens the add tag control when OPEN_TAGS is triggered', () => {
        const { params, actions } = setup()

        actions.OPEN_TAGS.action?.(new Event('keydown'))

        expect(params.handleOpenTags).toHaveBeenCalledTimes(1)
    })

    it('calls handleMoveToTrash in non-trash views when DELETE_TICKET is triggered', () => {
        const { params, actions } = setup({ isTrashLikeView: false })

        actions.DELETE_TICKET.action?.(new Event('keydown'))

        expect(params.handleMoveToTrash).toHaveBeenCalledTimes(1)
        expect(params.handleDeleteForever).not.toHaveBeenCalled()
    })

    it('calls handleDeleteForever in trash-like views when DELETE_TICKET is triggered', () => {
        const { params, actions } = setup({ isTrashLikeView: true })

        actions.DELETE_TICKET.action?.(new Event('keydown'))

        expect(params.handleDeleteForever).toHaveBeenCalledTimes(1)
        expect(params.handleMoveToTrash).not.toHaveBeenCalled()
    })

    it('does nothing when there is no selection', () => {
        const { params, actions } = setup({ hasSelection: false })

        actions.CLOSE_TICKET.action?.(new Event('keydown'))
        actions.OPEN_TICKET.action?.(new Event('keydown'))
        actions.MARK_TICKET_READ.action?.(new Event('keydown'))
        actions.MARK_TICKET_UNREAD.action?.(new Event('keydown'))
        actions.OPEN_MACRO.action?.(new Event('keydown'))
        actions.DELETE_TICKET.action?.(new Event('keydown'))

        expect(params.handleSetStatus).not.toHaveBeenCalled()
        expect(params.handleOpenAssignUser).not.toHaveBeenCalled()
        expect(params.handleOpenTags).not.toHaveBeenCalled()
        expect(params.handleMarkAsRead).not.toHaveBeenCalled()
        expect(params.handleMarkAsUnread).not.toHaveBeenCalled()
        expect(params.handleApplyMacro).not.toHaveBeenCalled()
        expect(params.handleMoveToTrash).not.toHaveBeenCalled()
        expect(params.handleDeleteForever).not.toHaveBeenCalled()
    })

    it('does nothing when bulk actions are loading', () => {
        const { params, actions } = setup({ isBulkActionLoading: true })

        actions.CLOSE_TICKET.action?.(new Event('keydown'))
        actions.OPEN_ASSIGNEE.action?.(new Event('keydown'))
        actions.OPEN_TAGS.action?.(new Event('keydown'))
        actions.OPEN_MACRO.action?.(new Event('keydown'))
        actions.DELETE_TICKET.action?.(new Event('keydown'))

        expect(params.handleSetStatus).not.toHaveBeenCalled()
        expect(params.handleOpenAssignUser).not.toHaveBeenCalled()
        expect(params.handleOpenTags).not.toHaveBeenCalled()
        expect(params.handleApplyMacro).not.toHaveBeenCalled()
        expect(params.handleMoveToTrash).not.toHaveBeenCalled()
        expect(params.handleDeleteForever).not.toHaveBeenCalled()
    })

    it('does nothing for delete when restricted bulk actions are unavailable', () => {
        const { params, actions } = setup({
            canUseRestrictedBulkActions: false,
        })

        actions.DELETE_TICKET.action?.(new Event('keydown'))

        expect(params.handleMoveToTrash).not.toHaveBeenCalled()
        expect(params.handleDeleteForever).not.toHaveBeenCalled()
    })
})
