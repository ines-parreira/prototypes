import { useMemo } from 'react'

import { useShortcuts } from '@repo/utils'

import { TicketStatus } from '../../types/ticket'

type Params = {
    hasSelection: boolean
    isBulkActionLoading: boolean
    canUseRestrictedBulkActions: boolean
    isTrashLikeView: boolean
    handleOpenAssignUser: () => void
    handleOpenTags: () => void
    handleApplyMacro: () => void
    handleSetStatus: (status: TicketStatus) => void | Promise<void>
    handleMarkAsRead: () => void | Promise<void>
    handleMarkAsUnread: () => void | Promise<void>
    handleMoveToTrash: () => void | Promise<void>
    handleDeleteForever: () => void | Promise<void>
}

export function useTicketTableBulkActionShortcuts({
    hasSelection,
    isBulkActionLoading,
    canUseRestrictedBulkActions,
    isTrashLikeView,
    handleOpenAssignUser,
    handleOpenTags,
    handleApplyMacro,
    handleSetStatus,
    handleMarkAsRead,
    handleMarkAsUnread,
    handleMoveToTrash,
    handleDeleteForever,
}: Params) {
    const actions = useMemo(
        () => ({
            OPEN_ASSIGNEE: {
                action: (event: Event) => {
                    if (!hasSelection || isBulkActionLoading) {
                        return
                    }

                    event.preventDefault()
                    handleOpenAssignUser()
                },
            },
            OPEN_TAGS: {
                action: (event: Event) => {
                    if (!hasSelection || isBulkActionLoading) {
                        return
                    }

                    event.preventDefault()
                    handleOpenTags()
                },
            },
            OPEN_MACRO: {
                action: (event: Event) => {
                    if (!hasSelection || isBulkActionLoading) {
                        return
                    }

                    event.preventDefault()
                    handleApplyMacro()
                },
            },
            OPEN_TICKET: {
                action: (event: Event) => {
                    if (!hasSelection || isBulkActionLoading) {
                        return
                    }

                    event.preventDefault()
                    void handleSetStatus(TicketStatus.Open)
                },
            },
            CLOSE_TICKET: {
                action: (event: Event) => {
                    if (!hasSelection || isBulkActionLoading) {
                        return
                    }

                    event.preventDefault()
                    void handleSetStatus(TicketStatus.Closed)
                },
            },
            MARK_TICKET_READ: {
                action: (event: Event) => {
                    if (!hasSelection || isBulkActionLoading) {
                        return
                    }

                    event.preventDefault()
                    void handleMarkAsRead()
                },
            },
            MARK_TICKET_UNREAD: {
                action: (event: Event) => {
                    if (!hasSelection || isBulkActionLoading) {
                        return
                    }

                    event.preventDefault()
                    void handleMarkAsUnread()
                },
            },
            DELETE_TICKET: {
                action: (event: Event) => {
                    if (
                        !hasSelection ||
                        isBulkActionLoading ||
                        !canUseRestrictedBulkActions
                    ) {
                        return
                    }

                    event.preventDefault()
                    if (isTrashLikeView) {
                        void handleDeleteForever()
                        return
                    }

                    void handleMoveToTrash()
                },
            },
        }),
        [
            canUseRestrictedBulkActions,
            handleApplyMacro,
            handleDeleteForever,
            handleMarkAsRead,
            handleMarkAsUnread,
            handleMoveToTrash,
            handleOpenAssignUser,
            handleOpenTags,
            handleSetStatus,
            hasSelection,
            isBulkActionLoading,
            isTrashLikeView,
        ],
    )

    useShortcuts('TicketListActions', actions)
}
