import { useMemo } from 'react'

import { hasRole, UserRole } from '@repo/utils'

import {
    Button,
    Color,
    Icon,
    IconName,
    Intent,
    Menu,
    MenuItem,
    MenuPlacement,
    MenuSize,
    SubMenu,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'
import type { TicketPriority } from '@gorgias/helpdesk-queries'
import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

const PRIORITY_OPTIONS: Array<{
    id: TicketPriority
    label: string
    icon: IconName
    color: Color
}> = [
    {
        id: 'critical',
        label: 'Critical',
        icon: IconName.ArrowChevronUpDuo,
        color: Color.Red,
    },
    {
        id: 'high',
        label: 'High',
        icon: IconName.ArrowChevronUp,
        color: Color.Orange,
    },
    {
        id: 'normal',
        label: 'Normal',
        icon: IconName.Equals,
        color: Color.Grey,
    },
    {
        id: 'low',
        label: 'Low',
        icon: IconName.ArrowChevronDown,
        color: Color.Grey,
    },
]

type Props = {
    isDisabled: boolean
    onMarkAsUnread: () => void
    onMarkAsRead: () => void
    onChangePriority: (priority: TicketPriority) => void
    onExportTickets: () => void
    onMoveToTrash: () => void
}

export function MoreActionsMenu({
    isDisabled,
    onMarkAsUnread,
    onMarkAsRead,
    onChangePriority,
    onExportTickets,
    onMoveToTrash,
}: Props) {
    const { data: currentUser } = useGetCurrentUser()
    const canExportTickets = useMemo(
        () => currentUser && hasRole(currentUser.data, UserRole.Agent),
        [currentUser],
    )

    return (
        <Tooltip>
            <TooltipTrigger>
                <Menu
                    placement={MenuPlacement.BottomRight}
                    size={MenuSize.Sm}
                    aria-label="More bulk actions"
                    trigger={
                        <Button
                            variant="tertiary"
                            size="sm"
                            icon="dots-meatballs-horizontal"
                            aria-label="More actions"
                            isDisabled={isDisabled}
                        />
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
                    <SubMenu id="assign-team" label="Assign to team">
                        <MenuItem id="p" label="placeholder" />
                    </SubMenu>
                    <SubMenu id="change-priority" label="Change priority">
                        {PRIORITY_OPTIONS.map(({ id, label, icon, color }) => (
                            <MenuItem
                                key={id}
                                id={id}
                                label={label}
                                leadingSlot={
                                    <Icon name={icon} size="sm" color={color} />
                                }
                                onAction={() => onChangePriority(id)}
                            />
                        ))}
                    </SubMenu>
                    {canExportTickets && (
                        <MenuItem
                            id="export-tickets"
                            label="Export tickets"
                            onAction={onExportTickets}
                        />
                    )}
                    <MenuItem
                        id="move-to-trash"
                        label="Move to trash"
                        intent={Intent.Destructive}
                        onAction={onMoveToTrash}
                    />
                </Menu>
            </TooltipTrigger>
            <TooltipContent title="More actions" />
        </Tooltip>
    )
}
