import { mockTicketMessage } from '@gorgias/helpdesk-mocks'

import { getMessageErrorState } from '../utils/getMessageErrorState'

describe('getMessageErrorState', () => {
    it('returns the transformed Yotpo error state', () => {
        const message = mockTicketMessage({
            is_retriable: true,
            last_sending_error: {
                error: 'Review already has a comment',
            },
            source: {
                type: 'yotpo-review-private-comment',
            },
        })

        expect(getMessageErrorState(message)).toEqual({
            errorMessage:
                'This comment can not be sent as this review has already received a comment from your account.',
            isRetriable: false,
            isYotpoDuplicateCommentError: true,
        })
    })

    it('falls back to the generic failed message', () => {
        const message = mockTicketMessage({
            last_sending_error: null,
        })

        expect(getMessageErrorState(message)).toEqual({
            errorMessage: 'This message was not sent.',
            isRetriable: Boolean(message.is_retriable),
            isYotpoDuplicateCommentError: false,
        })
    })
})
