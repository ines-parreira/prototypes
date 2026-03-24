import { useCallback } from 'react'

import {
    Box,
    Button,
    CheckBoxField,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { useTicketListActions } from '../../hooks/useTicketListActions'
import { AssignUserMenu } from './AssignUserMenu'
import { MoreActionsMenu } from './MoreActionsMenu'

import css from './TicketListActions.module.less'

type Props = {
    viewId: number
    selectedTicketIds: Set<number>
    visibleTicketIds: number[]
    hasSelectedAll: boolean
    selectionCount: number
    onSelectAll: (selected: boolean) => void
    onActionComplete: () => void
    onApplyMacro?: (ticketIds: number[]) => void
}

export function TicketListActions({
    viewId,
    selectedTicketIds,
    visibleTicketIds,
    hasSelectedAll,
    selectionCount,
    onSelectAll,
    onActionComplete,
    onApplyMacro,
}: Props) {
    const isDisabled = !hasSelectedAll && selectionCount === 0

    const {
        isLoading,
        handleMarkAsUnread,
        handleMarkAsRead,
        handleChangePriority,
        handleAssignTeam,
        handleAssignUser,
        handleAddTag,
        handleCloseTickets,
        handleMoveToTrash,
        handleUndelete,
        handleDeleteForever,
        handleExportTickets,
        handleApplyMacro,
    } = useTicketListActions({
        viewId,
        selectedTicketIds,
        visibleTicketIds,
        hasSelectedAll,
        onActionComplete,
        onApplyMacro,
    })

    const handleUndeleteFromTrashView = useCallback(() => {
        void handleUndelete({ removeFromCurrentViewCache: true })
    }, [handleUndelete])

    const handleCheckboxChange = useCallback(
        (value: boolean) => {
            onSelectAll(value)
        },
        [onSelectAll],
    )

    const checkboxLabel = hasSelectedAll
        ? 'All selected'
        : selectionCount > 0
          ? `${selectionCount} selected`
          : 'Select all'

    return (
        <Box
            className={css.actions}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
        >
            <Box flexDirection="row" alignItems="center" gap="xs" pl="xxs">
                <CheckBoxField
                    label={checkboxLabel}
                    value={hasSelectedAll}
                    isIndeterminate={!hasSelectedAll && selectionCount > 0}
                    onChange={handleCheckboxChange}
                    isDisabled={visibleTicketIds.length === 0}
                />
            </Box>
            <Box flexDirection="row" alignItems="center" gap="xs">
                <Tooltip
                    trigger={
                        <Button
                            variant="tertiary"
                            size="sm"
                            icon="circle-check"
                            aria-label="Close tickets"
                            isDisabled={isDisabled || isLoading}
                            onClick={handleCloseTickets}
                        />
                    }
                >
                    <TooltipContent
                        title={
                            isDisabled
                                ? 'Select one or more tickets to close'
                                : 'Close tickets'
                        }
                    />
                </Tooltip>
                <AssignUserMenu
                    value={null}
                    isDisabled={isDisabled || isLoading}
                    onAssignUser={handleAssignUser}
                />
                <MoreActionsMenu
                    viewId={viewId}
                    isDisabled={isDisabled || isLoading}
                    onMarkAsUnread={handleMarkAsUnread}
                    onMarkAsRead={handleMarkAsRead}
                    onAddTag={handleAddTag}
                    onChangePriority={handleChangePriority}
                    onAssignTeam={handleAssignTeam}
                    onExportTickets={handleExportTickets}
                    onApplyMacro={handleApplyMacro}
                    onMoveToTrash={handleMoveToTrash}
                    onUndelete={handleUndeleteFromTrashView}
                    onDeleteForever={handleDeleteForever}
                />
            </Box>
        </Box>
    )
}
