import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {getAgentCostsSettings} from 'state/currentAccount/selectors'

import {useGetCostPerAutomatedInteraction} from './useGetCostPerAutomatedInteraction'
import {useGetCostPerBillableTicket} from './useGetCostPerBillableTicket'

export const useMoneySavedPerInteractionWithAutomate = (
    defaultAgentCostPerTicket: number
) => {
    const hasAccessToROICalculator =
        useFlags()[FeatureFlagKey.ObservabilityROICalculator]

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
