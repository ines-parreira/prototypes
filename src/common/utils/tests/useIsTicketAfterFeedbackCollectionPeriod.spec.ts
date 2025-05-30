import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { useGetAiAgentFeedback } from 'models/aiAgentFeedback/queries'
import { renderHook } from 'utils/testing/renderHook'

import {
    FIRST_CONSUMED_ORCH_EVENT_DATETIME,
    NUMBER_OF_MONTHS_TO_SKIP_NEW_FEEDBACK_COLLECTION,
    useTicketIsAfterFeedbackCollectionPeriod,
} from '../useIsTicketAfterFeedbackCollectionPeriod'

// Mock dependencies
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('models/aiAgentFeedback/queries', () => ({
    useGetAiAgentFeedback: jest.fn(),
}))
jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const mockUseAppSelector = useAppSelector as jest.MockedFunction<
    typeof useAppSelector
>
const mockUseGetAiAgentFeedback = useGetAiAgentFeedback as jest.MockedFunction<
    typeof useGetAiAgentFeedback
>
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

// Helper function to calculate dates relative to the cutoff date
const getDateRelativeToBaseline = (monthOffset: number): string => {
    const date = new Date(FIRST_CONSUMED_ORCH_EVENT_DATETIME)
    date.setMonth(date.getMonth() + monthOffset)
    return date.toISOString()
}

