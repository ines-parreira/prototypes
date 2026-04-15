import type {
    TicketCompact,
    TicketTranslationCompact,
} from '@gorgias/helpdesk-types'

import { getTicketSearchDisplayData } from '../../utils/search/ticketHighlights'
import {
    getTicketCustomerName,
    getTicketDisplayExcerpt,
    getTicketDisplaySubject,
} from '../hooks/useTicketDisplayData'
import type { DisplayTextValue } from '../types/display'
import type { SearchTicket } from '../types/search'

type Params = {
    ticket: TicketCompact
    translation?: TicketTranslationCompact
    showTranslatedContent?: boolean
}

type TicketTableDisplayRow = {
    customer: DisplayTextValue
    subject: DisplayTextValue
    excerpt: DisplayTextValue
    ticketId: DisplayTextValue
}

function getDisplayTextValue(
    text: string,
    highlightedHtml?: string | null,
): DisplayTextValue {
    return {
        text,
        highlightedHtml,
    }
}

export function getTicketTableDisplayRow({
    ticket,
    translation,
    showTranslatedContent,
}: Params): TicketTableDisplayRow {
    const customerName = getTicketCustomerName(ticket)
    const subject = getTicketDisplaySubject({
        ticket,
        translation,
        showTranslatedContent,
    })
    const excerpt = getTicketDisplayExcerpt({
        ticket,
        translation,
        showTranslatedContent,
    })
    const searchTicket = ticket as SearchTicket
    const searchDisplayData = searchTicket.highlights
        ? getTicketSearchDisplayData(searchTicket)
        : null

    return {
        customer: getDisplayTextValue(
            customerName,
            searchDisplayData?.customer,
        ),
        subject: getDisplayTextValue(subject, searchDisplayData?.subject),
        excerpt: getDisplayTextValue(excerpt, searchDisplayData?.excerpt),
        ticketId: getDisplayTextValue(
            String(ticket.id),
            searchDisplayData?.ticketId,
        ),
    }
}
