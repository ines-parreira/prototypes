import { useCallback } from 'react'

import {
    Box,
    Button,
    CheckBoxField,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { useTicketListActions } from '../../hooks/useTicketListActions'
import { MoreActionsMenu } from './MoreActionsMenu'

import css from './TicketListActions.module.less'

type Props = {
    viewId: number
    selectedTicketIds: Set<number>
    hasSelectedAll: boolean
    selectionCount: number
    onSelectAll: (selected: boolean) => void
    onActionComplete: () => void
}

export function TicketListActions({
    viewId,
    selectedTicketIds,
    hasSelectedAll,
    selectionCount,
    onSelectAll,
    onActionComplete,
}: Props) {
    const isDisabled = !hasSelectedAll && selectionCount === 0

    const {
        isLoading,
        handleMarkAsUnread,
        handleMarkAsRead,
        handleChangePriority,
        handleCloseTickets,
        handleMoveToTrash,
        handleExportTickets,
    } = useTicketListActions({
        viewId,
        selectedTicketIds,
        hasSelectedAll,
        onActionComplete,
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
                    <Button
                        variant="tertiary"
                        size="sm"
                        icon="circle-check"
                        aria-label="Close tickets"
                        isDisabled={isDisabled || isLoading}
                        onClick={handleCloseTickets}
                    />
                    <TooltipContent title="Close tickets" />
                </Tooltip>
                <Tooltip>
                    <Button
                        variant="tertiary"
                        size="sm"
                        icon="user"
                        aria-label="Assign user"
                        isDisabled={isDisabled || isLoading}
                    />
                    <TooltipContent title="Assign user" />
                </Tooltip>
                <MoreActionsMenu
                    isDisabled={isDisabled || isLoading}
                    onMarkAsUnread={handleMarkAsUnread}
                    onMarkAsRead={handleMarkAsRead}
                    onChangePriority={handleChangePriority}
                    onExportTickets={handleExportTickets}
                    onMoveToTrash={handleMoveToTrash}
                />
            </Box>
        </Box>
    )
}
