import { useCallback, useRef, useState } from 'react'

import {
    Box,
    Button,
    Intent,
    Menu,
    MenuItem,
    MenuPlacement,
    MenuSize,
    Popover,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { TicketPriority } from '@gorgias/helpdesk-queries'

import { useBulkActionMenuState } from '../../../../hooks/useBulkActionMenuState'
import { useIsTrashLikeView } from '../../../../hooks/useIsTrashLikeView'
import { PrioritySubMenu } from '../../../TicketListActions/PrioritySubMenu'
import css from './BulkMoreActionsMenu.less'

type BulkMoreActionsMenuProps = {
    viewId: number
    isDisabled: boolean
    isAllSelected: boolean
    selectedTicketCount: number
    totalTicketCount?: number
    viewName: string
    onMarkAsUnread: () => void | Promise<void>
    onMarkAsRead: () => void | Promise<void>
    onChangePriority: (priority: TicketPriority) => void | Promise<void>
    onApplyMacro: () => void
    onExportTickets: () => void | Promise<void>
    onMoveToTrash: () => void | Promise<void>
    onUndelete: () => void | Promise<void>
    onDeleteForever: () => void | Promise<void>
}

export function BulkMoreActionsMenu({
    viewId,
    isDisabled,
    isAllSelected,
    selectedTicketCount,
    totalTicketCount,
    viewName,
    onMarkAsUnread,
    onMarkAsRead,
    onChangePriority,
    onApplyMacro,
    onExportTickets,
    onMoveToTrash,
    onUndelete,
    onDeleteForever,
}: BulkMoreActionsMenuProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const { canUseRestrictedBulkActions } = useBulkActionMenuState()
    const isTrashLikeView = useIsTrashLikeView(viewId)

    const handleOpenChange = useCallback((open: boolean) => {
        setIsMenuOpen(open)
    }, [])

    const handleDeleteAction = useCallback(() => {
        setIsMenuOpen(false)
        setIsDeleteConfirmOpen(true)
    }, [])

    const handleConfirmDelete = useCallback(async () => {
        if (isTrashLikeView) {
            await onDeleteForever()
        } else {
            await onMoveToTrash()
        }
        setIsDeleteConfirmOpen(false)
    }, [isTrashLikeView, onDeleteForever, onMoveToTrash])

    const deleteTargetLabel =
        totalTicketCount != null ? `${totalTicketCount} tickets` : 'tickets'
    const deleteConfirmationMessage = isAllSelected
        ? `Are you sure you want to delete all ${deleteTargetLabel} in ${viewName}${isTrashLikeView ? ' forever' : ''}?`
        : `Are you sure you want to delete ${selectedTicketCount} ticket${selectedTicketCount === 1 ? '' : 's'}${isTrashLikeView ? ' forever' : ''}?`

    return (
        <div ref={containerRef}>
            <Menu
                placement={MenuPlacement.BottomLeft}
                size={MenuSize.Sm}
                aria-label="More bulk actions"
                isOpen={isMenuOpen}
                onOpenChange={handleOpenChange}
                trigger={
                    <Tooltip
                        trigger={
                            <Button
                                variant="secondary"
                                size="sm"
                                icon="dots-meatballs-horizontal"
                                aria-label="More actions"
                                isDisabled={isDisabled}
                            />
                        }
                    >
                        <TooltipContent title="More actions" />
                    </Tooltip>
                }
            >
                <MenuItem
                    id="mark-as-unread"
                    label="Mark as unread"
                    onAction={onMarkAsUnread}
                />
                <MenuItem
                    id="mark-as-read"
                    label="Mark as read"
                    onAction={onMarkAsRead}
                />
                <PrioritySubMenu onChangePriority={onChangePriority} />
                <MenuItem
                    id="apply-macro"
                    label="Apply macro"
                    onAction={onApplyMacro}
                />
                {canUseRestrictedBulkActions && (
                    <MenuItem
                        id="export-tickets"
                        label="Export tickets"
                        onAction={onExportTickets}
                    />
                )}
                {canUseRestrictedBulkActions &&
                    (isTrashLikeView ? (
                        <>
                            <MenuItem
                                id="undelete"
                                label="Undelete"
                                onAction={onUndelete}
                            />
                            <MenuItem
                                id="delete-forever"
                                label="Delete forever"
                                intent={Intent.Destructive}
                                onAction={handleDeleteAction}
                            />
                        </>
                    ) : (
                        <MenuItem
                            id="delete"
                            label="Delete"
                            intent={Intent.Destructive}
                            onAction={handleDeleteAction}
                        />
                    ))}
            </Menu>
            <Popover
                isOpen={isDeleteConfirmOpen}
                onOpenChange={setIsDeleteConfirmOpen}
                triggerRef={containerRef}
                placement="bottom"
                padding="sm"
                trigger={
                    // Axiom Popover currently requires a trigger even when triggerRef is the real anchor.
                    // Remove this shim once Axiom supports externally anchored controlled popovers.
                    <button
                        type="button"
                        tabIndex={-1}
                        aria-hidden="true"
                        className={css.hiddenPopoverTrigger}
                    />
                }
            >
                <Box flexDirection="column" gap="sm" width={260}>
                    <Text>
                        <strong>Are you sure?</strong>
                    </Text>
                    <Text size="sm">{deleteConfirmationMessage}</Text>
                    <Box justifyContent="flex-end" gap="xs">
                        <Button
                            variant="tertiary"
                            size="sm"
                            onClick={() => setIsDeleteConfirmOpen(false)}
                        >
                            No
                        </Button>
                        <Button
                            intent="destructive"
                            size="sm"
                            onClick={() => {
                                void handleConfirmDelete()
                            }}
                            isLoading={isDisabled}
                        >
                            Yes
                        </Button>
                    </Box>
                </Box>
            </Popover>
        </div>
    )
}
