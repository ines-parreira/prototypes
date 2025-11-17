import type { WorkflowDropoffMetricTiers } from '../hooks/useWorkflowDropoffMetricTiers'

export const getDropoffColor = (
    dropOffRate: number,
    tiers: WorkflowDropoffMetricTiers[],
): WorkflowDropoffMetricTiers | undefined => {
    const roundedDropOffRate = parseFloat(dropOffRate.toFixed(2))
    const matchingTier = tiers.find(
        (tier) =>
            roundedDropOffRate >= tier.range[0] &&
            roundedDropOffRate <= tier.range[1],
    )
    return matchingTier
}
