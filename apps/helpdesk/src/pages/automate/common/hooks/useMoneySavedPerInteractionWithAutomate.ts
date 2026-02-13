import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentHelpdeskPlan } from 'state/billing/selectors'
import { getAgentCostsSettings } from 'state/currentAccount/selectors'

import { useGetCostPerAutomatedInteraction } from './useGetCostPerAutomatedInteraction'
import { useGetCostPerBillableTicket } from './useGetCostPerBillableTicket'

export const useMoneySavedPerInteractionWithAutomate = (
    defaultAgentCostPerTicket: number,
) => {
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const hasAccessToROICalculator = useFlag(
        FeatureFlagKey.ObservabilityROICalculator,
    )

    const agentCosts = useAppSelector(getAgentCostsSettings)

    const agentCostPerTicket =
        hasAccessToROICalculator && agentCosts
            ? agentCosts?.data.agent_cost_per_ticket
            : defaultAgentCostPerTicket

    const costPerAutomatedInteraction = useGetCostPerAutomatedInteraction()
    const costPerBillableTicket = useGetCostPerBillableTicket()

    // formula can't return any result if num_quota_tickets === 0
    if (currentHelpdeskPlan?.num_quota_tickets === 0) {
        return 0
    }

    const moneySavedPerInteraction =
        costPerBillableTicket + agentCostPerTicket - costPerAutomatedInteraction

    return moneySavedPerInteraction
}
