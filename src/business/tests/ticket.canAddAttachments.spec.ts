import {canAddAttachments} from '../ticket'
import {TicketMessageSourceType} from '../types/ticket'

describe('Business', () => {
    describe('ticket', () => {
        describe('canAddAttachments()', () => {
            let messageType: TicketMessageSourceType
            let newMessage: string
            let attachmentCount: number

            it('should not allow to add when facebook-messenger has already text', () => {
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
