import { useMemo } from 'react'

import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import {
    computeRoundedPotentialImpact,
    getCurrencyFormatter,
} from 'pages/aiAgent/components/CustomerEngagementSettings/hooks/usePotentialImpact'

type ImpactInput = {
    gmv: TimeSeriesDataItem[][] | undefined
    estimatedInfluencedGMV: number
}

export const useLowestPotentialImpact = (groups: ImpactInput[]) => {
    const formattedImpact = useMemo(() => {
        const impacts: number[] = []

        for (const { gmv, estimatedInfluencedGMV } of groups) {
            if (!gmv?.length) continue

            const result = computeRoundedPotentialImpact(
                estimatedInfluencedGMV,
                gmv,
            )
            const lower = result?.lowerImpact

            if (typeof lower === 'number') {
                impacts.push(lower)
            }
        }

        if (!impacts.length) return null

        const lowest = Math.min(...impacts)
        const formatter = getCurrencyFormatter()
        return `boosting sales by up to ${formatter.format(lowest)} of additional GMV.`
    }, [groups])

    return formattedImpact
}
