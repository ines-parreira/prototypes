import { useCallback } from 'react'

import {
    Box,
    Button,
    CheckBoxField,
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
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
            <Box flexDirection="row" alignItems="center" gap="xs">
                <CheckBoxField
                    aria-label={checkboxLabel}
                    value={hasSelectedAll}
                    isIndeterminate={!hasSelectedAll && selectionCount > 0}
                    onChange={handleCheckboxChange}
                />
                <Text size="md">{checkboxLabel}</Text>
            </Box>
            <Box flexDirection="row" alignItems="center" gap="xs">
                <Tooltip>
                    <TooltipTrigger>
                        <Button
                            variant="tertiary"
                            size="sm"
                            icon="circle-check"
                            aria-label="Close tickets"
                            isDisabled={isDisabled || isLoading}
                            onClick={handleCloseTickets}
                        />
                    </TooltipTrigger>
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
                    isDisabled={isDisabled || isLoading}
                    onMarkAsUnread={handleMarkAsUnread}
                    onMarkAsRead={handleMarkAsRead}
                    onAddTag={handleAddTag}
                    onChangePriority={handleChangePriority}
                    onAssignTeam={handleAssignTeam}
                    onExportTickets={handleExportTickets}
                    onApplyMacro={handleApplyMacro}
                    onMoveToTrash={handleMoveToTrash}
                />
            </Box>
        </Box>
    )
}
