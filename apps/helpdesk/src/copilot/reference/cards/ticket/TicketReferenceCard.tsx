import { getReferenceVisual } from '../../icons'
import { ReferenceCardError } from '../shared/ReferenceCardError'
import { ReferenceCardSkeleton } from '../shared/ReferenceCardSkeleton'
import { TicketReferenceCardView } from './TicketReferenceCardView'
import { useTicketReferenceData } from './useTicketReferenceData'

type Props = {
    ticketId: number
    isOpen: boolean
}

const VISUAL = getReferenceVisual('ticket')

export function TicketReferenceCard({ ticketId, isOpen }: Props) {
    const { ticket, isLoading, isError } = useTicketReferenceData({
        ticketId,
        enabled: isOpen,
    })

    if (isLoading) {
        return (
            <ReferenceCardSkeleton
                icon={VISUAL.icon}
                typeLabel={VISUAL.label}
            />
        )
    }

    if (isError || !ticket) {
        return (
            <ReferenceCardError
                icon={VISUAL.icon}
                typeLabel={VISUAL.label}
                message="Couldn't load this ticket."
            />
        )
    }

    return <TicketReferenceCardView ticket={ticket} />
}
