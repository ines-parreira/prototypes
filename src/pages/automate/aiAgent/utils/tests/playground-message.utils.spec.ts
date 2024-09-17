import {
    AiAgentMessageType,
    CreatePlaygroundMessage,
    MessageType,
    PlaygroundPromptType,
    PlaygroundMessage,
    isApiEligiblePlaygroundMessage,
} from 'models/aiAgentPlayground/types'
import {
    mapPlaygroundFormValuesToMessage,
    mapPlaygroundMessagesToServerMessages,
    shouldDisplayActions,
} from '../playground-messages.utils'
import {getSubmitPlaygroundTicketResponseFixture} from '../../fixtures/submitPlaygroundTicketResponse.fixture'

describe('playground-message utils', () => {
    describe('isPlaygroundMessageSupportedByServer', () => {
        it('should return true if message type is MESSAGE', () => {
            const message: PlaygroundMessage = {
                type: MessageType.MESSAGE,
                sender: 'agent',
                createdDatetime: '2021-07-29T09:00:00Z',
                content: 'Hello, how can I help you?',
            }
            expect(isApiEligiblePlaygroundMessage(message)).toBe(true)
        })
        it('should return false if message type is INTERNAL_NOTE', () => {
            const message: PlaygroundMessage = {
                type: MessageType.INTERNAL_NOTE,
                sender: 'agent',
                createdDatetime: '2021-07-29T09:00:00Z',
                content: 'This is an internal note',
            }
            expect(isApiEligiblePlaygroundMessage(message)).toBe(false)
        })

        it('should return true if action is RELEVANT_RESPONSE', () => {
            const message: PlaygroundMessage = {
                type: MessageType.PROMPT,
                sender: 'agent',
                content: 'This is a relevant response',
                createdDatetime: '2021-07-29T09:00:00Z',
                prompt: PlaygroundPromptType.RELEVANT_RESPONSE,
            }
            expect(isApiEligiblePlaygroundMessage(message)).toBe(true)
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

    describe('shouldDisplayActions ', () => {
        it('should return true if aiAgentResponse has chatTicketMessageMeta', () => {
            const aiAgentResponse = getSubmitPlaygroundTicketResponseFixture({
                postProcessing: {
                    internalNote: '',
                    htmlReply: null,
                    chatTicketMessageMeta: {
                        ai_agent_message_type:
                            AiAgentMessageType.WAIT_FOR_CLOSE_TICKET_CONFIRMATION,
                    },
                },
            })
            expect(shouldDisplayActions(aiAgentResponse)).toBe(true)
        })

        it('should return false if aiAgentResponse does not have chatTicketMessageMeta', () => {
            const aiAgentResponse = getSubmitPlaygroundTicketResponseFixture({
                postProcessing: {
                    internalNote: '',
                    htmlReply: null,
                    chatTicketMessageMeta: undefined,
                },
            })
            expect(shouldDisplayActions(aiAgentResponse)).toBe(false)
        })
    })
})
