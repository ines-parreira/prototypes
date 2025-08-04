import {
    AgentSkill,
    AiAgentMessageType,
    MessageType,
    TestSessionLog,
    TestSessionLogType,
    TicketOutcome,
} from 'models/aiAgentPlayground/types'

import { getStoreConfigurationFixture } from '../../../fixtures/storeConfiguration.fixtures'
import { getSubmitPlaygroundTicketResponseFixture } from '../../../fixtures/submitPlaygroundTicketResponse.fixture'
import { AI_AGENT_SENDER } from '../../components/PlaygroundMessage/PlaygroundMessage'
import {
    handleAiAgentResponse,
    handleAiAgentTestSessionLog,
} from '../playground-handler.utils'

const DATE = new Date('2020-01-01')

describe('playground-handler.utils', () => {
    describe('handleAiAgentResponse', () => {
        beforeEach(() => {
            jest.useFakeTimers().setSystemTime(DATE)
        })
        describe('when channel is email', () => {
            it('should return message with close ticket when outcome is close', () => {
                const aiAgentResponse =
                    getSubmitPlaygroundTicketResponseFixture()

                const result = handleAiAgentResponse({
                    aiAgentResponse,
                    channel: 'email',
                    storeData: getStoreConfigurationFixture(),
                })
                expect(result).toEqual([
                    {
                        sender: AI_AGENT_SENDER,
                        type: MessageType.TICKET_EVENT,
                        outcome: TicketOutcome.CLOSE,
                        createdDatetime: DATE.toISOString(),
                    },
                ])
            })

            it('should return message with open ticket when outcome is wait', () => {
                const aiAgentResponse =
                    getSubmitPlaygroundTicketResponseFixture({
                        generate: {
                            output: {
                                generated_message: 'message',
                                outcome: TicketOutcome.WAIT,
                            },
                        },
                    })
                const result = handleAiAgentResponse({
                    aiAgentResponse,
                    channel: 'email',
                    storeData: getStoreConfigurationFixture(),
                })
                expect(result).toEqual([
                    {
                        sender: AI_AGENT_SENDER,
                        type: MessageType.TICKET_EVENT,
                        outcome: TicketOutcome.WAIT,
                        createdDatetime: DATE.toISOString(),
                    },
                ])
            })

            it('should return a message with a generated response and internal note', () => {
                const aiAgentResponse =
                    getSubmitPlaygroundTicketResponseFixture({
                        generate: {
                            output: {
                                generated_message: 'Generated email message',
                                outcome: TicketOutcome.CLOSE,
                            },
                        },
                        postProcessing: {
                            htmlReply: 'HTML reply for email',
                            internalNote: 'Internal note for email',
                            isSalesOpportunity: false,
                        },
                    })

                const result = handleAiAgentResponse({
                    aiAgentResponse,
                    channel: 'email',
                    storeData: getStoreConfigurationFixture(),
                })

                expect(result).toEqual([
                    {
                        sender: AI_AGENT_SENDER,
                        type: MessageType.MESSAGE,
                        content: 'HTML reply for email',
                        createdDatetime: DATE.toISOString(),
                        attachments: [],
                    },
                    {
                        sender: AI_AGENT_SENDER,
                        type: MessageType.INTERNAL_NOTE,
                        content: 'Internal note for email',
                        createdDatetime: DATE.toISOString(),
                        attachments: [],
                    },
                    {
                        sender: AI_AGENT_SENDER,
                        type: MessageType.TICKET_EVENT,
                        outcome: TicketOutcome.CLOSE,
                        createdDatetime: DATE.toISOString(),
                    },
                ])
            })

            it('should return ticket event message when outcome is validated', () => {
                const aiAgentResponse =
                    getSubmitPlaygroundTicketResponseFixture({
                        generate: {
                            output: {
                                generated_message: 'Generated email message',
                                outcome: TicketOutcome.CLOSE,
                            },
                        },
                        qa: {
                            output: {
                                validate_outcome: true,
                                validate_generated_message: true,
                            },
                        },
                    })

                const result = handleAiAgentResponse({
                    aiAgentResponse,
                    channel: 'email',
                    storeData: getStoreConfigurationFixture(),
                })

                expect(result).toEqual([
                    {
                        sender: AI_AGENT_SENDER,
                        type: MessageType.TICKET_EVENT,
                        outcome: TicketOutcome.CLOSE,
                        createdDatetime: DATE.toISOString(),
                    },
                ])
            })
        })

        describe('when channel is chat', () => {
            it('should return a generated message when validated', () => {
                const aiAgentResponse =
                    getSubmitPlaygroundTicketResponseFixture({
                        generate: {
                            output: {
                                generated_message: 'Chat generated message',
                                outcome: TicketOutcome.CLOSE,
                            },
                        },
                        qa: {
                            output: {
                                validate_outcome: true,
                                validate_generated_message: true,
                            },
                        },
                    })

                const result = handleAiAgentResponse({
                    aiAgentResponse,
                    channel: 'chat',
                    storeData: getStoreConfigurationFixture(),
                })

                expect(result).toEqual([
                    {
                        sender: AI_AGENT_SENDER,
                        type: MessageType.MESSAGE,
                        agentSkill: AgentSkill.SUPPORT,
                        content: 'Chat generated message',
                        createdDatetime: DATE.toISOString(),
                        attachments: [],
                    },
                    {
                        sender: AI_AGENT_SENDER,
                        type: MessageType.TICKET_EVENT,
                        outcome: TicketOutcome.CLOSE,
                        createdDatetime: DATE.toISOString(),
                    },
                ])
            })
            it('should return a ticket event for handover to agent', () => {
                const aiAgentResponse =
                    getSubmitPlaygroundTicketResponseFixture({
                        qa: {
                            output: {
                                validate_outcome: false,
                                validate_generated_message: false,
                            },
                        },
                        postProcessing: {
                            htmlReply: null,
                            internalNote: '',
                            chatTicketMessageMeta: {
                                ai_agent_message_type:
                                    AiAgentMessageType.HANDOVER_TO_AGENT,
                            },
                            isSalesOpportunity: false,
                        },
                    })

                const result = handleAiAgentResponse({
                    aiAgentResponse,
                    channel: 'chat',
                    storeData: getStoreConfigurationFixture(),
                })

                expect(result).toEqual([
                    {
                        sender: AI_AGENT_SENDER,
                        type: MessageType.TICKET_EVENT,
                        outcome: TicketOutcome.HANDOVER,
                        createdDatetime: DATE.toISOString(),
                    },
                ])
            })

            it.each([
                { isSalesOpportunity: false, agentSkill: AgentSkill.SUPPORT },
                { isSalesOpportunity: true, agentSkill: AgentSkill.SALES },
            ])(
                'should return "Was that helpful?" message when actions should be displayed',
                ({ isSalesOpportunity, agentSkill }) => {
                    const aiAgentResponse =
                        getSubmitPlaygroundTicketResponseFixture({
                            postProcessing: {
                                internalNote: '',
                                htmlReply: null,
                                chatTicketMessageMeta: {
                                    ai_agent_message_type:
                                        AiAgentMessageType.WAIT_FOR_CLOSE_TICKET_CONFIRMATION,
                                },
                                isSalesOpportunity,
                            },
                            qa: {
                                output: {
                                    validate_generated_message: false,
                                    validate_outcome: false,
                                },
                            },
                        })

                    const result = handleAiAgentResponse({
                        aiAgentResponse,
                        channel: 'chat',
                        storeData: getStoreConfigurationFixture(),
                    })

                    expect(result).toEqual([
                        {
                            sender: AI_AGENT_SENDER,
                            type: MessageType.MESSAGE,
                            agentSkill,
                            content: 'Was that helpful?',
                            createdDatetime: DATE.toISOString(),
                        },
                        {
                            sender: AI_AGENT_SENDER,
                            type: MessageType.TICKET_EVENT,
                            outcome: TicketOutcome.WAIT,
                            createdDatetime: DATE.toISOString(),
                        },
                    ])
                },
            )
            it('should return ticket event based on ai agent message type', () => {
                const aiAgentResponse =
                    getSubmitPlaygroundTicketResponseFixture({
                        postProcessing: {
                            internalNote: '',
                            htmlReply: null,
                            chatTicketMessageMeta: {
                                ai_agent_message_type:
                                    AiAgentMessageType.HANDOVER_TO_AGENT,
                            },
                            isSalesOpportunity: false,
                        },
                        qa: {
                            output: {
                                validate_generated_message: false,
                                validate_outcome: false,
                            },
                        },
                    })

                const result = handleAiAgentResponse({
                    aiAgentResponse,
                    channel: 'chat',
                    storeData: getStoreConfigurationFixture(),
                })

                expect(result).toEqual([
                    {
                        sender: AI_AGENT_SENDER,
                        type: MessageType.TICKET_EVENT,
                        outcome: TicketOutcome.HANDOVER,
                        createdDatetime: DATE.toISOString(),
                    },
                ])
            })
            it('should get message from generated output if htmlReply is empty', () => {
                const aiAgentResponse =
                    getSubmitPlaygroundTicketResponseFixture({
                        qa: {
                            output: {
                                validate_outcome: true,
                                validate_generated_message: true,
                            },
                        },
                        generate: {
                            output: {
                                generated_message:
                                    'Your last order number is #1234',
                                outcome: TicketOutcome.CLOSE,
                            },
                        },
                        postProcessing: {
                            htmlReply: null,
                            internalNote: '',
                            chatTicketMessageMeta: {
                                ai_agent_message_type:
                                    AiAgentMessageType.WAIT_FOR_CLOSE_TICKET_CONFIRMATION,
                            },
                            isSalesOpportunity: false,
                        },
                    })

                const result = handleAiAgentResponse({
                    aiAgentResponse,
                    channel: 'chat',
                    storeData: getStoreConfigurationFixture(),
                })

                expect(result).toEqual(
                    expect.arrayContaining([
                        {
                            sender: AI_AGENT_SENDER,
                            type: MessageType.MESSAGE,
                            agentSkill: AgentSkill.SUPPORT,
                            content: 'Your last order number is #1234',
                            createdDatetime: DATE.toISOString(),
                            attachments: [],
                        },
                    ]),
                )
            })
        })

        it('should return an empty array when no messages should be displayed', () => {
            const aiAgentResponse = getSubmitPlaygroundTicketResponseFixture({
                generate: {
                    output: {
                        generated_message: '',
                        outcome: TicketOutcome.CLOSE,
                    },
                },
                qa: {
                    output: {
                        validate_outcome: false,
                        validate_generated_message: false,
                    },
                },
            })
            const result = handleAiAgentResponse({
                aiAgentResponse,
                channel: 'chat',
                storeData: getStoreConfigurationFixture(),
            })
            expect(result).toEqual([])
        })

        it('should return internal note when internal note field is not empty', () => {
            const aiAgentResponse = getSubmitPlaygroundTicketResponseFixture({
                postProcessing: {
                    internalNote: 'Internal note',
                    htmlReply: null,
                    isSalesOpportunity: false,
                },
            })
            const result = handleAiAgentResponse({
                aiAgentResponse,
                channel: 'chat',
                storeData: getStoreConfigurationFixture(),
            })
            expect(result).toEqual(
                expect.arrayContaining([
                    {
                        sender: AI_AGENT_SENDER,
                        type: MessageType.INTERNAL_NOTE,
                        content: 'Internal note',
                        createdDatetime: DATE.toISOString(),
                        attachments: [],
                    },
                ]),
            )
        })

        it.each([
            { isSalesOpportunity: false, agentSkill: AgentSkill.SUPPORT },
            { isSalesOpportunity: true, agentSkill: AgentSkill.SALES },
        ])(
            'should return message when generated message is not empty and qa is failed and post processing reply is not empty',
            ({ isSalesOpportunity, agentSkill }) => {
                const aiAgentResponse =
                    getSubmitPlaygroundTicketResponseFixture({
                        generate: {
                            output: {
                                generated_message: 'Generated message',
                                outcome: TicketOutcome.CLOSE,
                            },
                        },
                        postProcessing: {
                            internalNote: '',
                            htmlReply: 'Post Processing message',
                            isSalesOpportunity,
                        },
                        qa: {
                            output: {
                                validate_outcome: false,
                                validate_generated_message: false,
                            },
                        },
                    })
                const result = handleAiAgentResponse({
                    aiAgentResponse,
                    channel: 'chat',
                    storeData: getStoreConfigurationFixture(),
                })
                expect(result).toEqual(
                    expect.arrayContaining([
                        {
                            sender: AI_AGENT_SENDER,
                            type: MessageType.MESSAGE,
                            agentSkill,
                            content: 'Post Processing message',
                            createdDatetime: DATE.toISOString(),
                            attachments: [],
                        },
                    ]),
                )
            },
        )
    })

    describe('handleAiAgentTestSessionLog', () => {
        const testDatetime = '2023-03-15T12:00:00Z'

        it('should return internal note for AI_AGENT_INSIGHT type', () => {
            const log: TestSessionLog = {
                id: '123',
                accountId: 456,
                testModeSessionId: 'session-123',
                aiAgentExecutionId: 'exec-123',
                type: TestSessionLogType.AI_AGENT_INSIGHT,
                createdDatetime: testDatetime,
                data: {
                    message: 'Insight message',
                    isSalesOpportunity: false,
                    isSalesDiscount: false,
                    isSalesOpportunityFieldId: null,
                    isSalesDiscountFieldId: null,
                    outcome: TicketOutcome.CLOSE,
                },
            }

            const result = handleAiAgentTestSessionLog(log)

            expect(result).toEqual({
                sender: AI_AGENT_SENDER,
                type: MessageType.INTERNAL_NOTE,
                content: 'Insight message',
                createdDatetime: testDatetime,
            })
        })

        it('should return support message for AI_AGENT_REPLY type with no sales opportunity', () => {
            const log: TestSessionLog = {
                id: '123',
                accountId: 456,
                testModeSessionId: 'session-123',
                aiAgentExecutionId: 'exec-123',
                type: TestSessionLogType.AI_AGENT_REPLY,
                createdDatetime: testDatetime,
                data: {
                    message: 'Reply message',
                    isSalesOpportunity: false,
                    isSalesDiscount: false,
                    isSalesOpportunityFieldId: null,
                    isSalesDiscountFieldId: null,
                    outcome: TicketOutcome.CLOSE,
                },
            }

            const result = handleAiAgentTestSessionLog(log)

            expect(result).toEqual({
                sender: AI_AGENT_SENDER,
                type: MessageType.MESSAGE,
                content: 'Reply message',
                agentSkill: AgentSkill.SUPPORT,
                createdDatetime: testDatetime,
                executionId: 'exec-123',
            })
        })

        it('should return sales message for AI_AGENT_REPLY type with sales opportunity', () => {
            const log: TestSessionLog = {
                id: '123',
                accountId: 456,
                testModeSessionId: 'session-123',
                aiAgentExecutionId: 'exec-123',
                type: TestSessionLogType.AI_AGENT_REPLY,
                createdDatetime: testDatetime,
                data: {
                    message: 'Sales reply message',
                    isSalesOpportunity: true,
                    isSalesDiscount: false,
                    isSalesOpportunityFieldId: 789,
                    isSalesDiscountFieldId: null,
                    outcome: TicketOutcome.CLOSE,
                },
            }

            const result = handleAiAgentTestSessionLog(log)

            expect(result).toEqual({
                sender: AI_AGENT_SENDER,
                type: MessageType.MESSAGE,
                content: 'Sales reply message',
                agentSkill: AgentSkill.SALES,
                createdDatetime: testDatetime,
                executionId: 'exec-123',
            })
        })

        it('should return ticket event for AI_AGENT_EXECUTION_FINISHED type', () => {
            const log: TestSessionLog = {
                id: '123',
                accountId: 456,
                testModeSessionId: 'session-123',
                aiAgentExecutionId: 'exec-123',
                type: TestSessionLogType.AI_AGENT_EXECUTION_FINISHED,
                createdDatetime: testDatetime,
                data: {
                    message: '',
                    isSalesOpportunity: false,
                    isSalesDiscount: false,
                    isSalesOpportunityFieldId: null,
                    isSalesDiscountFieldId: null,
                    outcome: TicketOutcome.HANDOVER,
                },
            }

            const result = handleAiAgentTestSessionLog(log)

            expect(result).toEqual({
                sender: AI_AGENT_SENDER,
                type: MessageType.TICKET_EVENT,
                outcome: TicketOutcome.HANDOVER,
                createdDatetime: testDatetime,
            })
        })

        it('should return null for unknown log type', () => {
            const log = {
                id: '123',
                accountId: 456,
                testModeSessionId: 'session-123',
                aiAgentExecutionId: 'exec-123',
                type: 'unknown-type' as TestSessionLogType,
                createdDatetime: testDatetime,
                data: {
                    message: '',
                    isSalesOpportunity: false,
                    isSalesDiscount: false,
                    isSalesOpportunityFieldId: null,
                    isSalesDiscountFieldId: null,
                    outcome: TicketOutcome.CLOSE,
                },
            }

            const result = handleAiAgentTestSessionLog(log as TestSessionLog)

            expect(result).toBeNull()
        })
    })
})
