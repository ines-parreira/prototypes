import type {
    GetTestSessionLogsResponse,
    TestSessionLog,
} from 'models/aiAgentPlayground/types'
import {
    TestSessionLogType,
    TicketOutcome,
} from 'models/aiAgentPlayground/types'

export const getTestSessionLogFixture = (
    overrides?: Partial<TestSessionLog>,
): TestSessionLog => ({
    id: 'log-1',
    accountId: 456,
    testModeSessionId: 'session-123',
    aiAgentExecutionId: 'exec-123',
    type: TestSessionLogType.AI_AGENT_REPLY,
    createdDatetime: '2023-03-15T12:00:00Z',
    data: {
        message: 'Reply message',
        isSalesOpportunity: false,
        isSalesDiscount: false,
        isSalesOpportunityFieldId: null,
        isSalesDiscountFieldId: null,
        outcome: TicketOutcome.CLOSE,
    },
    ...overrides,
})

export const getTestSessionLogsFixture = (
    overrides?: Partial<GetTestSessionLogsResponse>,
): GetTestSessionLogsResponse => ({
    id: '123',
    status: 'in-progress',
    logs: [getTestSessionLogFixture()],
    ...overrides,
})

export const getTestSessionLogsWithDuplicateIdsFixture = (
    message = 'Duplicate message',
): GetTestSessionLogsResponse => {
    const log = getTestSessionLogFixture({
        id: 'log-dup',
        data: {
            message,
            isSalesOpportunity: false,
            isSalesDiscount: false,
            isSalesOpportunityFieldId: null,
            isSalesDiscountFieldId: null,
            outcome: TicketOutcome.CLOSE,
        },
    })
    return getTestSessionLogsFixture({ logs: [log, log] })
}
