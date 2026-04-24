import {
    Avatar,
    Box,
    DataTableBaseCell,
    OverflowTooltip,
    Text,
} from '@gorgias/axiom'
import type { TicketCompact } from '@gorgias/helpdesk-types'

import type { TicketTableCellLinkProps } from './TicketTableCellLink'
import { TicketTableCellLink } from './TicketTableCellLink'

type Props = {
    assignee: TicketCompact['assignee_user']
    linkProps?: Omit<TicketTableCellLinkProps, 'children'>
}

function getProfilePictureUrl(assignee: NonNullable<Props['assignee']>) {
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

function getAssigneeLabel(assignee: NonNullable<Props['assignee']>) {
    const fullName = [assignee.firstname, assignee.lastname]
        .filter(Boolean)
        .join(' ')
        .trim()

    return assignee.name?.trim() || fullName || assignee.email
}

export function AssigneeCell({ assignee, linkProps }: Props) {
    if (!assignee) {
        const content = (
            <Text size="sm" color="content-neutral-secondary">
                Unassigned
            </Text>
        )

        if (linkProps) {
            return (
                <TicketTableCellLink {...linkProps}>
                    {content}
                </TicketTableCellLink>
            )
        }

        return <DataTableBaseCell>{content}</DataTableBaseCell>
    }

    const profilePictureUrl = getProfilePictureUrl(assignee)
    const label = getAssigneeLabel(assignee)
    const content = (
        <Box flex={1} minWidth={0} alignItems="center" gap="xs">
            <Box flexShrink={0}>
                <Avatar
                    name={label}
                    url={profilePictureUrl ?? undefined}
                    size="sm"
                />
            </Box>
            <OverflowTooltip placement="right">
                <Text size="sm" overflow="ellipsis">
                    {label}
                </Text>
            </OverflowTooltip>
        </Box>
    )

    if (linkProps) {
        return (
            <TicketTableCellLink {...linkProps} alignItems="center">
                {content}
            </TicketTableCellLink>
        )
    }

    return <DataTableBaseCell alignItems="center">{content}</DataTableBaseCell>
}
