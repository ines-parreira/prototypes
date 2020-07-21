// @flow
import {canReply, TicketMessageSourceTypes} from '../ticket'
import type {TicketMessageSourceType} from '../types/ticket'

describe('Business', () => {
    describe('ticket', () => {
        describe('canReply()', () => {
            let messageType: TicketMessageSourceType
            let attachmentCount: number
            let explicitReason: ?string

            it('should not allow to reply on facebook-messenger when there are attachments', () => {
                // Given
                messageType = TicketMessageSourceTypes.FACEBOOK_MESSENGER
                attachmentCount = 1
                explicitReason = null

                // When
                const result = canReply(
                    messageType,
                    attachmentCount,
                    explicitReason
                )

                // Then
                // $FlowFixMe
                expect(result.message).toEqual(
                    'When using Facebook messenger, you can either send a text message, or an attachment, but not both at the same time. If you want to write a message, remove the attachment first.'
                )
            })

            it('should not allow to reply when there is an explicit reason', () => {
                // Given
                messageType = TicketMessageSourceTypes.CHAT
                attachmentCount = 1
                explicitReason = 'Your chat integration is disabled'

                // When
                const result = canReply(
                    messageType,
                    attachmentCount,
                    explicitReason
                )

                // Then
                // $FlowFixMe
                expect(result.message).toEqual(explicitReason)
            })
        })
    })
})
