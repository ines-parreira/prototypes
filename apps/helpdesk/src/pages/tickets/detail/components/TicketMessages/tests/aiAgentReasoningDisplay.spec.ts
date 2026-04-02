import { TicketVia } from 'business/types/ticket'

import {
    getAiAgentReasoningDisplayMode,
    getShouldTicketHaveReasoning,
} from '../aiAgentReasoningDisplay'

describe('getShouldTicketHaveReasoning', () => {
    it('returns null when earliest execution is unresolved', () => {
        expect(
            getShouldTicketHaveReasoning({
                earliestExecution: undefined,
                messageCreatedDatetime: '2025-06-01T00:00:00Z',
            }),
        ).toBeNull()
    })

    it('returns false when the earliest execution has no reasoning timestamp', () => {
        expect(
            getShouldTicketHaveReasoning({
                earliestExecution: {
                    reasoningTimestamp: undefined,
                },
                messageCreatedDatetime: '2025-06-01T00:00:00Z',
            }),
        ).toBe(false)
    })

    it('returns true only for messages created after the reasoning timestamp', () => {
        expect(
            getShouldTicketHaveReasoning({
                earliestExecution: {
                    reasoningTimestamp: '2025-05-31T23:59:59Z',
                },
                messageCreatedDatetime: '2025-06-01T00:00:00Z',
            }),
        ).toBe(true)

        expect(
            getShouldTicketHaveReasoning({
                earliestExecution: {
                    reasoningTimestamp: '2025-06-01T00:00:00Z',
                },
                messageCreatedDatetime: '2025-06-01T00:00:00Z',
            }),
        ).toBe(false)
    })
})

describe('getAiAgentReasoningDisplayMode', () => {
    const reasoningEligibleParams = {
        isAIAgentMessage: true,
        isInternalNote: false,
        isTicketAfterFeedbackCollectionPeriod: true,
        shouldTicketHaveReasoning: true,
        showAiReasoning: true,
        onlyShowReasoningWhileImpersonating: false,
        isImpersonated: false,
        messageId: 123,
        messageVia: TicketVia.Api,
    } as const

    it('returns hidden when the item is not an ai agent message', () => {
        expect(
            getAiAgentReasoningDisplayMode({
                ...reasoningEligibleParams,
                isAIAgentMessage: false,
            }),
        ).toBe('hidden')
    })

    it('returns simplified banner before the feedback collection period', () => {
        expect(
            getAiAgentReasoningDisplayMode({
                ...reasoningEligibleParams,
                isTicketAfterFeedbackCollectionPeriod: false,
            }),
        ).toBe('simplified-banner')
    })

    it('returns simplified banner for ai agent internal notes', () => {
        expect(
            getAiAgentReasoningDisplayMode({
                ...reasoningEligibleParams,
                isInternalNote: true,
            }),
        ).toBe('simplified-banner')
    })

    it('returns simplified banner when impersonation is required but absent', () => {
        expect(
            getAiAgentReasoningDisplayMode({
                ...reasoningEligibleParams,
                onlyShowReasoningWhileImpersonating: true,
            }),
        ).toBe('simplified-banner')
    })

    it('returns reasoning when all eligibility gates pass', () => {
        expect(getAiAgentReasoningDisplayMode(reasoningEligibleParams)).toBe(
            'reasoning',
        )
    })
})
