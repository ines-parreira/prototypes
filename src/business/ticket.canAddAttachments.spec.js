// @flow
import { canAddAttachments, type SourceType, SourceTypes } from './ticket'

describe('Business', () => {
    describe('ticket', () => {
        describe('canAddAttachments()', () => {
            let messageType: SourceType
            let newMessage: string
            let attachmentCount: number

            it('should not allow to add when facebook-messenger has already text', () => {
                // Given
                messageType = SourceTypes.FACEBOOK_MESSENGER
                newMessage = 'Hello'
                attachmentCount = 1

                // When
                const result = canAddAttachments(messageType, newMessage, attachmentCount)

                // Then
                // $FlowFixMe
                expect(result.message).toEqual('When using Facebook messenger, you can either send a text message, or an attachment, but not both at the same time.')
            })

            describe('only one attachment allowed', () => {
                beforeEach(() => {
                    attachmentCount = 2
                    newMessage = ''
                })

                it('should not allow to add when chat', () => {
                    // Given
                    messageType = SourceTypes.CHAT

                    // When
                    const result = canAddAttachments(messageType, newMessage, attachmentCount)

                    // Then
                    // $FlowFixMe
                    expect(result.message).toEqual('When using Chat, you can only send attachments one by one.')
                })

                it('should not allow to add when facebook-comment', () => {
                    // Given
                    messageType = SourceTypes.FACEBOOK_COMMENT

                    // When
                    const result = canAddAttachments(messageType, newMessage, attachmentCount)

                    // Then
                    // $FlowFixMe
                    expect(result.message).toEqual('When using Facebook comment, you can only send attachments one by one.')
                })

                it('should not allow to add when facebook-messenger', () => {
                    // Given
                    messageType = SourceTypes.FACEBOOK_MESSENGER

                    // When
                    const result = canAddAttachments(messageType, newMessage, attachmentCount)

                    // Then
                    // $FlowFixMe
                    expect(result.message).toEqual('When using Facebook messenger, you can only send attachments one by one.')
                })
            })
        })
    })
})
