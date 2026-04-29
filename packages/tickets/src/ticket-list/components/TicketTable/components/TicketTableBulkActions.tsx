import { Box } from '@gorgias/axiom'
import type {
    Team,
    TicketPriority,
    TicketTag,
    User,
} from '@gorgias/helpdesk-queries'

import type { TicketStatus } from '../../../../types/ticket'
import { BulkMoreActionsMenu } from './BulkMoreActionsMenu/BulkMoreActionsMenu'
import { BulkAddTagSelect } from './BulkMoreActionsMenu/components/BulkAddTagSelect'
import { BulkStatusSelect } from './BulkMoreActionsMenu/components/BulkStatusSelect'
import { BulkTeamAssignSelect } from './BulkMoreActionsMenu/components/BulkTeamAssignSelect'
import { BulkUserAssignSelect } from './BulkMoreActionsMenu/components/BulkUserAssignSelect'

type Props = {
    viewId: number
    isDisabled: boolean
    isAssignUserOpen: boolean
    onAssignUserOpenChange: (open: boolean) => void
    isAddTagOpen: boolean
    onAddTagOpenChange: (open: boolean) => void
    onSetStatus: (status: TicketStatus) => void | Promise<void>
    onAssignUser: (user: User | null) => void | Promise<void>
    onAssignTeam: (team: Team | null) => void | Promise<void>
    onAddTag: (tag: TicketTag) => void | Promise<void>
    onMarkAsUnread: () => void | Promise<void>
    onMarkAsRead: () => void | Promise<void>
    onChangePriority: (priority: TicketPriority) => void | Promise<void>
    onApplyMacro: () => void
    onExportTickets: () => void | Promise<void>
    onMoveToTrash: () => void | Promise<void>
    onUndelete: () => void | Promise<void>
    onDeleteForever: () => void | Promise<void>
}

/**
 * Horizontal row of bulk action controls (status, assignee, team, tags, more)
 * shown when one or more ticket rows are selected. Render as the children of
 * `<DataTableBulkActions>`.
 */
export function TicketTableBulkActions({
    viewId,
    isDisabled,
    isAssignUserOpen,
    onAssignUserOpenChange,
    isAddTagOpen,
    onAddTagOpenChange,
    onSetStatus,
    onAssignUser,
    onAssignTeam,
    onAddTag,
    onMarkAsUnread,
    onMarkAsRead,
    onChangePriority,
    onApplyMacro,
    onExportTickets,
    onMoveToTrash,
    onUndelete,
    onDeleteForever,
}: Props) {
    return (
        <Box alignItems="center" gap="xs" height="24px">
            <BulkStatusSelect onChange={onSetStatus} isDisabled={isDisabled} />
            <BulkUserAssignSelect
                onChange={onAssignUser}
                isDisabled={isDisabled}
                isOpen={isAssignUserOpen}
                onOpenChange={onAssignUserOpenChange}
            />
            <BulkTeamAssignSelect
                onChange={onAssignTeam}
                isDisabled={isDisabled}
            />
            <BulkAddTagSelect
                onChange={onAddTag}
                isDisabled={isDisabled}
                isOpen={isAddTagOpen}
                onOpenChange={onAddTagOpenChange}
            />
            <BulkMoreActionsMenu
                viewId={viewId}
                isDisabled={isDisabled}
                onMarkAsUnread={onMarkAsUnread}
                onMarkAsRead={onMarkAsRead}
                onChangePriority={onChangePriority}
                onApplyMacro={onApplyMacro}
                onExportTickets={onExportTickets}
                onMoveToTrash={onMoveToTrash}
                onUndelete={onUndelete}
                onDeleteForever={onDeleteForever}
            />
        </Box>
    )
}
