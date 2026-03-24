import { Box, DataTableToolbar } from '@gorgias/axiom'
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
    selectedCount: number
    isDisabled: boolean
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

export function TicketTableBulkActions({
    viewId,
    selectedCount,
    isDisabled,
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
        <DataTableToolbar>
            <Box alignItems="flex-start" gap="xs" minHeight="25px">
                {selectedCount > 0 ? (
                    <>
                        <BulkStatusSelect
                            onChange={onSetStatus}
                            isDisabled={isDisabled}
                        />
                        <BulkUserAssignSelect
                            onChange={onAssignUser}
                            isDisabled={isDisabled}
                        />
                        <BulkTeamAssignSelect
                            onChange={onAssignTeam}
                            isDisabled={isDisabled}
                        />
                        <BulkAddTagSelect
                            onChange={onAddTag}
                            isDisabled={isDisabled}
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
                    </>
                ) : null}
            </Box>
        </DataTableToolbar>
    )
}
