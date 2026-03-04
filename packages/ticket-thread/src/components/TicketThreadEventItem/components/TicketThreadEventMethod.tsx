import { Text } from '@gorgias/axiom'

type TicketThreadEventMethodProps = {
    method: string
}

export function TicketThreadEventMethod({
    method,
}: TicketThreadEventMethodProps) {
    return <Text size="sm">via {method}</Text>
}
