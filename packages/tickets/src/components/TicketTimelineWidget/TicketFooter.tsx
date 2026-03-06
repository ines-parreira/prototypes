import type { Color as ColorType } from '@gorgias/axiom'
import { Box, CardFooter, Color, Tag, Text } from '@gorgias/axiom'
import type { Ticket } from '@gorgias/helpdesk-types'

import { AssigneeLabel } from './AssigneeLabel'

import css from './TicketTimelineWidget.less'

type TicketFooterProps = Pick<Ticket, 'status'> & {
    isSnoozed: boolean
    assignee?: Ticket['assignee_user']
    messagesCount: number
}

function getStatusInfo(
    isSnoozed: boolean,
    ticketStatus: Ticket['status'],
): {
    label: string
    color: Extract<ColorType, 'grey' | 'blue' | 'purple'>
} {
    if (isSnoozed) {
        return { label: 'Snoozed', color: Color.Blue }
    }
    if (ticketStatus === 'closed') {
        return { label: 'Closed', color: Color.Grey }
    }
    return { label: 'Open', color: Color.Purple }
}

export function TicketFooter({
    status,
    isSnoozed,
    assignee,
    messagesCount,
}: TicketFooterProps) {
    const { label, color } = getStatusInfo(isSnoozed, status)

    return (
        <CardFooter display="block">
            <Box gap="xs" alignItems="center">
                <Box flexShrink="0">
                    <Tag color={color}>{label}</Tag>
                </Box>
                <Box minWidth={0} className={css.noWrap}>
                    <AssigneeLabel owner={assignee?.name} />
                </Box>
                <Box flexShrink="0" className={css.noWrap}>
                    <Text
                        size="sm"
                        variant="regular"
                        className={css.messagesCount}
                    >
                        {`${messagesCount} message${messagesCount > 1 ? 's' : ''}`}
                    </Text>
                </Box>
            </Box>
        </CardFooter>
    )
}
