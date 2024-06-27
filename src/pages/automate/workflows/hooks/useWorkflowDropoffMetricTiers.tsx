import {useMemo} from 'react'
import {
    HIGH_TIERS_DROPOFF_COLOR,
    LOW_TIERS_DROPOFF_COLOR,
    MID_TIERS_DROPOFF_COLOR,
} from '../common/constants'

export interface WorkflowDropoffMetricTiers {
    range: [number, number]
    color: string
}

interface UseWorkflowDropoffMetricTiersProps {
    dropOffRates: number[]
}

const useWorkflowDropoffMetricTiers = ({
    dropOffRates,
}: UseWorkflowDropoffMetricTiersProps): WorkflowDropoffMetricTiers[] => {
    const metricTiers = useMemo(() => {
        if (dropOffRates.length === 0) {
            return []
        }

        const minRate = 0
        const maxRate = Math.max(...dropOffRates)
        const range = maxRate - minRate
        const tierSize = range / 3

        const lowTier: WorkflowDropoffMetricTiers = {
            range: [Math.round(minRate), Math.round(minRate + tierSize)],
            color: LOW_TIERS_DROPOFF_COLOR,
        }

        const midTier: WorkflowDropoffMetricTiers = {
            range: [
                Math.round(minRate + tierSize) + 1,
                Math.round(minRate + 2 * tierSize),
            ],
            color: MID_TIERS_DROPOFF_COLOR,
        }

        const highTier: WorkflowDropoffMetricTiers = {
            range: [
                Math.round(minRate + 2 * tierSize) + 1,
                Math.round(maxRate),
            ],
            color: HIGH_TIERS_DROPOFF_COLOR,
        }

        return [lowTier, midTier, highTier]
    }, [dropOffRates])

    return metricTiers
}

export default useWorkflowDropoffMetricTiers
