import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import useAppSelector from 'hooks/useAppSelector'
import { getAgentCostsSettings } from 'state/currentAccount/selectors'

import { useGetCostPerAutomatedInteraction } from './useGetCostPerAutomatedInteraction'
import { useGetCostPerBillableTicket } from './useGetCostPerBillableTicket'

export const useMoneySavedPerInteractionWithAutomate = (
    defaultAgentCostPerTicket: number,
) => {
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
    const moneySavedPerInteraction =
        costPerBillableTicket + agentCostPerTicket - costPerAutomatedInteraction

    return moneySavedPerInteraction
}
