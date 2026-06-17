import { Duration } from '@gorgias/toolkit'

import { useGetIntegration } from '@gorgias/helpdesk-queries'

import type { TicketThreadActionExecutedEventItem as TicketThreadActionExecutedEventItemType } from '#events/types'
import { TicketThreadActionExecutedEvent } from './TicketThreadActionExecutedEvent'
import { TicketThreadActionExecutedEventItemLoadingState } from './TicketThreadActionExecutedEventItemLoadingState'

type TicketThreadActionExecutedEventItemProps = {
    item: TicketThreadActionExecutedEventItemType
}

function normalizeIntegrationId(
    integrationId: string | number | null | undefined,
): number | null {
    if (typeof integrationId === 'number') {
        return Number.isFinite(integrationId) ? integrationId : null
    }

    if (typeof integrationId !== 'string' || !integrationId.trim()) {
        return null
    }

    const parsedIntegrationId = Number(integrationId)

    return Number.isFinite(parsedIntegrationId) ? parsedIntegrationId : null
}

export function TicketThreadActionExecutedEventItem({
    item,
}: TicketThreadActionExecutedEventItemProps) {
    const event = item.data
    const eventData = event.data
    const integrationId = normalizeIntegrationId(eventData.integration_id)

    const { data: integration, isLoading } = useGetIntegration(
        integrationId ?? 0,
        {
            query: {
                enabled: integrationId != null,
                staleTime: Duration.days(1),
                refetchOnWindowFocus: false,
            },
        },
    )

    if (integrationId != null && isLoading) {
        return <TicketThreadActionExecutedEventItemLoadingState />
    }

    return (
        <TicketThreadActionExecutedEvent
            integration={integration?.data ?? null}
            item={item}
        />
    )
}
