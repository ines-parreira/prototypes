import { Skeleton } from '@gorgias/axiom'

import { TicketThreadEventContainer } from '../TicketThreadEventContainer'

export function TicketThreadActionExecutedEventItemLoadingState() {
    return (
        <TicketThreadEventContainer>
            <Skeleton height={24} width={186} />
        </TicketThreadEventContainer>
    )
}
