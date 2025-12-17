import { useFlag } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'

import useAppSelector from 'hooks/useAppSelector'
import { useGetAiAgentFeedback } from 'models/aiAgentFeedback/queries'
import { useGetEarliestExecution } from 'models/knowledgeService/queries'

import {
    NUMBER_OF_MONTHS_TO_SKIP_NEW_FEEDBACK_COLLECTION,
    useTicketIsAfterFeedbackCollectionPeriod,
} from '../useIsTicketAfterFeedbackCollectionPeriod'

// Mock dependencies
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('models/aiAgentFeedback/queries', () => ({
    useGetAiAgentFeedback: jest.fn(),
}))
jest.mock('models/knowledgeService/queries', () => ({
    useGetEarliestExecution: jest.fn(),
}))
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

const mockUseAppSelector = useAppSelector as jest.MockedFunction<
    typeof useAppSelector
>
const mockUseGetAiAgentFeedback = useGetAiAgentFeedback as jest.MockedFunction<
    typeof useGetAiAgentFeedback
>
const mockUseGetEarliestExecution =
    useGetEarliestExecution as jest.MockedFunction<
        typeof useGetEarliestExecution
    >
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

// Baseline date for testing (what was previously FIRST_CONSUMED_ORCH_EVENT_DATETIME)
const BASELINE_EXECUTION_DATETIME = new Date('2024-01-01T00:00:00.000Z')

// Helper function to calculate dates relative to the baseline date
const getDateRelativeToBaseline = (monthOffset: number): string => {
    const date = new Date(BASELINE_EXECUTION_DATETIME)
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

        // Mock the earliest execution data
        mockUseGetEarliestExecution.mockReturnValue({
            data: {
                executionId: 'test-execution-id',
                timestamp: BASELINE_EXECUTION_DATETIME.toISOString(),
            },
            isLoading: false,
        } as any)

        // Default is one month after baseline
        mockUseAppSelector.mockReturnValue({
            get: jest.fn().mockReturnValue(getDateRelativeToBaseline(1)),
        })

        // Mock the feature flag to be enabled by default
        mockUseFlag.mockReturnValue(true)
    })

    it('should return false when feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)

        const { result } = renderHook(() =>
            useTicketIsAfterFeedbackCollectionPeriod(),
        )

        expect(result.current).toBe(false)
    })

    it('should return true when earliest execution data is not available', () => {
        mockUseGetEarliestExecution.mockReturnValue({
            data: null,
            isLoading: false,
        } as any)

        const { result } = renderHook(() =>
            useTicketIsAfterFeedbackCollectionPeriod(),
        )

        expect(result.current).toBe(true)
    })

    it('should return true when earliest execution data is undefined', () => {
        mockUseGetEarliestExecution.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as any)

        const { result } = renderHook(() =>
            useTicketIsAfterFeedbackCollectionPeriod(),
        )

        expect(result.current).toBe(true)
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

    it('should return true when ticket date is after earliest execution date and no feedback', () => {
        // Ticket date one month after baseline
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

    it('should return true when ticket date is after earliest execution date plus extension due to feedback', () => {
        // Ticket date after baseline + extension period (which is NUMBER_OF_MONTHS_TO_SKIP_NEW_FEEDBACK_COLLECTION months)
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

    it('should return false when ticket date is before earliest execution date', () => {
        // Ticket date one month before baseline
        mockUseAppSelector.mockReturnValue({
            get: jest.fn().mockReturnValue(getDateRelativeToBaseline(-1)),
        })

        const { result } = renderHook(() =>
            useTicketIsAfterFeedbackCollectionPeriod(),
        )

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

        expect(result.current).toBe(false)
    })

    it('should return false when feature flag is disabled regardless of other conditions', () => {
        // Mock feature flag as disabled
        mockUseFlag.mockReturnValue(false)

        // Ticket date is after baseline
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

        expect(result.current).toBe(false)
    })

    it('should return false when ticket date is exactly at the earliest execution date', () => {
        // Ticket date exactly at baseline
        mockUseAppSelector.mockReturnValue({
            get: jest
                .fn()
                .mockReturnValue(BASELINE_EXECUTION_DATETIME.toISOString()),
        })

        const { result } = renderHook(() =>
            useTicketIsAfterFeedbackCollectionPeriod(),
        )

        expect(result.current).toBe(false)
    })

    it('should return false when ticket date is exactly at the extended earliest execution date', () => {
        // Calculate exact extended date
        const extendedDate = new Date(BASELINE_EXECUTION_DATETIME)
        extendedDate.setMonth(
            extendedDate.getMonth() +
                NUMBER_OF_MONTHS_TO_SKIP_NEW_FEEDBACK_COLLECTION,
        )

        // Ticket date exactly at extended date
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

        expect(result.current).toBe(false)
    })

    it('should return true when earliest execution is loading', () => {
        mockUseGetEarliestExecution.mockReturnValue({
            data: null,
            isLoading: true,
        } as any)

        const { result } = renderHook(() =>
            useTicketIsAfterFeedbackCollectionPeriod(),
        )

        // When loading, we should return true to show the loading state
        expect(result.current).toBe(true)
    })

    it('should work with different earliest execution timestamps', () => {
        const customTimestamp = '2023-06-15T10:30:00.000Z'
        mockUseGetEarliestExecution.mockReturnValue({
            data: {
                executionId: 'custom-execution-id',
                timestamp: customTimestamp,
            },
            isLoading: false,
        } as any)

        // Ticket date after custom timestamp
        const ticketDate = new Date(customTimestamp)
        ticketDate.setMonth(ticketDate.getMonth() + 1)

        mockUseAppSelector.mockReturnValue({
            get: jest.fn().mockReturnValue(ticketDate.toISOString()),
        })

        const { result } = renderHook(() =>
            useTicketIsAfterFeedbackCollectionPeriod(),
        )

        expect(result.current).toBe(true)
    })
})
