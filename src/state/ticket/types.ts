import {Map} from 'immutable'
import {NormalizedCustomFieldValues} from 'models/customField/types'
import {Ticket} from 'models/ticket/types'

export type TicketState = Map<any, any>

export type FullTicketStateWithoutImmutable = Omit<Ticket, 'custom_fields'> & {
    custom_fields: NormalizedCustomFieldValues
    state: Record<string, unknown>
    _internal: Record<string, unknown>
}

export type TicketStateWithoutImmutable = Omit<
    FullTicketStateWithoutImmutable,
    'state' | '_internal'
>
