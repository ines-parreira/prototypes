import { renderHook } from '@repo/testing'

import { InvoiceCadence } from '@gorgias/helpdesk-types'

import { useAiAgentGeneration6Plan } from 'models/billing/queries'
import type { Plan } from 'models/billing/types'
import { Cadence, ProductType } from 'models/billing/types'

import { useAiAgentUpgradePlan } from './useAiAgentUpgradePlan'

jest.mock('models/billing/queries')

const mockUseAiAgentGeneration6Plan = jest.mocked(useAiAgentGeneration6Plan)

describe('useAiAgentUpgradePlan', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should return null and initial loading true when query is loading', () => {
        mockUseAiAgentGeneration6Plan.mockReturnValue({
            data: undefined,
            isInitialLoading: true,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() => useAiAgentUpgradePlan())

        expect(result.current).toEqual({ data: null, isLoading: true })
    })

    it('should return null when API returns null', () => {
        mockUseAiAgentGeneration6Plan.mockReturnValue({
            data: null,
            isInitialLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() => useAiAgentUpgradePlan())

        expect(result.current).toEqual({ data: null, isLoading: false })
    })

    it('should return plan when API returns { plan: Plan }', () => {
        const mockPlanData: Plan = {
            product: ProductType.Automation,
            num_quota_tickets: 1000,
            amount: 99,
            currency: 'USD',
            custom: false,
            extra_ticket_cost: 0,
            plan_id: 'plan-123',
            cadence: Cadence.Month,
            invoice_cadence: InvoiceCadence.Month,
            name: 'AI Agent Plan',
            public: true,
        }

        mockUseAiAgentGeneration6Plan.mockReturnValue({
            data: { plan: mockPlanData },
            isInitialLoading: false,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() => useAiAgentUpgradePlan())

        expect(result.current).toEqual({
            data: mockPlanData,
            isLoading: false,
        })
    })

    it('should pass through initial loading state', () => {
        mockUseAiAgentGeneration6Plan.mockReturnValue({
            data: null,
            isInitialLoading: true,
            isError: false,
            error: null,
        } as any)

        const { result } = renderHook(() => useAiAgentUpgradePlan())

        expect(result.current).toEqual({ data: null, isLoading: true })
    })

    it('should respect enabled flag', () => {
        mockUseAiAgentGeneration6Plan.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            error: null,
        } as any)

        renderHook(() => useAiAgentUpgradePlan(false))

        expect(mockUseAiAgentGeneration6Plan).toHaveBeenCalledWith({
            enabled: false,
        })
    })
})
