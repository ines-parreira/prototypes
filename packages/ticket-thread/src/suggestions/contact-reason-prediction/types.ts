import type { TicketThreadItemTag } from '#thread/itemTags'

export type TicketThreadContactReasonSuggestionItem = {
    _tag: typeof TicketThreadItemTag.ContactReasonSuggestion
    data: null
}

export type ContactReasonCustomFields = Record<
    string,
    { prediction?: { display?: boolean } }
>
