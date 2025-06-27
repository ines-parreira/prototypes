import type { TicketChannel, TicketStatus } from 'business/types/ticket'
import type { Actor } from 'models/ticket/types'

type PickedActor = Pick<Actor, 'id' | 'name' | 'firstname' | 'lastname'>

type Ticket = {
    id: number
    channel: TicketChannel
    excerpt?: string
    sender?: PickedActor
    status: TicketStatus
    subject: string
    assignee_user_id?: number | null
}

export type TicketPayload = {
    sender?: PickedActor
    customer?: PickedActor
    ticket: Ticket
}
