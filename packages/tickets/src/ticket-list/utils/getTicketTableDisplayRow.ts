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

function getHighlightedValueWithMatch(highlightedHtml?: string | null) {
    return highlightedHtml?.includes('<em>') ? highlightedHtml : null
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
    const subjectHighlight = getHighlightedValueWithMatch(
        searchDisplayData?.subject,
    )
    const excerptHighlight = getHighlightedValueWithMatch(
        searchDisplayData?.excerpt,
    )

    return {
        customer: getDisplayTextValue(
            customerName,
            searchDisplayData?.customer,
        ),
        subject: getDisplayTextValue(subject, subjectHighlight),
        excerpt: getDisplayTextValue(excerpt, excerptHighlight),
        ticketId: getDisplayTextValue(
            String(ticket.id),
            searchDisplayData?.ticketId,
        ),
    }
}
