import {
    CreatePlaygroundMessage,
    MessageType,
    PlaygroundMessage,
    isPlaygroundTextMessage,
} from 'models/aiAgentPlayground/types'
import {
    mapPlaygroundFormValuesToMessage,
    mapPlaygroundMessagesToServerMessages,
} from '../playground-messages.utils'

describe('playground-message utils', () => {
    describe('isPlaygroundTextMessage', () => {
        it('should return true if message type is MESSAGE', () => {
            const message: PlaygroundMessage = {
                type: MessageType.MESSAGE,
                sender: 'agent',
                createdDatetime: '2021-07-29T09:00:00Z',
                content: 'Hello, how can I help you?',
            }
            expect(isPlaygroundTextMessage(message)).toBe(true)
        })
        it('should return false if message type is INTERNAL_NOTE', () => {
            const message: PlaygroundMessage = {
                type: MessageType.INTERNAL_NOTE,
                sender: 'agent',
                createdDatetime: '2021-07-29T09:00:00Z',
                content: 'This is an internal note',
            }
            expect(isPlaygroundTextMessage(message)).toBe(false)
        })
    })

    describe('mapPlaygroundMessagesToServerMessages', () => {
        it('should map PlaygroundMessage to CreatePlaygroundMessage', () => {
            const messages: PlaygroundMessage[] = [
                {
                    type: MessageType.MESSAGE,
                    sender: 'agent',
                    createdDatetime: '2021-07-29T09:00:00Z',
                    content: 'Init message',
                },
                {
                    type: MessageType.MESSAGE,
                    sender: 'agent',
                    createdDatetime: '2021-07-29T09:00:00Z',
                    content: 'Hello, how can I help you?',
                },
                {
                    type: MessageType.INTERNAL_NOTE,
                    sender: 'customer',
                    createdDatetime: '2021-07-29T09:01:00Z',
                    content: 'I need help with my order',
                },
                {
                    type: MessageType.PLACEHOLDER,
                    sender: 'customer',
                    createdDatetime: '2021-07-29T09:01:00Z',
                },
            ]
            const expected: CreatePlaygroundMessage[] = [
                {
                    bodyText: 'Hello, how can I help you?',
                    fromAgent: false,
                    createdDatetime: '2021-07-29T09:00:00Z',
                },
            ]
            expect(mapPlaygroundMessagesToServerMessages(messages)).toEqual(
                expected
            )
        })
    })

    describe('mapPlaygroundFormValuesToMessage', () => {
        it('should map PlaygroundFormValues to PlaygroundMessage', () => {
            const formValues = {
                customerName: 'John Doe',
                customerEmail: 'test@mail.com',
                message: 'Hello, how can I help you?',
            }
            const expected: PlaygroundMessage = {
                sender: 'John Doe',
                type: MessageType.MESSAGE,
                content: 'Hello, how can I help you?',
                createdDatetime: expect.any(String),
            }
            expect(mapPlaygroundFormValuesToMessage(formValues)).toEqual(
                expected
            )
        })
    })
})
