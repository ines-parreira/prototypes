import isObject from 'lodash/isObject'
import type { TicketMessage } from '@gorgias/helpdesk-queries'

type MessageReviewMeta = {
    reviewLink: string | null
    reviewScore: number | null
}

type MessageSource = TicketMessage['source']

function getReviewScore(source: MessageSource): number | null {
    const extra =
        isObject(source) &&
        'extra' in source &&
        source.extra &&
        isObject(source.extra)
            ? source.extra
            : null

    if (!extra || !('score' in extra)) {
        return null
    }

    const rawScore = extra.score
    const parsedScore = Number(rawScore)

    return Number.isFinite(parsedScore) ? parsedScore : null
}

export function getMessageReviewMeta(
    messageId: string | number | null | undefined,
    source?: MessageSource | null,
): MessageReviewMeta {
    if (!source) {
        return {
            reviewLink: null,
            reviewScore: null,
        }
    }

    if (source.type !== 'yotpo-review') {
        return {
            reviewLink: null,
            reviewScore: null,
        }
    }

    return {
        reviewLink: messageId
            ? `https://reviews.yotpo.com/#/moderation/reviews?filterType=reviews&id=${messageId}`
            : null,
        reviewScore: getReviewScore(source),
    }
}
