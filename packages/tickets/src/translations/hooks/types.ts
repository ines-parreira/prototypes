import type { DomainEvent } from '@gorgias/events'

export type ExtractEvent<T extends DomainEvent['dataschema']> = Extract<
    DomainEvent,
    { dataschema: T }
>

export type TicketTranslationsQueryKeyParams = {
    queryParams: {
        language: string
        ticket_ids: number[]
    }
}
