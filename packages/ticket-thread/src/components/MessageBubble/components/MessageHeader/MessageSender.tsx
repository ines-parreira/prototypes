import { Text } from '@gorgias/axiom'
import type { TicketMessageUserOrCustomer } from '@gorgias/helpdesk-types'

export type MessageSenderProps = {
    sender: Partial<Pick<TicketMessageUserOrCustomer, 'name' | 'email' | 'id'>>
}

export function MessageSender({ sender }: MessageSenderProps) {
    const name = sender.name ?? sender.email ?? `Customer #${sender.id}`
    return (
        <Text size="md" variant="bold">
            {name}
        </Text>
    )
}
