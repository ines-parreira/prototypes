import {
    AgentSkill,
    AiAgentMessageType,
    CreatePlaygroundMessage,
    isApiEligiblePlaygroundMessage,
    MessageType,
    PlaygroundMessage,
    PlaygroundPromptType,
} from 'models/aiAgentPlayground/types'

import { GREETING_MESSAGE } from '../../components/PlaygroundMessage/PlaygroundMessage'
import { DEFAULT_PLAYGROUND_CUSTOMER } from '../../constants'
import { getSubmitPlaygroundTicketResponseFixture } from '../../fixtures/submitPlaygroundTicketResponse.fixture'
import {
    getPlaygroundMessageMeta,
    mapPlaygroundFormValuesToMessage,
    mapPlaygroundMessagesToServerMessages,
    shouldDisplayActions,
} from '../playground-messages.utils'

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
                    agentSkill: AgentSkill.SUPPORT,
                    sender: 'agent',
                    createdDatetime: '2021-07-29T09:00:00Z',
                    content: 'Init message',
                },
                {
                    type: MessageType.MESSAGE,
                    agentSkill: AgentSkill.SUPPORT,
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
            expect(
                mapPlaygroundMessagesToServerMessages(messages, 'email'),
            ).toEqual(expected)
        })
    })

    describe('mapPlaygroundFormValuesToMessage', () => {
        it('should map PlaygroundFormValues to PlaygroundMessage', () => {
            const formValues = {
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
                message: 'Hello, how can I help you?',
            }
            const expected: PlaygroundMessage = {
                sender: DEFAULT_PLAYGROUND_CUSTOMER.name!,
                type: MessageType.MESSAGE,
                content: 'Hello, how can I help you?',
                createdDatetime: expect.any(String),
            }
            expect(mapPlaygroundFormValuesToMessage(formValues)).toEqual(
                expected,
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
                    isSalesOpportunity: false,
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
                    isSalesOpportunity: false,
                },
            })
            expect(shouldDisplayActions(aiAgentResponse)).toBe(false)
        })
    })

    describe('getPlaygroundMessageMeta', () => {
        it('should return entry customer message type for first shopper message', () => {
            const message: PlaygroundMessage = {
                type: MessageType.MESSAGE,
                content: 'Test message',
                sender: 'User',
                createdDatetime: '2021-07-29T09:00:00Z',
            }

            const result = getPlaygroundMessageMeta({
                message,
                firstShopperMessage: true,
            })

            expect(result).toEqual({
                ai_agent_message_type:
                    AiAgentMessageType.ENTRY_CUSTOMER_MESSAGE,
            })
        })

        it('should return relevant true for prompt message with relevant response', () => {
            const message: PlaygroundMessage = {
                type: MessageType.PROMPT,
                prompt: PlaygroundPromptType.RELEVANT_RESPONSE,
                content: 'Test prompt',
                sender: 'User',
                createdDatetime: '2021-07-29T09:00:00Z',
            }

            const result = getPlaygroundMessageMeta({ message })

            expect(result).toEqual({
                ai_agent_message_type: 'ai_agent_response_relevant_true',
            })
        })

        it('should return relevant false for prompt message with non-relevant response', () => {
            const message: PlaygroundMessage = {
                type: MessageType.PROMPT,
                prompt: PlaygroundPromptType.NOT_RELEVANT_RESPONSE,
                content: 'Test prompt',
                sender: 'User',
                createdDatetime: '2021-07-29T09:00:00Z',
            }

            const result = getPlaygroundMessageMeta({ message })

            expect(result).toEqual({
                ai_agent_message_type: 'ai_agent_response_relevant_false',
            })
        })

        it('should return greeting type for greeting message', () => {
            const message: PlaygroundMessage = {
                type: MessageType.MESSAGE,
                content: GREETING_MESSAGE,
                sender: 'User',
                createdDatetime: '2021-07-29T09:00:00Z',
            }

            const result = getPlaygroundMessageMeta({ message })

            expect(result).toEqual({
                ai_agent_message_type: AiAgentMessageType.GREETING,
            })
        })

        it('should return undefined for non-matching message', () => {
            const message: PlaygroundMessage = {
                type: MessageType.MESSAGE,
                content: 'Regular message',
                sender: 'User',
                createdDatetime: '2021-07-29T09:00:00Z',
            }

            const result = getPlaygroundMessageMeta({ message })

            expect(result).toBeUndefined()
        })

        it('should set the given channel availability', () => {
            const message: PlaygroundMessage = {
                type: MessageType.MESSAGE,
                content: 'Test message',
                sender: 'User',
                createdDatetime: '2021-07-29T09:00:00Z',
            }

            const result = getPlaygroundMessageMeta({
                message,
                firstShopperMessage: true,
                channelAvailability: 'online',
            })

            expect(result).toEqual({
                ai_agent_message_type:
                    AiAgentMessageType.ENTRY_CUSTOMER_MESSAGE,
                chat_availability: 'online',
            })
        })
    })
})
