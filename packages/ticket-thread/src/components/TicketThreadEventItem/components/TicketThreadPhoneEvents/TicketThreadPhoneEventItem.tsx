import { useMemo } from 'react'

import { useListAllHumanAgents } from '@repo/users'
import { Link } from 'react-router-dom'

import {
    Box,
    Icon,
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import type { TicketThreadPhoneEventItem as TicketThreadPhoneEventItemType } from '../../../../hooks/events/types'
import { TicketThreadAuditLogEventAttribution } from '../TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../TicketThreadEventDateTime'
import {
    getPhoneEventCustomerName,
    getPhoneEventDetailsEntries,
    getPhoneEventIconName,
    getPhoneEventLabel,
    getPhoneEventTicketId,
    hasPhoneEventDetails,
    resolvePhoneEventAgentName,
} from './transforms'

type TicketThreadPhoneEventItemProps = {
    item: TicketThreadPhoneEventItemType
}

export function TicketThreadPhoneEventItem({
    item,
}: TicketThreadPhoneEventItemProps) {
    const event = item.data
    const { data: agents } = useListAllHumanAgents()

    const agentName = useMemo(
        () =>
            resolvePhoneEventAgentName({
                userId: event.user_id,
                payloadUserName: event.user?.name,
                agents,
            }),
        [agents, event.user?.name, event.user_id],
    )
    const eventTitle = getPhoneEventLabel({
        type: event.type,
        agentName,
        customerName: getPhoneEventCustomerName(event),
    })
    const iconName = getPhoneEventIconName(event.type)
    const phoneTicketId = getPhoneEventTicketId(event)
    const detailsEntries = getPhoneEventDetailsEntries(event)
    const hasDetails = hasPhoneEventDetails(event.type)

    return (
        <TicketThreadEventContainer>
            <Icon name={iconName} />
            <Text size="sm">{eventTitle}</Text>
            {phoneTicketId && (
                <Text size="sm" variant="medium">
                    <Link to={`/app/ticket/${phoneTicketId}`}>
                        {` `}View ticket{` `}
                    </Link>
                </Text>
            )}
            {hasDetails && (
                <Tooltip>
                    <TooltipTrigger>
                        <span
                            role="button"
                            aria-label="Show phone event details"
                        >
                            <Icon name="info" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <Box flexDirection="column" gap="xxs">
                            {detailsEntries.length === 0 && (
                                <Text size="sm">No additional details</Text>
                            )}
                            {detailsEntries.map((entry) => (
                                <Text
                                    key={`${entry.key}-${entry.value}`}
                                    size="sm"
                                >
                                    <Text size="sm" variant="medium">
                                        {entry.key}:
                                    </Text>{' '}
                                    {entry.value}
                                </Text>
                            ))}
                        </Box>
                    </TooltipContent>
                </Tooltip>
            )}
            {event.user_id && (
                <TicketThreadAuditLogEventAttribution
                    attribution="author"
                    authorId={event.user_id}
                />
            )}
            {event.created_datetime && (
                <TicketThreadEventDateTime datetime={event.created_datetime} />
            )}
        </TicketThreadEventContainer>
    )
}
