import { useFlag } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'

import useAppSelector from 'hooks/useAppSelector'
import { useGetCostPerAutomatedInteraction } from 'pages/automate/common/hooks/useGetCostPerAutomatedInteraction'
import { useGetCostPerBillableTicket } from 'pages/automate/common/hooks/useGetCostPerBillableTicket'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'
import { getCurrentHelpdeskPlan } from 'state/billing/selectors'
import { getAgentCostsSettings } from 'state/currentAccount/selectors'

jest.mock('hooks/useAppSelector')
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
jest.mock('pages/automate/common/hooks/useGetCostPerAutomatedInteraction')
jest.mock('pages/automate/common/hooks/useGetCostPerBillableTicket')

const useAppSelectorMock = assumeMock(useAppSelector)
const useFlagMock = assumeMock(useFlag)
const useGetCostPerAutomatedInteractionMock = assumeMock(
    useGetCostPerAutomatedInteraction,
)
const useGetCostPerBillableTicketMock = assumeMock(useGetCostPerBillableTicket)

describe('useMoneySavedPerInteractionWithAutomate', () => {
    const defaultAgentCostPerTicket = 10

    beforeEach(() => {
        jest.clearAllMocks()
        useFlagMock.mockReturnValue(false)
        useGetCostPerAutomatedInteractionMock.mockReturnValue(0.85)
        useGetCostPerBillableTicketMock.mockReturnValue(5)
        useAppSelectorMock.mockImplementation((selector: any) => {
            if (selector === getCurrentHelpdeskPlan) {
                return {
                    amount: 10000,
                    num_quota_tickets: 100,
                }
            }
            if (selector === getAgentCostsSettings) {
                return null
            }
            return null
        })
    })

    it('should return 0 when num_quota_tickets is 0', () => {
        useAppSelectorMock.mockImplementation((selector: any) => {
            if (selector === getCurrentHelpdeskPlan) {
                return {
                    amount: 10000,
                    num_quota_tickets: 0,
                }
            }
            return null
        })

        const { result } = renderHook(() =>
            useMoneySavedPerInteractionWithAutomate(defaultAgentCostPerTicket),
        )

        expect(result.current).toBe(0)
    })

    it('should calculate money saved with default agent cost per ticket', () => {
        const { result } = renderHook(() =>
            useMoneySavedPerInteractionWithAutomate(defaultAgentCostPerTicket),
        )

        // costPerBillableTicket (5) + agentCostPerTicket (10) - costPerAutomatedInteraction (0.85) = 14.15
        expect(result.current).toBe(14.15)
    })

    it('should use agent costs from settings when ROI calculator flag is enabled', () => {
        useFlagMock.mockReturnValue(true)
        useAppSelectorMock.mockImplementation((selector: any) => {
            if (selector === getCurrentHelpdeskPlan) {
                return {
                    amount: 10000,
                    num_quota_tickets: 100,
                }
            }
            if (selector === getAgentCostsSettings) {
                return {
                    data: {
                        agent_cost_per_ticket: 15,
                    },
                }
            }
            return null
        })

        const { result } = renderHook(() =>
            useMoneySavedPerInteractionWithAutomate(defaultAgentCostPerTicket),
        )

        // costPerBillableTicket (5) + agentCostPerTicket (15) - costPerAutomatedInteraction (0.85) = 19.15
        expect(result.current).toBe(19.15)
    })

    it('should use default agent cost when ROI calculator flag is enabled but agent costs are not available', () => {
        useFlagMock.mockReturnValue(true)
        useAppSelectorMock.mockImplementation((selector: any) => {
            if (selector === getCurrentHelpdeskPlan) {
                return {
                    amount: 10000,
                    num_quota_tickets: 100,
                }
            }
            if (selector === getAgentCostsSettings) {
                return null
            }
            return null
        })

        const { result } = renderHook(() =>
            useMoneySavedPerInteractionWithAutomate(defaultAgentCostPerTicket),
        )

        // costPerBillableTicket (5) + agentCostPerTicket (10) - costPerAutomatedInteraction (0.85) = 14.15
        expect(result.current).toBe(14.15)
    })

    it('should calculate money saved with different cost values', () => {
        useGetCostPerAutomatedInteractionMock.mockReturnValue(1.5)
        useGetCostPerBillableTicketMock.mockReturnValue(8)

        const { result } = renderHook(() =>
            useMoneySavedPerInteractionWithAutomate(12),
        )

        // costPerBillableTicket (8) + agentCostPerTicket (12) - costPerAutomatedInteraction (1.5) = 18.5
        expect(result.current).toBe(18.5)
    })
})