describe('useTicketIsAfterFeedbackCollectionPeriod', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        // Default mock implementations
        mockUseGetAiAgentFeedback.mockReturnValue({
            data: { data: { messages: [] } },
            isLoading: false,
        } as any)

        // Default is one month after cutoff
        mockUseAppSelector.mockReturnValue({
            get: jest.fn().mockReturnValue(getDateRelativeToBaseline(1)),
        })

        // Mock the feature flag to be enabled by default
        mockUseFlag.mockReturnValue(true)
    })

    it('should return true when ticket date is null', () => {
        mockUseAppSelector.mockReturnValue({
            get: jest.fn().mockReturnValue(null),
        })

        const { result } = renderHook(() =>
            useTicketIsAfterFeedbackCollectionPeriod(),
        )

        expect(result.current).toBe(true)
    })

    it('should return true when data is loading', () => {
        mockUseGetAiAgentFeedback.mockReturnValue({
            isLoading: true,
        } as any)

        const { result } = renderHook(() =>
            useTicketIsAfterFeedbackCollectionPeriod(),
        )

        expect(result.current).toBe(true)
    })

    it('should return true when ticket date is after cutoff date and no feedback', () => {
        // Ticket date one month after cutoff
        mockUseAppSelector.mockReturnValue({
            get: jest.fn().mockReturnValue(getDateRelativeToBaseline(1)),
        })

        mockUseGetAiAgentFeedback.mockReturnValue({
            data: { data: { messages: [] } },
            isLoading: false,
        } as any)

        const { result } = renderHook(() =>
            useTicketIsAfterFeedbackCollectionPeriod(),
        )

        expect(result.current).toBe(true)
    })

    it('should return true when ticket date is after cutoff date plus extension due to feedback', () => {
        // Ticket date after cutoff + extension period (which is NUMBER_OF_MONTHS_TO_SKIP_NEW_FEEDBACK_COLLECTION months)
        mockUseAppSelector.mockReturnValue({
            get: jest
                .fn()
                .mockReturnValue(
                    getDateRelativeToBaseline(
                        NUMBER_OF_MONTHS_TO_SKIP_NEW_FEEDBACK_COLLECTION + 1,
                    ),
                ),
        })

        // Mock feedback data
        mockUseGetAiAgentFeedback.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            feedbackOnMessage: [{ id: 1 }],
                            feedbackOnResource: [],
                        },
                    ],
                },
            },
            isLoading: false,
        } as any)

        const { result } = renderHook(() =>
            useTicketIsAfterFeedbackCollectionPeriod(),
        )

        expect(result.current).toBe(true)
    })

    it('should return false when ticket date is before cutoff date', () => {
        // Ticket date one month before cutoff
        mockUseAppSelector.mockReturnValue({
            get: jest.fn().mockReturnValue(getDateRelativeToBaseline(-1)),
        })

        const { result } = renderHook(() =>
            useTicketIsAfterFeedbackCollectionPeriod(),
        )

        // Per current implementation, this should return false (before cutoff date)
        expect(result.current).toBe(false)
    })

    it('should return false when ticket date is within extended period due to feedback', () => {
        // Ticket date within the extension period
        mockUseAppSelector.mockReturnValue({
            get: jest
                .fn()
                .mockReturnValue(
                    getDateRelativeToBaseline(
                        NUMBER_OF_MONTHS_TO_SKIP_NEW_FEEDBACK_COLLECTION - 1,
                    ),
                ),
        })

        // Mock feedback data to trigger the extension
        mockUseGetAiAgentFeedback.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            feedbackOnMessage: [],
                            feedbackOnResource: [{ id: 1 }],
                        },
                    ],
                },
            },
            isLoading: false,
        } as any)

        const { result } = renderHook(() =>
            useTicketIsAfterFeedbackCollectionPeriod(),
        )

        // With our fixed implementation, this should return false because
        // the ticket date is BEFORE the extended cutoff date
        expect(result.current).toBe(false)
    })

    it('should handle multiple feedbacks correctly', () => {
        // Ticket date within the extension period
        mockUseAppSelector.mockReturnValue({
            get: jest
                .fn()
                .mockReturnValue(
                    getDateRelativeToBaseline(
                        NUMBER_OF_MONTHS_TO_SKIP_NEW_FEEDBACK_COLLECTION - 1,
                    ),
                ),
        })

        // Mock multiple feedback entries
        mockUseGetAiAgentFeedback.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            feedbackOnMessage: [{ id: 1 }, { id: 2 }],
                            feedbackOnResource: [{ id: 3 }],
                        },
                        {
                            feedbackOnMessage: [],
                            feedbackOnResource: [{ id: 4 }],
                        },
                    ],
                },
            },
            isLoading: false,
        } as any)

        const { result } = renderHook(() =>
            useTicketIsAfterFeedbackCollectionPeriod(),
        )

        // The hook should recognize 4 feedback items total, and since the ticket date
        // is before the extended cutoff, it should return false
        expect(result.current).toBe(false)
    })

    it('should return false when feature flag is disabled regardless of other conditions', () => {
        // Mock feature flag as disabled
        mockUseFlag.mockReturnValue(false)

        // Ticket date is after cutoff
        mockUseAppSelector.mockReturnValue({
            get: jest.fn().mockReturnValue(getDateRelativeToBaseline(10)),
        })

        // Mock feedback data
        mockUseGetAiAgentFeedback.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            feedbackOnMessage: [{ id: 1 }],
                            feedbackOnResource: [{ id: 2 }],
                        },
                    ],
                },
            },
            isLoading: false,
        } as any)

        const { result } = renderHook(() =>
            useTicketIsAfterFeedbackCollectionPeriod(),
        )

        // Should return false when flag is disabled regardless of other conditions
        expect(result.current).toBe(false)
    })

    it('should return false when ticket date is exactly at the cutoff date', () => {
        // Ticket date exactly at cutoff
        mockUseAppSelector.mockReturnValue({
            get: jest
                .fn()
                .mockReturnValue(
                    FIRST_CONSUMED_ORCH_EVENT_DATETIME.toISOString(),
                ),
        })

        const { result } = renderHook(() =>
            useTicketIsAfterFeedbackCollectionPeriod(),
        )

        // Should return false because it needs to be greater than (not equal to) the cutoff
        expect(result.current).toBe(false)
    })

    it('should return false when ticket date is exactly at the extended cutoff date', () => {
        // Calculate exact extended cutoff date
        const extendedDate = new Date(FIRST_CONSUMED_ORCH_EVENT_DATETIME)
        extendedDate.setMonth(
            extendedDate.getMonth() +
                NUMBER_OF_MONTHS_TO_SKIP_NEW_FEEDBACK_COLLECTION,
        )

        // Ticket date exactly at extended cutoff
        mockUseAppSelector.mockReturnValue({
            get: jest.fn().mockReturnValue(extendedDate.toISOString()),
        })

        // Mock feedback data to trigger the extension
        mockUseGetAiAgentFeedback.mockReturnValue({
            data: {
                data: {
                    messages: [
                        {
                            feedbackOnMessage: [{ id: 1 }],
                            feedbackOnResource: [],
                        },
                    ],
                },
            },
            isLoading: false,
        } as any)

        const { result } = renderHook(() =>
            useTicketIsAfterFeedbackCollectionPeriod(),
        )

        // Should return false because it needs to be greater than (not equal to) the cutoff
        expect(result.current).toBe(false)
    })
})
