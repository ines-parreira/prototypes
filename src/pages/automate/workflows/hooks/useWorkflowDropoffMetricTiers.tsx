import {useMemo} from 'react'

import {
    HIGH_TIERS_DROPOFF_BACKGROUND,
    HIGH_TIERS_DROPOFF_COLOR,
    LOW_TIERS_DROPOFF_BACKGROUND,
    LOW_TIERS_DROPOFF_COLOR,
    MID_TIERS_DROPOFF_BACKGROUND,
    MID_TIERS_DROPOFF_COLOR,
} from '../common/constants'

export interface WorkflowDropoffMetricTiers {
    range: [number, number]
    background: string
    color: string
}

interface UseWorkflowDropoffMetricTiersProps {
    dropOffRates: number[]
}

const calculateTierRange = (
    min: number,
    max: number,
    tierIndex: number,
    tiersCount: number = 3
): [number, number] => {
    const range = max - min
    const tierSize = range / tiersCount
    const start = min + tierSize * tierIndex
    const end = min + tierSize * (tierIndex + 1)

    return [start, end]
}

const createTier = (
    range: [number, number],
    background: string,
    color: string
): WorkflowDropoffMetricTiers => ({
    range: [Math.round(range[0] * 100) / 100, Math.round(range[1] * 100) / 100],
    background,
    color,
})

const createSingleTier = (value: number): WorkflowDropoffMetricTiers[] => {
    const singleTier = createTier(
        [value, value],
        LOW_TIERS_DROPOFF_BACKGROUND,
        LOW_TIERS_DROPOFF_COLOR
    )
    return [singleTier]
}

const useWorkflowDropoffMetricTiers = ({
    dropOffRates,
}: UseWorkflowDropoffMetricTiersProps): WorkflowDropoffMetricTiers[] => {
    const metricTiers = useMemo(() => {
        if (dropOffRates.length === 0) {
            return createSingleTier(0)
        }

        if (dropOffRates.length === 1) {
            return createSingleTier(dropOffRates[0])
        }

        const minRate = Math.min(...dropOffRates)
        const maxRate = Math.max(...dropOffRates)

        const lowTierRange = calculateTierRange(minRate, maxRate, 0)
        const midTierRange = calculateTierRange(minRate, maxRate, 1)
        const highTierRange = calculateTierRange(minRate, maxRate, 2)

        const lowTier = createTier(
            lowTierRange,
            LOW_TIERS_DROPOFF_BACKGROUND,
            LOW_TIERS_DROPOFF_COLOR
        )
        const midTier = createTier(
            midTierRange,
            MID_TIERS_DROPOFF_BACKGROUND,
            MID_TIERS_DROPOFF_COLOR
        )
        const highTier = createTier(
            highTierRange,
            HIGH_TIERS_DROPOFF_BACKGROUND,
            HIGH_TIERS_DROPOFF_COLOR
        )

        return [lowTier, midTier, highTier]
    }, [dropOffRates])

    return metricTiers
}

export default useWorkflowDropoffMetricTiers
