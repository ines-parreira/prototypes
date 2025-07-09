import moment from 'moment'

import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import { useTrialMetrics } from 'pages/aiAgent/trial/hooks/useTrialMetrics'
import { act, renderHook } from 'utils/testing/renderHook'

// Mock dependencies
jest.mock('pages/aiAgent/trial/hooks/useTrialMetrics')
jest.mock('pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone')

const mockUseTrialMetrics = jest.mocked(useTrialMetrics)
const mockUseSalesTrialRevampMilestone = jest.mocked(
    useSalesTrialRevampMilestone,
)

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
})

// Helper function to generate trial end time based on remaining days
const getTrialEndTime = (remainingDays: number): string => {
    // For the test logic, we need to generate a time that represents when the trial actually ends
    // If remainingDays is 0, the trial ended just before now (1 second ago)
    // If remainingDays is 1, the trial ends tomorrow
    // If remainingDays is -1, the trial ended yesterday
    if (remainingDays <= 0) {
        return moment()
            .subtract(1, 'second')
            .add(remainingDays, 'days')
            .toISOString()
    }
    return moment().add(remainingDays, 'days').toISOString()
}

describe('useTrialEnding', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockLocalStorage.getItem.mockReturnValue(null)

        // Enable the milestone-1 feature for tests
        mockUseSalesTrialRevampMilestone.mockReturnValue('milestone-1')

        mockUseTrialMetrics.mockReturnValue({
            remainingDays: 5,
            trialEndTime: getTrialEndTime(5),
            gmvInfluenced: '$100',
            gmvInfluencedRate: 0.05,
            isLoading: false,
        })
    })

    describe('isTrialEnded', () => {
        it('should return true when remainingDays is 0', () => {
            mockUseTrialMetrics.mockReturnValue({
                remainingDays: 0,
                trialEndTime: getTrialEndTime(0),
                gmvInfluenced: '$100',
                gmvInfluencedRate: 0.05,
                isLoading: false,
            })

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEnded).toBe(true)
        })

        it('should return true when remainingDays is negative', () => {
            mockUseTrialMetrics.mockReturnValue({
                remainingDays: -1,
                trialEndTime: getTrialEndTime(-1),
                gmvInfluenced: '$100',
                gmvInfluencedRate: 0.05,
                isLoading: false,
            })

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEnded).toBe(true)
        })

        it('should return false when remainingDays is positive', () => {
            mockUseTrialMetrics.mockReturnValue({
                remainingDays: 3,
                trialEndTime: getTrialEndTime(3),
                gmvInfluenced: '$100',
                gmvInfluencedRate: 0.05,
                isLoading: false,
            })

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEnded).toBe(false)
        })

        it('should return false when trial ended but banner was dismissed', () => {
            mockLocalStorage.getItem.mockReturnValue('true')
            mockUseTrialMetrics.mockReturnValue({
                remainingDays: 0,
                trialEndTime: getTrialEndTime(0),
                gmvInfluenced: '$100',
                gmvInfluencedRate: 0.05,
                isLoading: false,
            })

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEnded).toBe(false)
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
                'ai-agent-trial-ended-dismissed',
            )
        })
    })

    describe('isTrialEndingTomorrow', () => {
        it('should return true when remainingDays is 1', () => {
            mockUseTrialMetrics.mockReturnValue({
                remainingDays: 1,
                trialEndTime: getTrialEndTime(1),
                gmvInfluenced: '$100',
                gmvInfluencedRate: 0.05,
                isLoading: false,
            })

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEndingTomorrow).toBe(true)
        })

        it('should return false when remainingDays is not 1', () => {
            mockUseTrialMetrics.mockReturnValue({
                remainingDays: 2,
                trialEndTime: getTrialEndTime(2),
                gmvInfluenced: '$100',
                gmvInfluencedRate: 0.05,
                isLoading: false,
            })

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEndingTomorrow).toBe(false)
        })

        it('should return false when trial ending tomorrow but banner was dismissed', () => {
            mockLocalStorage.getItem.mockImplementation((key) => {
                if (key === 'ai-agent-trial-ending-tomorrow-dismissed')
                    return 'true'
                return null
            })

            mockUseTrialMetrics.mockReturnValue({
                remainingDays: 1,
                trialEndTime: getTrialEndTime(1),
                gmvInfluenced: '$100',
                gmvInfluencedRate: 0.05,
                isLoading: false,
            })

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEndingTomorrow).toBe(false)
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
                'ai-agent-trial-ending-tomorrow-dismissed',
            )
        })

        it('should return false when trial already ended (remainingDays is 0)', () => {
            mockUseTrialMetrics.mockReturnValue({
                remainingDays: 0,
                trialEndTime: getTrialEndTime(0),
                gmvInfluenced: '$100',
                gmvInfluencedRate: 0.05,
                isLoading: false,
            })

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEndingTomorrow).toBe(false)
        })
    })

    describe('dismiss functions', () => {
        it('should set localStorage and update state when dismissTrialEnded is called', () => {
            mockUseTrialMetrics.mockReturnValue({
                remainingDays: 0,
                trialEndTime: getTrialEndTime(0),
                gmvInfluenced: '$100',
                gmvInfluencedRate: 0.05,
                isLoading: false,
            })

            const { result } = renderHook(() => useTrialEnding())

            // Initially should be true since remainingDays is 0
            expect(result.current.isTrialEnded).toBe(true)

            act(() => {
                result.current.dismissTrialEnded()
            })

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'ai-agent-trial-ended-dismissed',
                'true',
            )
            // After dismissing, should be false
            expect(result.current.isTrialEnded).toBe(false)
        })

        it('should set localStorage and update state when dismissTrialEndingTomorrow is called', () => {
            mockUseTrialMetrics.mockReturnValue({
                remainingDays: 1,
                trialEndTime: getTrialEndTime(1),
                gmvInfluenced: '$100',
                gmvInfluencedRate: 0.05,
                isLoading: false,
            })

            const { result } = renderHook(() => useTrialEnding())

            // Initially should be true since remainingDays is 1
            expect(result.current.isTrialEndingTomorrow).toBe(true)

            act(() => {
                result.current.dismissTrialEndingTomorrow()
            })

            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'ai-agent-trial-ending-tomorrow-dismissed',
                'true',
            )
            // After dismissing, should be false
            expect(result.current.isTrialEndingTomorrow).toBe(false)
        })
    })

    describe('edge cases', () => {
        it('should handle negative remainingDays', () => {
            mockUseTrialMetrics.mockReturnValue({
                remainingDays: -5,
                trialEndTime: getTrialEndTime(-5),
                gmvInfluenced: '$100',
                gmvInfluencedRate: 0.05,
                isLoading: false,
            })

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEnded).toBe(true)
            expect(result.current.isTrialEndingTomorrow).toBe(false)
        })

        it('should handle zero remainingDays', () => {
            mockUseTrialMetrics.mockReturnValue({
                remainingDays: 0,
                trialEndTime: getTrialEndTime(0),
                gmvInfluenced: '$100',
                gmvInfluencedRate: 0.05,
                isLoading: false,
            })

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEnded).toBe(true)
            expect(result.current.isTrialEndingTomorrow).toBe(false)
        })

        it('should initialize dismissal state from localStorage', () => {
            mockLocalStorage.getItem.mockImplementation((key) => {
                if (key === 'ai-agent-trial-ended-dismissed') return 'true'
                if (key === 'ai-agent-trial-ending-tomorrow-dismissed')
                    return 'true'
                return null
            })

            mockUseTrialMetrics.mockReturnValue({
                remainingDays: 0,
                trialEndTime: getTrialEndTime(0),
                gmvInfluenced: '$100',
                gmvInfluencedRate: 0.05,
                isLoading: false,
            })

            const { result } = renderHook(() => useTrialEnding())

            expect(result.current.isTrialEnded).toBe(false)
            expect(result.current.isTrialEndingTomorrow).toBe(false)
        })
    })
})
