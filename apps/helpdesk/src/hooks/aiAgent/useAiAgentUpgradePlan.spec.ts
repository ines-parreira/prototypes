import { renderHook } from '@repo/testing'

import { useGetAiAgentUpgradePlan } from 'models/aiAgent/queries'
import { Cadence, Plan, ProductType } from 'models/billing/types'
import { getAvailablePlansMapByPlanId } from 'state/billing/selectors'

import { useAiAgentUpgradePlan } from './useAiAgentUpgradePlan'

jest.mock('models/aiAgent/queries')
jest.mock('state/billing/selectors')
jest.mock('hooks/useAppSelector', () => (selector: Function) => selector())

const mockUseGetAiAgentUpgradePlan = jest.mocked(useGetAiAgentUpgradePlan)
const mockGetAvailablePlansMapByPlanId = jest.mocked(
    getAvailablePlansMapByPlanId,
)

describe('useAiAgentUpgradePlan', () => {
    const accountDomain = 'test-domain'
    const mockPlanId = 'plan-123'
    const mockPlanData: Plan = {
        product: ProductType.Automation,
        num_quota_tickets: 1000,
        amount: 99,
        currency: 'USD',
        custom: false,
        extra_ticket_cost: 0,
        plan_id: mockPlanId,
        cadence: Cadence.Month,
        name: 'AI Agent Plan',
        price_id: 'price_123',
        public: true,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should return loading false when query is loading but no data', () => {
        mockUseGetAiAgentUpgradePlan.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
            error: null,
        } as any)
        mockGetAvailablePlansMapByPlanId.mockReturnValue({})

        const { result } = renderHook(() =>
            useAiAgentUpgradePlan(accountDomain),
        )

        expect(result.current).toEqual({
            data: null,
            isLoading: false,
        })
    })

    it('should return null data when no upgrade plan ID is available', () => {
        mockUseGetAiAgentUpgradePlan.mockReturnValue({
            data: {},
            isLoading: false,
            isError: false,
            error: null,
        } as any)
        mockGetAvailablePlansMapByPlanId.mockReturnValue({})

        const { result } = renderHook(() =>
            useAiAgentUpgradePlan(accountDomain),
        )

        expect(result.current).toEqual({
            data: null,
            isLoading: false,
        })
    })

    it('should return null data when upgrade plan ID is undefined', () => {
        mockUseGetAiAgentUpgradePlan.mockReturnValue({
            data: { aiAgentUpgradePlanId: undefined },
            isLoading: false,
            isError: false,
            error: null,
        } as any)
        mockGetAvailablePlansMapByPlanId.mockReturnValue({})

        const { result } = renderHook(() =>
            useAiAgentUpgradePlan(accountDomain),
        )

        expect(result.current).toEqual({
            data: null,
            isLoading: false,
        })
    })

    it('should return null data when plan is not found in plans map', () => {
        mockUseGetAiAgentUpgradePlan.mockReturnValue({
            data: { aiAgentUpgradePlanId: mockPlanId },
            isLoading: false,
            isError: false,
            error: null,
        } as any)
        mockGetAvailablePlansMapByPlanId.mockReturnValue({})

        const { result } = renderHook(() =>
            useAiAgentUpgradePlan(accountDomain),
        )

        expect(result.current).toEqual({
            data: null,
            isLoading: false,
        })
    })

    it('should return transformed plan data when plan is found', () => {
        const plansMap = {
            [mockPlanId]: mockPlanData,
        }

        mockUseGetAiAgentUpgradePlan.mockReturnValue({
            data: { aiAgentUpgradePlanId: mockPlanId },
            isLoading: false,
            isError: false,
            error: null,
        } as any)
        mockGetAvailablePlansMapByPlanId.mockReturnValue(plansMap)

        const { result } = renderHook(() =>
            useAiAgentUpgradePlan(accountDomain),
        )

        expect(result.current).toEqual({
            data: mockPlanData,
            isLoading: false,
        })
    })

    it('should pass through loading state correctly when plan exists', () => {
        const plansMap = {
            [mockPlanId]: mockPlanData,
        }

        mockUseGetAiAgentUpgradePlan.mockReturnValue({
            data: { aiAgentUpgradePlanId: mockPlanId },
            isLoading: true,
            isError: false,
            error: null,
        } as any)
        mockGetAvailablePlansMapByPlanId.mockReturnValue(plansMap)

        const { result } = renderHook(() =>
            useAiAgentUpgradePlan(accountDomain),
        )

        expect(result.current).toEqual({
            data: mockPlanData,
            isLoading: true,
        })
    })

    it('should call useGetAiAgentUpgradePlan with correct parameters when enabled', () => {
        mockUseGetAiAgentUpgradePlan.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: null,
        } as any)
        mockGetAvailablePlansMapByPlanId.mockReturnValue({})

        renderHook(() => useAiAgentUpgradePlan(accountDomain, true))

        expect(mockUseGetAiAgentUpgradePlan).toHaveBeenCalledWith(
            accountDomain,
            {
                enabled: true,
            },
        )
    })

    it('should call useGetAiAgentUpgradePlan with enabled=false when accountDomain is empty', () => {
        mockUseGetAiAgentUpgradePlan.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: null,
        } as any)
        mockGetAvailablePlansMapByPlanId.mockReturnValue({})

        renderHook(() => useAiAgentUpgradePlan('', true))

        expect(mockUseGetAiAgentUpgradePlan).toHaveBeenCalledWith('', {
            enabled: false,
        })
    })

    it('should call useGetAiAgentUpgradePlan with enabled=false when disabled explicitly', () => {
        mockUseGetAiAgentUpgradePlan.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: null,
        } as any)
        mockGetAvailablePlansMapByPlanId.mockReturnValue({})

        renderHook(() => useAiAgentUpgradePlan(accountDomain, false))

        expect(mockUseGetAiAgentUpgradePlan).toHaveBeenCalledWith(
            accountDomain,
            {
                enabled: false,
            },
        )
    })

    it('should default to enabled=true when enabled parameter is not provided', () => {
        mockUseGetAiAgentUpgradePlan.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: null,
        } as any)
        mockGetAvailablePlansMapByPlanId.mockReturnValue({})

        renderHook(() => useAiAgentUpgradePlan(accountDomain))

        expect(mockUseGetAiAgentUpgradePlan).toHaveBeenCalledWith(
            accountDomain,
            {
                enabled: true,
            },
        )
    })
})
