import {WorkflowDropoffMetricTiers} from '../hooks/useWorkflowDropoffMetricTiers'

export const getDropoffColor = (
    dropOffRate: number,
    tiers: WorkflowDropoffMetricTiers[]
): WorkflowDropoffMetricTiers | undefined => {
    const matchingTier = tiers.find(
        (tier) => dropOffRate >= tier.range[0] && dropOffRate <= tier.range[1]
    )
    return matchingTier
}
