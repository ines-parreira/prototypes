import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { StoreConfiguration } from 'models/aiAgent/types'
import { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { useStoreConfigurations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import {
    getAiSalesAgentTrialState,
    TrialState,
} from 'pages/aiAgent/utils/aiSalesAgentTrialUtils'
import { getCurrentAutomatePlan } from 'state/billing/selectors'
import {
    getCurrentAccountState,
    isTrialing as getIsTrialing,
} from 'state/currentAccount/selectors'

import {
    atLeastOneStoreHasActiveTrialOnSpecificStores,
    canStoreUseAiSalesAgent,
    useAtLeastOneStoreHasActiveTrial,
    useCanUseAiSalesAgent,
} from './useCanUseAiSalesAgent'

// Mock dependencies
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const useAppSelectorMock = useAppSelector as jest.Mock
const useFlagMock = useFlag as jest.Mock
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations')
const useStoreConfigurationsMock = assumeMock(useStoreConfigurations)

jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')
const useTrialAccessMock = assumeMock(useTrialAccess)

jest.mock('pages/aiAgent/utils/aiSalesAgentTrialUtils')
const getAiSalesAgentTrialStateMock = assumeMock(getAiSalesAgentTrialState)
describe('useCanUseAiSalesAgent', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        useTrialAccessMock.mockReturnValue(
            createMockTrialAccess({
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
            }),
        )
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

        const { result } = renderHook(() => useCanUseAiSalesAgent('test-shop'))

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

        const { result } = renderHook(() => useCanUseAiSalesAgent('test-shop'))

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

        const { result } = renderHook(() => useCanUseAiSalesAgent('test-shop'))

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

        const { result } = renderHook(() => useCanUseAiSalesAgent('test-shop'))

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

        const { result } = renderHook(() => useCanUseAiSalesAgent('test-shop'))

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

        const { result } = renderHook(() => useCanUseAiSalesAgent('test-shop'))

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

        renderHook(() => useCanUseAiSalesAgent('test-shop'))

        expect(useFlagMock).toHaveBeenCalledWith(
            FeatureFlagKey.AiSalesAgentBypassPlanCheck,
            false,
        )
    })

    it('should return true when only is in AI or Shopping Assistant trial', () => {
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
        useTrialAccessMock.mockReturnValue(
            createMockTrialAccess({
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialExpired: false,
            }),
        )

        const { result } = renderHook(() => useCanUseAiSalesAgent('test-shop'))

        expect(result.current).toBe(true)
    })

    it('should return false when trial is started but expired', () => {
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
        useTrialAccessMock.mockReturnValue(
            createMockTrialAccess({
                hasCurrentStoreTrialStarted: true,
                hasCurrentStoreTrialExpired: true,
                hasAnyTrialActive: true,
            }),
        )

        const { result } = renderHook(() => useCanUseAiSalesAgent('test-shop'))

        expect(result.current).toBe(false)
    })

    it('should return true when shop name is not passed and hasAnyTrialActive is true', () => {
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
        useTrialAccessMock.mockReturnValue(
            createMockTrialAccess({
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialActive: true,
            }),
        )

        const { result } = renderHook(() => useCanUseAiSalesAgent())

        expect(result.current).toBe(true)
    })

    it('should return false when shop name is not passed and hasAnyTrialActive is false', () => {
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
        useTrialAccessMock.mockReturnValue(
            createMockTrialAccess({
                hasCurrentStoreTrialStarted: false,
                hasCurrentStoreTrialExpired: false,
                hasAnyTrialActive: false,
            }),
        )

        const { result } = renderHook(() => useCanUseAiSalesAgent())

        expect(result.current).toBe(false)
    })
})

describe('canStoreUseAiSalesAgent', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })
    const storeConfiguration = {
        salesDeactivatedDatetime: null,
    }

    it('should return true when the store is in trial', () => {
        getAiSalesAgentTrialStateMock.mockReturnValue(TrialState.Trial)
        expect(
            canStoreUseAiSalesAgent(storeConfiguration as StoreConfiguration),
        ).toBe(true)
    })

    it('should return false when the store is not in trial', () => {
        getAiSalesAgentTrialStateMock.mockReturnValue(TrialState.TrialEnded)
        expect(
            canStoreUseAiSalesAgent(storeConfiguration as StoreConfiguration),
        ).toBe(false)
    })
})

describe('atLeastOneStoreHasActiveTrialOnSpecificStores', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })
    it('should return false when no store is in trial', () => {
        const storeActivations = {
            store1: {
                configuration: {
                    salesDeactivatedDatetime: null,
                },
            },
            store2: {
                configuration: {
                    salesDeactivatedDatetime: null,
                },
            },
        }
        getAiSalesAgentTrialStateMock.mockReturnValueOnce(TrialState.NotTrial)
        expect(
            atLeastOneStoreHasActiveTrialOnSpecificStores(
                storeActivations as unknown as Record<string, StoreActivation>,
            ),
        ).toBe(false)
    })

    it('should return true when at least one store is in trial', () => {
        const storeActivations = {
            store1: {
                configuration: {
                    salesDeactivatedDatetime: null,
                },
            },
            store2: {
                configuration: {
                    salesDeactivatedDatetime: new Date(
                        '3025-01-01',
                    ).toISOString(),
                },
            },
        }
        getAiSalesAgentTrialStateMock.mockReturnValueOnce(TrialState.Trial)
        expect(
            atLeastOneStoreHasActiveTrialOnSpecificStores(
                storeActivations as unknown as Record<string, StoreActivation>,
            ),
        ).toBe(true)
    })
})

describe('useAtLeastOneStoreHasActiveTrial', () => {
    it('should return false when no store is in trial', () => {
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getCurrentAutomatePlan) {
                return { generation: 5 }
            }
            if (selector === getCurrentAccountState) {
                return fromJS({ domain: 'test' }) as Map<string, string>
            }
            return null
        })
        useStoreConfigurationsMock.mockReturnValueOnce({
            storeConfigurations: [
                {
                    salesDeactivatedDatetime: null,
                },
                {
                    salesDeactivatedDatetime: null,
                },
            ],
        } as any)
        getAiSalesAgentTrialStateMock.mockReturnValueOnce(TrialState.NotTrial)
        expect(useAtLeastOneStoreHasActiveTrial()).toBe(false)
    })

    it('should return true when at least one store is in trial', () => {
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getCurrentAutomatePlan) {
                return { generation: 5 }
            }
            if (selector === getCurrentAccountState) {
                return fromJS({ domain: 'test' }) as Map<string, string>
            }
            return null
        })
        useStoreConfigurationsMock.mockReturnValueOnce({
            storeConfigurations: [
                {
                    salesDeactivatedDatetime: null,
                },
                {
                    salesDeactivatedDatetime: new Date(
                        '3025-01-01',
                    ).toISOString(),
                },
            ],
        } as any)
        getAiSalesAgentTrialStateMock.mockReturnValueOnce(TrialState.Trial)
        expect(useAtLeastOneStoreHasActiveTrial()).toBe(true)
    })
})
