import { useTicket } from '../hooks/useTicket'

type Props = {
    ticketId: number
}

export function TicketDetail({ ticketId }: Props) {
    const { isLoading, ticket } = useTicket(ticketId)

    if (isLoading) return null

    return <pre data-testid="dump">{JSON.stringify(ticket, null, '  ')}</pre>
}
