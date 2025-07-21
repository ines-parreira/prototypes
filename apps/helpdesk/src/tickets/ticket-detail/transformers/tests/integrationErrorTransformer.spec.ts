import { TicketMessage } from '@gorgias/helpdesk-queries'

import { TicketMessageSourceType } from 'business/types/ticket'

import { integrationErrorTransformer } from '../integrationErrorTransformer'

describe('integrationErrorTransformer', () => {
    it('should return empty object for non-Yotpo messages', () => {
        const message = {
            source: {
                type: 'email',
            },
            last_sending_error: {
                error: 'Some error',
            },
        } as TicketMessage

        const result = integrationErrorTransformer(message)
        expect(result).toEqual({})
    })

    it('should return empty object for Yotpo messages without error', () => {
        const message = {
            source: {
                type: TicketMessageSourceType.YotpoReviewPublicComment,
            },
            last_sending_error: null,
        } as TicketMessage

        const result = integrationErrorTransformer(message)
        expect(result).toEqual({})
    })

    it('should return empty object for Yotpo messages with different error', () => {
        const message = {
            source: {
                type: TicketMessageSourceType.YotpoReviewPublicComment,
            },
            last_sending_error: {
                error: 'Different error',
            },
        } as TicketMessage

        const result = integrationErrorTransformer(message)
        expect(result).toEqual({})
    })

    it('should return custom message for Yotpo public review with duplicate comment error', () => {
        const message = {
            source: {
                type: TicketMessageSourceType.YotpoReviewPublicComment,
            },
            last_sending_error: {
                error: 'Review already has a comment',
            },
        } as TicketMessage

        const result = integrationErrorTransformer(message)
        expect(result).toEqual({
            message: expect.stringContaining(
                'This comment can not be sent as this review has already received a comment from your account',
            ),
        })
    })

    it('should return custom message for Yotpo private review with duplicate comment error', () => {
        const message = {
            source: {
                type: TicketMessageSourceType.YotpoReviewPrivateComment,
            },
            last_sending_error: {
                error: 'Review already has a comment',
            },
        } as TicketMessage

        const result = integrationErrorTransformer(message)
        expect(result).toEqual({
            message: expect.stringContaining(
                'This comment can not be sent as this review has already received a comment from your account',
            ),
        })
    })
})
