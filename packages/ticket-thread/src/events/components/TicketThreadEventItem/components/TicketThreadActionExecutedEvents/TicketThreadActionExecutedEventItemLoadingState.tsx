import { Skeleton } from '@gorgias/axiom'

import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'

export function TicketThreadActionExecutedEventItemLoadingState() {
    return (
        <TicketThreadEventContainer>
            <Skeleton height={24} width={186} />
        </TicketThreadEventContainer>
    )
}
