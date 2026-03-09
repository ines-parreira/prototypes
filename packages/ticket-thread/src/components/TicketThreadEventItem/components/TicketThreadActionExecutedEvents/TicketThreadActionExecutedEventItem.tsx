import { useMemo } from 'react'

import {
    Box,
    Icon,
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import type { TicketThreadActionExecutedEventItem as TicketThreadActionExecutedEventItemType } from '../../../../hooks/events/types'
import { useListAllIntegrations } from '../../../../hooks/shared/useListAllIntegrations'
import { TicketThreadEventAuthor } from '../TicketThreadEventAuthor'
import { TicketThreadEventContainer } from '../TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '../TicketThreadEventDateTime'
import {
    getActionExecutedErrorMessage,
    getActionExecutedLabel,
    getActionExecutedOrderToken,
    getActionExecutedPayloadEntries,
    getActionExecutedSourceFamily,
    getActionExecutedSourceIconName,
    resolveActionExecutedIntegration,
} from './transforms'

type TicketThreadActionExecutedEventItemProps = {
    item: TicketThreadActionExecutedEventItemType
}

export function TicketThreadActionExecutedEventItem({
    item,
}: TicketThreadActionExecutedEventItemProps) {
    const event = item.data
    const eventData = event.data

    const { data: integrations } = useListAllIntegrations()

    const integration = useMemo(
        () =>
            resolveActionExecutedIntegration(
                integrations,
                eventData.integration_id,
            ),
        [integrations, eventData.integration_id],
    )

    const sourceFamily = getActionExecutedSourceFamily({
        actionName: eventData.action_name,
        integrationType: integration?.type,
    })
    const sourceIconName = getActionExecutedSourceIconName(sourceFamily)
    const actionLabel = getActionExecutedLabel({
        actionName: eventData.action_name,
        actionLabel: eventData.action_label,
    })
    const orderToken = getActionExecutedOrderToken({
        sourceFamily,
        payload: eventData.payload,
        integration,
    })
    const errorMessage = getActionExecutedErrorMessage({
        status: eventData.status,
        message: eventData.msg,
    })
    const payloadEntries = getActionExecutedPayloadEntries(eventData.payload)
    const hasDetails = Boolean(errorMessage || payloadEntries.length > 0)

    return (
        <TicketThreadEventContainer>
            <Icon name={sourceIconName} />
            <Text size="sm">{actionLabel}</Text>
            {orderToken &&
                (orderToken.href ? (
                    <a
                        href={orderToken.href}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Text size="sm">{orderToken.label}</Text>
                    </a>
                ) : (
                    <Text size="sm" variant="medium">
                        {orderToken.label}
                    </Text>
                ))}
            {integration?.name && <Text size="sm"> on {integration.name}</Text>}
            {event.user_id != null && (
                <TicketThreadEventAuthor authorId={event.user_id} />
            )}
            {hasDetails && (
                <Tooltip>
                    <TooltipTrigger>
                        <span role="button" aria-label="Show action details">
                            <Icon name="info" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <Box flexDirection="column" gap="xxs">
                            {errorMessage && (
                                <Text size="sm">
                                    <Text size="sm" variant="medium">
                                        Error:
                                    </Text>{' '}
                                    {errorMessage}
                                </Text>
                            )}
                            {payloadEntries.map((entry) => (
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
            {event.created_datetime && (
                <TicketThreadEventDateTime datetime={event.created_datetime} />
            )}
        </TicketThreadEventContainer>
    )
}
