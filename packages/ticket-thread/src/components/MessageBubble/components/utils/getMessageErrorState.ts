import type { TicketMessage } from '@gorgias/helpdesk-queries'

const YOTPO_REVIEW_PUBLIC_COMMENT = 'yotpo-review-public-comment'
const YOTPO_REVIEW_PRIVATE_COMMENT = 'yotpo-review-private-comment'
const DUPLICATE_YOTPO_COMMENT_ERROR = 'Review already has a comment'

export const YOTPO_COMMENT_GUIDE_URL =
    'https://www.yotpo.com/blog/comments-complete-guide/'

export type MessageErrorState = {
    errorMessage: string
    isRetriable: boolean
    isYotpoDuplicateCommentError: boolean
}

export function getMessageErrorState(
    message: Pick<
        TicketMessage,
        'is_retriable' | 'last_sending_error' | 'source'
    >,
): MessageErrorState {
    const lastSendingError = message.last_sending_error?.error
    const isYotpoDuplicateCommentError =
        [YOTPO_REVIEW_PUBLIC_COMMENT, YOTPO_REVIEW_PRIVATE_COMMENT].includes(
            message.source?.type ?? '',
        ) && lastSendingError === DUPLICATE_YOTPO_COMMENT_ERROR

    if (isYotpoDuplicateCommentError) {
        return {
            errorMessage:
                'This comment can not be sent as this review has already received a comment from your account.',
            isRetriable: false,
            isYotpoDuplicateCommentError: true,
        }
    }

    return {
        errorMessage: lastSendingError || 'This message was not sent.',
        isRetriable: Boolean(message.is_retriable),
        isYotpoDuplicateCommentError: false,
    }
}
