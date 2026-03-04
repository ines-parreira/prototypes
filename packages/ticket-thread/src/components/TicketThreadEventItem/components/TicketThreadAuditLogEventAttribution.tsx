import type { TicketThreadAuditLogAttribution } from '../../../hooks/events/types'
import { TicketThreadEventAuthor } from './TicketThreadEventAuthor'
import { TicketThreadEventMethod } from './TicketThreadEventMethod'

type TicketThreadAuditLogEventAttributionProps = {
    attribution: TicketThreadAuditLogAttribution
    authorId?: number | null
    allowAuthorFallback?: boolean
}

export function TicketThreadAuditLogEventAttribution({
    attribution,
    authorId,
    allowAuthorFallback = true,
}: TicketThreadAuditLogEventAttributionProps) {
    if (attribution === 'via-rule') {
        return <TicketThreadEventMethod method="rule" />
    }

    if (attribution === 'author' && allowAuthorFallback && authorId != null) {
        return <TicketThreadEventAuthor authorId={authorId} />
    }

    return null
}
