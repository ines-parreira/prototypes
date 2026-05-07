import type { TestSessionLog } from 'models/aiAgentPlayground/types'
import {
    AgentSkill,
    MessageType,
    TestSessionLogType,
    TicketOutcome,
} from 'models/aiAgentPlayground/types'
import {
    AI_AGENT_SENDER,
    CUSTOMER_SENDER_FALLBACK,
} from 'pages/aiAgent/PlaygroundV2/constants'

import { handleAiAgentTestSessionLog } from '../playground-handler.utils'

describe('playground-handler.utils', () => {
    describe('handleAiAgentTestSessionLog', () => {
        const testDatetime = '2023-03-15T12:00:00Z'

        it('should return support message for AI_AGENT_REPLY type with no sales opportunity', () => {
            const log: TestSessionLog = {
                id: '00000000-0000-0000-0000-000000000001',
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
                id: '00000000-0000-0000-0000-000000000001',
                sender: AI_AGENT_SENDER,
                type: MessageType.MESSAGE,
                content: 'Reply message',
                agentSkill: AgentSkill.SUPPORT,
                createdDatetime: testDatetime,
                executionId: 'exec-123',
                isReasoningEligible: true,
            })
        })

        it('should return sales message for AI_AGENT_REPLY type with sales opportunity', () => {
            const log: TestSessionLog = {
                id: '00000000-0000-0000-0000-000000000001',
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
                id: '00000000-0000-0000-0000-000000000001',
                sender: AI_AGENT_SENDER,
                type: MessageType.MESSAGE,
                content: 'Sales reply message',
                agentSkill: AgentSkill.SALES,
                createdDatetime: testDatetime,
                executionId: 'exec-123',
                isReasoningEligible: true,
            })
        })

        it('should return ticket event for AI_AGENT_EXECUTION_FINISHED type', () => {
            const log: TestSessionLog = {
                id: '00000000-0000-0000-0000-000000000001',
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

        it('should return a customer message for SHOPPER_MESSAGE using the resolver', () => {
            const log: TestSessionLog = {
                id: 'shopper-1',
                accountId: 456,
                testModeSessionId: 'session-123',
                aiAgentExecutionId: 'exec-123',
                type: TestSessionLogType.SHOPPER_MESSAGE,
                createdDatetime: testDatetime,
                data: {
                    message: 'Where is my order?',
                    isSalesOpportunity: false,
                    isSalesDiscount: false,
                    isSalesOpportunityFieldId: null,
                    isSalesDiscountFieldId: null,
                    outcome: TicketOutcome.WAIT,
                    customerId: '42',
                },
            }

            const result = handleAiAgentTestSessionLog(log, undefined, (id) =>
                id === '42' ? 'Jane Doe' : undefined,
            )

            expect(result).toEqual({
                id: 'shopper-1',
                sender: 'Jane Doe',
                type: MessageType.MESSAGE,
                content: 'Where is my order?',
                createdDatetime: testDatetime,
            })
        })

        it('should fall back to CUSTOMER_SENDER_FALLBACK when resolver returns undefined', () => {
            const log: TestSessionLog = {
                id: 'shopper-2',
                accountId: 456,
                testModeSessionId: 'session-123',
                aiAgentExecutionId: 'exec-123',
                type: TestSessionLogType.SHOPPER_MESSAGE,
                createdDatetime: testDatetime,
                data: {
                    message: 'Hello',
                    isSalesOpportunity: false,
                    isSalesDiscount: false,
                    isSalesOpportunityFieldId: null,
                    isSalesDiscountFieldId: null,
                    outcome: TicketOutcome.WAIT,
                    customerId: '99',
                },
            }

            const result = handleAiAgentTestSessionLog(log)

            expect(result).toEqual({
                id: 'shopper-2',
                sender: CUSTOMER_SENDER_FALLBACK,
                type: MessageType.MESSAGE,
                content: 'Hello',
                createdDatetime: testDatetime,
            })
        })

        it('should drop SHOPPER_MESSAGE logs that are AI Journey triggers', () => {
            const log: TestSessionLog = {
                id: 'journey-trigger',
                accountId: 456,
                testModeSessionId: 'session-123',
                aiAgentExecutionId: 'exec-123',
                type: TestSessionLogType.SHOPPER_MESSAGE,
                createdDatetime: testDatetime,
                data: {
                    message: 'AI Journey triggered',
                    isSalesOpportunity: false,
                    isSalesDiscount: false,
                    isSalesOpportunityFieldId: null,
                    isSalesDiscountFieldId: null,
                    outcome: TicketOutcome.WAIT,
                },
            }

            expect(handleAiAgentTestSessionLog(log)).toBeNull()
        })

        it('should set isReasoningEligible to false when previous log is AI Journey triggered', () => {
            const aiJourneyTriggeredLog: TestSessionLog = {
                id: '123',
                accountId: 456,
                testModeSessionId: 'session-123',
                aiAgentExecutionId: 'exec-123',
                type: TestSessionLogType.SHOPPER_MESSAGE,
                createdDatetime: testDatetime,
                data: {
                    message: 'AI Journey triggered',
                    isSalesOpportunity: false,
                    isSalesDiscount: false,
                    isSalesOpportunityFieldId: null,
                    isSalesDiscountFieldId: null,
                    outcome: TicketOutcome.CLOSE,
                },
            }

            const aiAgentReplyLog: TestSessionLog = {
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

            const result = handleAiAgentTestSessionLog(
                aiAgentReplyLog,
                aiJourneyTriggeredLog,
            )
            expect(result?.isReasoningEligible).toBe(false)
        })
    })
})
