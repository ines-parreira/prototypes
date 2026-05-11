import { shortenRelativeDurationLabel } from '@repo/utils'
import moment from 'moment'

import { Box, Icon, Tag, Text, Tooltip, TooltipContent } from '@gorgias/axiom'
import type { ColorValue, IconName } from '@gorgias/axiom'
import type { TicketPriority as TicketPriorityType } from '@gorgias/helpdesk-queries'

import type { TicketStatus } from '../../../../components/TicketStatusActions/utils'

type Props = {
    status?: TicketStatus
    priority?: TicketPriorityType
    datetime: string | null
}

const STATUS_ICON_MAP: Record<TicketStatus, IconName> = {
    open: 'inbox',
    closed: 'check-circle',
    snoozed: 'timer-snooze',
}

const STATUS_COLOR_MAP: Record<TicketStatus, ColorValue> = {
    open: 'content-accent-default',
    closed: 'content-neutral-default',
    snoozed: 'content-additional-blue',
}

const PRIORITY_ICON_MAP: Partial<Record<TicketPriorityType, IconName>> = {
    high: 'arrow-chevron-up',
    critical: 'arrow-chevron-up-duo',
}

const PRIORITY_COLOR_MAP: Partial<Record<TicketPriorityType, ColorValue>> = {
    high: 'content-warning-default',
    critical: 'content-error-default',
}

const STATUS_LABEL_MAP: Record<TicketStatus, string> = {
    open: 'Open',
    closed: 'Closed',
    snoozed: 'Snoozed',
}

const PRIORITY_LABEL_MAP: Partial<Record<TicketPriorityType, string>> = {
    high: 'High priority',
    critical: 'Critical priority',
}

export function TicketListItemTrailingSlot({
    status,
    priority,
    datetime,
}: Props) {
    const relativeTime = datetime
        ? shortenRelativeDurationLabel(moment(datetime).fromNow())
        : null

    return (
        <Box flexDirection="row" alignItems="center" gap="xxs">
            <Box flexDirection="row" alignItems="center" gap="xxxxs">
                {status && status !== 'open' && (
                    <Tooltip
                        trigger={
                            <Tag size="sm">
                                <Icon
                                    name={STATUS_ICON_MAP[status]}
                                    color={STATUS_COLOR_MAP[status]}
                                />
                            </Tag>
                        }
                    >
                        <TooltipContent>
                            {STATUS_LABEL_MAP[status]}
                        </TooltipContent>
                    </Tooltip>
                )}
                {priority && PRIORITY_ICON_MAP[priority] && (
                    <Tooltip
                        trigger={
                            <Tag size="sm">
                                <Icon
                                    name={PRIORITY_ICON_MAP[priority]!}
                                    color={PRIORITY_COLOR_MAP[priority]}
                                />
                            </Tag>
                        }
                    >
                        <TooltipContent>
                            {PRIORITY_LABEL_MAP[priority]}
                        </TooltipContent>
                    </Tooltip>
                )}
            </Box>
            {relativeTime && (
                <Text size="sm" color="content-neutral-secondary">
                    {relativeTime}
                </Text>
            )}
        </Box>
    )
}
