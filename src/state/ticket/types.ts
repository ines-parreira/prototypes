import {Map} from 'immutable'
import {Ticket} from 'models/ticket/types'

export type TicketState = Map<any, any>

export type FullTicketStateWithoutImmutable = Ticket & {
    state: Record<string, unknown>
    _internal: Record<string, unknown>
}

export type TicketStateWithoutImmutable = Omit<
    FullTicketStateWithoutImmutable,
    'state' | '_internal'
>
