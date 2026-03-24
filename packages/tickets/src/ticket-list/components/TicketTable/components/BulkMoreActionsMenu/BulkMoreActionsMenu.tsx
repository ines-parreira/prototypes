import { useCallback, useState } from 'react'

import {
    Button,
    Intent,
    Menu,
    MenuItem,
    MenuPlacement,
    MenuSize,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { TicketPriority } from '@gorgias/helpdesk-queries'

import { useBulkActionMenuState } from '../../../../hooks/useBulkActionMenuState'
import { useIsTrashLikeView } from '../../../../hooks/useIsTrashLikeView'
import { PrioritySubMenu } from '../../../TicketListActions/PrioritySubMenu'

type BulkMoreActionsMenuProps = {
    viewId: number
    isDisabled: boolean
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
    onMarkAsUnread,
    onMarkAsRead,
    onChangePriority,
    onApplyMacro,
    onExportTickets,
    onMoveToTrash,
    onUndelete,
    onDeleteForever,
}: BulkMoreActionsMenuProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { canUseRestrictedBulkActions } = useBulkActionMenuState()
    const isTrashLikeView = useIsTrashLikeView(viewId)

    const handleOpenChange = useCallback((open: boolean) => {
        setIsMenuOpen(open)
    }, [])

    return (
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
                            onAction={onDeleteForever}
                        />
                    </>
                ) : (
                    <MenuItem
                        id="delete"
                        label="Delete"
                        intent={Intent.Destructive}
                        onAction={onMoveToTrash}
                    />
                ))}
        </Menu>
    )
}
