import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'

import {
    hasFailedAction,
    hasPendingAction,
    isFailed,
    isGorgiasContactFormTicketMeta,
    isPending,
    isTicketChannel,
    isTicketMessageSourceType,
    shouldMessagesBeGrouped,
} from '../predicates'
import {TicketMessage, ActionStatus, MessageMetadataType} from '../types'

import {action as defaultAction, message as defaultMessage} from './mocks'

describe('predicates', () => {
    describe('hasFailedAction', () => {
        it('should return false if no actions', () => {
            expect(hasFailedAction(defaultMessage)).toBe(false)
        })

        it('should return false if no failed action', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                actions: [defaultAction],
            }
            expect(hasFailedAction(message)).toBe(false)
        })

        it('should return true if has failed action', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                actions: [
                    defaultAction,
                    {
                        ...defaultAction,
                        status: ActionStatus.Error,
                    },
                ],
            }
            expect(hasFailedAction(message)).toBe(true)
        })
    })

    describe('hasPendingAction', () => {
        it('should return false if no actions', () => {
            expect(hasPendingAction(defaultMessage)).toBe(false)
        })

        it('should return false if no failed action', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                actions: [defaultAction],
            }
            expect(hasPendingAction(message)).toBe(false)
        })

        it('should return true if has pending action', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                actions: [
                    defaultAction,
                    {
                        ...defaultAction,
                        status: ActionStatus.Pending,
                    },
                ],
            }
            expect(hasPendingAction(message)).toBe(true)
        })
    })

    describe('isPending', () => {
        it('should return false if no actions', () => {
            expect(isPending(defaultMessage)).toBe(false)
        })

        it('should return true if has pending action', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                actions: [
                    {
                        ...defaultAction,
                        status: ActionStatus.Pending,
                    },
                ],
            }
            expect(isPending(message)).toBe(true)
        })

        it('should return false if has failed and pending', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                actions: [
                    {
                        ...defaultAction,
                        status: ActionStatus.Error,
                    },
                    {
                        ...defaultAction,
                        status: ActionStatus.Pending,
                    },
                ],
            }
            expect(isPending(message)).toBe(false)
        })

        it('should return true if message is pending', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                isPending: true,
            }
            expect(isPending(message)).toBe(true)
        })

        it('should return true if message is pending and has failed actions', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                isPending: true,
                actions: [
                    {
                        ...defaultAction,
                        status: ActionStatus.Error,
                    },
                ],
            }
            expect(isPending(message)).toBe(true)
        })

        it('should return false if message is an email and isPending', () => {
            const message = {
                ...defaultMessage,
                isPending: true,
                source: {
                    type: TicketMessageSourceType.Email,
                },
            } as unknown as TicketMessage
            expect(isPending(message)).toBe(false)
        })
    })

    describe('isFailed', () => {
        it('should return false if no actions', () => {
            expect(isFailed(defaultMessage)).toBe(false)
        })

        it('should return true if it has failed datetime', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                failed_datetime: '2018-01-01T09:30:11.000Z',
            }
            expect(isFailed(message)).toBe(true)
        })

        it('should return true if it has failed action', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                actions: [
                    {
                        ...defaultAction,
                        status: ActionStatus.Error,
                    },
                ],
            }
            expect(isFailed(message)).toBe(true)
        })

        it('should return false if it has failed action and is pending', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                isPending: true,
                actions: [
                    {
                        ...defaultAction,
                        status: ActionStatus.Error,
                    },
                ],
            }
            expect(isFailed(message)).toBe(false)
        })
    })

    describe('shouldMessagesBeGrouped', () => {
        it('should return false if either object is not a message', () => {
            const msg1 = {} as TicketMessage
            const msg2 = {} as TicketMessage
            expect(shouldMessagesBeGrouped(msg1, msg2)).toBeFalsy()
        })

        it('should return false if the senders are different', () => {
            const msg1 = {
                ...defaultMessage,
                sender: {...defaultMessage.sender, id: 1},
            }
            const msg2 = {
                ...defaultMessage,
                sender: {...defaultMessage.sender, id: 2},
            }
            expect(shouldMessagesBeGrouped(msg1, msg2)).toBeFalsy()
        })

        it('should return false if the channels are different', () => {
            const msg1 = {
                ...defaultMessage,
                channel: TicketChannel.Chat,
            }
            const msg2 = {
                ...defaultMessage,
                channel: TicketChannel.FacebookMessenger,
            }
            expect(shouldMessagesBeGrouped(msg1, msg2)).toBeFalsy()
        })

        it('should return false if the public settings are different', () => {
            const msg1 = {
                ...defaultMessage,
                public: true,
            }
            const msg2 = {
                ...defaultMessage,
                public: false,
            }
            expect(shouldMessagesBeGrouped(msg1, msg2)).toBeFalsy()
        })

        it('should return false if the messages are not both (not) from an agend', () => {
            const msg1 = {
                ...defaultMessage,
                from_agent: true,
            }
            const msg2 = {
                ...defaultMessage,
                from_agent: false,
            }
            expect(shouldMessagesBeGrouped(msg1, msg2)).toBeFalsy()
        })

        it('should return false if the channel does not qualify for grouping', () => {
            const msg1 = {
                ...defaultMessage,
                channel: TicketChannel.Phone,
            }
            const msg2 = {
                ...defaultMessage,
                channel: TicketChannel.Phone,
            }
            expect(shouldMessagesBeGrouped(msg1, msg2)).toBeFalsy()
        })

        it('should return false if the messages are more than 5 minutes apart', () => {
            const msg1 = {
                ...defaultMessage,
                channel: TicketChannel.Chat,
                created_datetime: '2023-02-02T14:50:00',
            }
            const msg2 = {
                ...defaultMessage,
                channel: TicketChannel.Chat,
                created_datetime: '2023-02-02T14:56:00',
            }
            expect(shouldMessagesBeGrouped(msg1, msg2)).toBeFalsy()
        })

        it.each([
            {
                firstMessageType: MessageMetadataType.Message,
                secondMessageType: MessageMetadataType.Signal,
            },
            {
                firstMessageType: MessageMetadataType.Signal,
                secondMessageType: MessageMetadataType.Message,
            },
            {
                firstMessageType: MessageMetadataType.Signal,
                secondMessageType: MessageMetadataType.Signal,
            },
        ])(
            'should return false if either of the messages is a signal',
            ({firstMessageType, secondMessageType}) => {
                const msg1 = {
                    ...defaultMessage,
                    channel: TicketChannel.Chat,
                    created_datetime: '2023-02-02T14:50:00',
                    meta: {
                        type: firstMessageType,
                    },
                }
                const msg2 = {
                    ...defaultMessage,
                    channel: TicketChannel.Chat,
                    created_datetime: '2023-02-02T14:54:00',
                    meta: {
                        type: secondMessageType,
                    },
                }
                expect(shouldMessagesBeGrouped(msg1, msg2)).toBeFalsy()
            }
        )

        it('should return true if the messages satisfy all grouping conditions', () => {
            const msg1 = {
                ...defaultMessage,
                channel: TicketChannel.Chat,
                created_datetime: '2023-02-02T14:50:00',
            }
            const msg2 = {
                ...defaultMessage,
                channel: TicketChannel.Chat,
                created_datetime: '2023-02-02T14:54:00',
            }
            expect(shouldMessagesBeGrouped(msg1, msg2)).toBeTruthy()
        })
    })

    describe('isGorgiasContactFormTicketMeta', () => {
        it.each([undefined, null])(
            'returns false if the input is falsy',
            (input) => {
                expect(isGorgiasContactFormTicketMeta(input)).toBeFalsy()
            }
        )

        it('returns true if the input looks like a "gorgias_contact_form" meta field', () => {
            const input = {
                gorgias_contact_form: {
                    is_embedded: true,
                    host_url: 'https://contact.gorgias.help/forms/abcd1234',
                    contact_form_id: 1,
                    contact_form_uid: 'abcd1234',
                    contact_form_locale_id: 1,
                    help_center_id: 2,
                },
            }

            expect(isGorgiasContactFormTicketMeta(input)).toBeTruthy()
        })
    })

    describe('isTicketMessageSourceType()', () => {
        it('should return true for valid ticket message source types', () => {
            expect(isTicketMessageSourceType('email')).toBe(true)
            expect(isTicketMessageSourceType('sms')).toBe(true)
            expect(
                isTicketMessageSourceType(
                    TicketMessageSourceType.WhatsAppMessage
                )
            ).toBe(true)
        })

        it('should return false for invalid ticket message source types', () => {
            expect(isTicketMessageSourceType(null)).toBe(false)
            expect(isTicketMessageSourceType(undefined)).toBe(false)
            expect(isTicketMessageSourceType('nope')).toBe(false)
            expect(isTicketMessageSourceType(123)).toBe(false)
            expect(isTicketMessageSourceType(TicketChannel.WhatsApp)).toBe(
                false
            )
        })
    })

    describe('isTicketChannel()', () => {
        it('should return true for valid ticket channels', () => {
            expect(isTicketChannel('email')).toBe(true)
            expect(isTicketChannel('sms')).toBe(true)
            expect(isTicketChannel(TicketChannel.WhatsApp)).toBe(true)
        })

        it('should return false for invalid ticket channels', () => {
            expect(isTicketChannel(null)).toBe(false)
            expect(isTicketChannel(undefined)).toBe(false)
            expect(isTicketChannel('nope')).toBe(false)
            expect(isTicketChannel(123)).toBe(false)
            expect(
                isTicketChannel(TicketMessageSourceType.WhatsAppMessage)
            ).toBe(false)
        })
    })
})
