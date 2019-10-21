// @flow
import { canReply, type SourceType, SourceTypes } from './ticket'

describe('Business', () => {
    describe('ticket', () => {
        describe('canReply()', () => {
            let messageType: SourceType
            let attachmentCount: number
            let explicitReason: ?string

            it('should not allow to reply on facebook-messenger when there are attachments', () => {
                // Given
                messageType = SourceTypes.FACEBOOK_MESSENGER
                attachmentCount = 1
                explicitReason = null

                // When
                const result = canReply(messageType, attachmentCount, explicitReason)

                // Then
                // $FlowFixMe
                expect(result.message).toEqual('When using Facebook messenger, you can either send a text message, or an attachment, but not both at the same time. If you want to write a message, remove the attachment first.')
            })

            it('should not allow to reply when there is an explicit reason', () => {
                // Given
                messageType = SourceTypes.CHAT
                attachmentCount = 1
                explicitReason = 'Your chat integration is disabled'

                // When
                const result = canReply(messageType, attachmentCount, explicitReason)

                // Then
                // $FlowFixMe
                expect(result.message).toEqual(explicitReason)
            })
        })
    })
})
