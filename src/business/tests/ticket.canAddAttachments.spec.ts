import {canAddAttachments} from '../ticket'
import {TicketMessageSourceType} from '../types/ticket'

describe('Business', () => {
    describe('ticket', () => {
        describe('canAddAttachments()', () => {
            let messageType: TicketMessageSourceType
            let newMessage: string
            let attachmentCount: number

            it('should not allow to add when Instagram DM has already text', () => {
                // Given
                messageType = TicketMessageSourceType.InstagramDirectMessage
                newMessage = 'Hello'
                attachmentCount = 1

                // When
                const result = canAddAttachments(
                    messageType,
                    newMessage,
                    attachmentCount
                )

                // Then
                expect(result?.message).toEqual(
                    'When using Instagram direct message, you can either send a text message, or an image attachment, but not both at the same time.'
                )
            })

            it('should allow to add when Instagram DM has no text', () => {
                // Given
                messageType = TicketMessageSourceType.InstagramDirectMessage
                newMessage = ''
                attachmentCount = 1

                // When
                const result = canAddAttachments(
                    messageType,
                    newMessage,
                    attachmentCount
                )

                // Then
                expect(result).toBeNull()
            })

            it('should not allow to add attachments to Instagram comments, even with no text', () => {
                // Given
                messageType = TicketMessageSourceType.InstagramComment
                newMessage = ''
                attachmentCount = 1

                // When
                const result = canAddAttachments(
                    messageType,
                    newMessage,
                    attachmentCount
                )

                // Then
                expect(result?.message).toEqual(
                    'When using Instagram comment, you can not send attachments.'
                )
            })

            it('should not allow to add attachments to Instagram mentions, even with no text', () => {
                // Given
                messageType = TicketMessageSourceType.InstagramMentionComment
                newMessage = ''
                attachmentCount = 1

                // When
                const result = canAddAttachments(
                    messageType,
                    newMessage,
                    attachmentCount
                )

                // Then
                expect(result?.message).toEqual(
                    'When using Instagram mention comment, you can not send attachments.'
                )
            })

            describe('only one attachment allowed', () => {
                beforeEach(() => {
                    attachmentCount = 2
                    newMessage = ''
                })

                it('should not allow to add when facebook-comment', () => {
                    // Given
                    messageType = TicketMessageSourceType.FacebookComment

                    // When
                    const result = canAddAttachments(
                        messageType,
                        newMessage,
                        attachmentCount
                    )

                    // Then
                    expect(result?.message).toEqual(
                        'When using Facebook comment, you can only send attachments one by one.'
                    )
                })

                it('should not allow to add when facebook-messenger', () => {
                    // Given
                    messageType = TicketMessageSourceType.InstagramDirectMessage

                    // When
                    const result = canAddAttachments(
                        messageType,
                        newMessage,
                        attachmentCount
                    )

                    // Then
                    expect(result?.message).toEqual(
                        'When using Instagram direct message, you can only send attachments one by one.'
                    )
                })
            })
        })
    })
})
