import type { TicketMessage } from '@gorgias/helpdesk-queries'

import { Box, Link } from '@gorgias/axiom'

import { ProductReviewRating } from '#ticket-messages/components/MessageBubble/components/ProductReviewRating'
import { getMessageReviewMeta } from './getMessageReviewMeta'
import { MessageMetaLabel } from './MessageMetaLabel'

type MessageReviewMetaProps = {
    messageId?: string | number | null
    source?: TicketMessage['source'] | null
}

export function MessageReviewMeta({
    messageId,
    source,
}: MessageReviewMetaProps) {
    const { reviewScore, reviewLink } = getMessageReviewMeta(messageId, source)

    if (reviewScore === null && !reviewLink) {
        return null
    }

    return (
        <Box alignItems="center" gap="xs">
            {reviewScore !== null && (
                <ProductReviewRating value={reviewScore} />
            )}
            {reviewLink && (
                <MessageMetaLabel size="md">
                    left a{' '}
                    <Link
                        href={reviewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        trailingSlot="external-link"
                    >
                        review
                    </Link>
                </MessageMetaLabel>
            )}
        </Box>
    )
}
