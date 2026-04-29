import {
    Avatar,
    Box,
    DataTableBaseCell,
    OverflowTooltip,
    Text,
} from '@gorgias/axiom'
import type { CellContext } from '@gorgias/axiom'
import type { TicketCompact } from '@gorgias/helpdesk-types'

import type { TicketTableRow } from '../TicketTableColumns'

export type AssigneeCellProps = CellContext<TicketTableRow, unknown>

type Assignee = NonNullable<TicketCompact['assignee_user']>

function getProfilePictureUrl(assignee: Assignee) {
    if (!assignee.meta || typeof assignee.meta !== 'object') {
        return undefined
    }

    const profilePictureUrl = (
        assignee.meta as {
            profile_picture_url?: unknown
        }
    ).profile_picture_url

    return typeof profilePictureUrl === 'string' ? profilePictureUrl : undefined
}

function getAssigneeLabel(assignee: Assignee) {
    const fullName = [assignee.firstname, assignee.lastname]
        .filter(Boolean)
        .join(' ')
        .trim()

    return assignee.name?.trim() || fullName || assignee.email
}

export function AssigneeCell(cellContext: AssigneeCellProps) {
    const assignee = cellContext.row.original.assignee_user

    if (!assignee) {
        return <DataTableBaseCell {...cellContext}>{null}</DataTableBaseCell>
    }

    const profilePictureUrl = getProfilePictureUrl(assignee)
    const label = getAssigneeLabel(assignee)

    return (
        <DataTableBaseCell {...cellContext} alignItems="center">
            <Box flex={1} minWidth={0} alignItems="center" gap="xs">
                <Box flexShrink={0}>
                    <Avatar
                        name={label}
                        url={profilePictureUrl ?? undefined}
                        size="sm"
                    />
                </Box>
                <OverflowTooltip placement="right">
                    <Text size="md" overflow="ellipsis">
                        {label}
                    </Text>
                </OverflowTooltip>
            </Box>
        </DataTableBaseCell>
    )
}
