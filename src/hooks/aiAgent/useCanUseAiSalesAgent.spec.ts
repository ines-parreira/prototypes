import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAutomatePlan } from 'state/billing/selectors'
import { isTrialing as getIsTrialing } from 'state/currentAccount/selectors'
import { renderHook } from 'utils/testing/renderHook'

import { useCanUseAiSalesAgent } from './useCanUseAiSalesAgent'

// Mock dependencies
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const useAppSelectorMock = useAppSelector as jest.Mock
const useFlagMock = useFlag as jest.Mock

describe('useCanUseAiSalesAgent', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should return true when isTrialing is true', () => {
        // Mock selectors
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getCurrentAutomatePlan) {
                return { generation: 5 }
            }
            if (selector === getIsTrialing) {
                return true
            }
            return null
        })
        useFlagMock.mockReturnValue(false)

        const { result } = renderHook(() => useCanUseAiSalesAgent())

        expect(result.current).toBe(true)
    })

    it('should return true when AiSalesAgentBypassPlanCheck flag is true', () => {
        // Mock selectors
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getCurrentAutomatePlan) {
                return { generation: 5 }
            }
            if (selector === getIsTrialing) {
                return false
            }
            return null
        })
        useFlagMock.mockReturnValue(true)

        const { result } = renderHook(() => useCanUseAiSalesAgent())

        expect(result.current).toBe(true)
    })

    it('should return true when automate plan generation is 6 or higher', () => {
        // Mock selectors
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getCurrentAutomatePlan) {
                return { generation: 6 }
            }
            if (selector === getIsTrialing) {
                return false
            }
            return null
        })
        useFlagMock.mockReturnValue(false)

        const { result } = renderHook(() => useCanUseAiSalesAgent())

        expect(result.current).toBe(true)
    })

    it('should return false when automate plan generation is below 6 and no bypass conditions are met', () => {
        // Mock selectors
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getCurrentAutomatePlan) {
                return { generation: 5 }
            }
            if (selector === getIsTrialing) {
                return false
            }
            return null
        })
        useFlagMock.mockReturnValue(false)

        const { result } = renderHook(() => useCanUseAiSalesAgent())

        expect(result.current).toBe(false)
    })

    it('should return true when automate plan generation is 7', () => {
        // Mock selectors
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getCurrentAutomatePlan) {
                return { generation: 7 }
            }
            if (selector === getIsTrialing) {
                return false
            }
            return null
        })
        useFlagMock.mockReturnValue(false)

        const { result } = renderHook(() => useCanUseAiSalesAgent())

        expect(result.current).toBe(true)
    })

    it('should handle null or undefined automate plan', () => {
        // Mock selectors
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getCurrentAutomatePlan) {
                return null
            }
            if (selector === getIsTrialing) {
                return false
            }
            return null
        })
        useFlagMock.mockReturnValue(false)

        const { result } = renderHook(() => useCanUseAiSalesAgent())

        expect(result.current).toBe(false)
    })

    it('should check if flag is called with the correct parameters', () => {
        // Mock selectors
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getCurrentAutomatePlan) {
                return { generation: 5 }
            }
            if (selector === getIsTrialing) {
                return false
            }
            return null
        })
        useFlagMock.mockReturnValue(false)

        renderHook(() => useCanUseAiSalesAgent())

        expect(useFlagMock).toHaveBeenCalledWith(
            FeatureFlagKey.AiSalesAgentBypassPlanCheck,
            false,
        )
    })
})
