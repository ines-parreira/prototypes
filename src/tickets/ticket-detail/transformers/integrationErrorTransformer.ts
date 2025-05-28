import { TicketMessage } from '@gorgias/helpdesk-types'

import { TicketMessageSourceType } from 'business/types/ticket'

import { FailedData } from '../types'

export function integrationErrorTransformer(
    message: TicketMessage,
): Partial<FailedData> {
    if (
        [
            TicketMessageSourceType.YotpoReviewPublicComment,
            TicketMessageSourceType.YotpoReviewPrivateComment,
        ].includes(message.source!.type as TicketMessageSourceType) &&
        message.last_sending_error &&
        message.last_sending_error.error === 'Review already has a comment'
    ) {
        return {
            message: `This comment can not be sent as this review has already received a comment from your account.
         Check out Yotpo's <a style='color:#d6273a;' rel='noopener noreferrer' target='_blank' href='https://www.yotpo.com/blog/comments-complete-guide/'><b>Comment guide</b></a>
         for more information.`,
        }
    }
    return {}
}
