import { Box } from '@gorgias/axiom'

import type {
    TicketThreadEventItem,
    TicketThreadGroupedEventsItem,
} from '../../hooks/events/types'
import { TicketThreadItemTag } from '../../hooks/types'
import { TicketThreadSingleEventItem } from './TicketTheadEventItem'

type TicketThreadGroupedEventsItemProps = {
    item: TicketThreadEventItem
}

export function TicketThreadGroupedEventsItem({
    item,
}: TicketThreadGroupedEventsItemProps) {
    if (item._tag === TicketThreadItemTag.Events.GroupedEvents) {
        return (
            <Box
                flexDirection="column"
                gap="xxxs"
                width="100%"
                alignItems="flex-end"
                justifyContent="flex-end"
            >
                {item.data.map((event) => (
                    <TicketThreadSingleEventItem
                        key={`${event.data.created_datetime}-${event._tag}`}
                        item={event}
                    />
                ))}
            </Box>
        )
    }

    return <TicketThreadSingleEventItem item={item} />
}
