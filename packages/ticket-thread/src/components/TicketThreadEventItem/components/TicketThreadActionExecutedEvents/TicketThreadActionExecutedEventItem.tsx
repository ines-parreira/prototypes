import { DurationInMs } from '@repo/utils'

import { useGetIntegration } from '@gorgias/helpdesk-queries'

import type { TicketThreadActionExecutedEventItem as TicketThreadActionExecutedEventItemType } from '../../../../hooks/events/types'
import { TicketThreadActionExecutedEvent } from './TicketThreadActionExecutedEvent'
import { TicketThreadActionExecutedEventItemLoadingState } from './TicketThreadActionExecutedEventItemLoadingState'

type TicketThreadActionExecutedEventItemProps = {
    item: TicketThreadActionExecutedEventItemType
}

export function TicketThreadActionExecutedEventItem({
    item,
}: TicketThreadActionExecutedEventItemProps) {
    const event = item.data
    const eventData = event.data

    const { data: integration, isLoading } = useGetIntegration(
        Number(eventData.integration_id),
        {
            query: {
                enabled: !!eventData.integration_id,
                staleTime: DurationInMs.OneDay,
                refetchOnWindowFocus: false,
            },
        },
    )

    if (isLoading) {
        return <TicketThreadActionExecutedEventItemLoadingState />
    }

    if (!integration?.data) {
        return null
    }

    return (
        <TicketThreadActionExecutedEvent
            integration={integration.data}
            item={item}
        />
    )
}
