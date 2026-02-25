import type { TicketThreadItemTag } from '../types'

export type TicketThreadContactReasonSuggestionItem = {
    _tag: typeof TicketThreadItemTag.ContactReasonSuggestion
    data: null
}

export type ContactReasonCustomFields = Record<
    string,
    { prediction?: { display?: boolean } }
>
