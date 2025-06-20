import { useMemo } from 'react'

import moment from 'moment'

import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'

export const lowerImpactMultiplier = 0.8
export const upperImpactMultiplier = 1.2
export const roundTo = 10

export const getCurrencyFormatter = () =>
    Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
    })

export const computeRoundedPotentialImpact = (
    estimatedInfluencedGMV: number,
    data: TimeSeriesDataItem[][],
) => {
    const firstDayWithData = data[0]
        .filter((item) => item.value > 0)
        .at(0)?.dateTime

    if (!firstDayWithData) {
        return null
    }

    const days = moment().diff(firstDayWithData, 'days')

    if (days < 7) {
        return null
    }

    const multiplier = 365 / days
    const estimatedYearlyGMV =
        data[0].reduce((acc, item) => acc + item.value, 0) * multiplier
    const estimatedInfluencedYearlyGMV =
        estimatedYearlyGMV * estimatedInfluencedGMV

    const lowerImpact = estimatedInfluencedYearlyGMV * lowerImpactMultiplier
    const upperImpact = estimatedInfluencedYearlyGMV * upperImpactMultiplier

    return {
        lowerImpact: Math.round(lowerImpact / roundTo) * roundTo,
        upperImpact: Math.round(upperImpact / roundTo) * roundTo,
    }
}

export const usePotentialImpact = (
    estimatedInfluencedGMV: number,
    gmv: TimeSeriesDataItem[][] | undefined,
) => {
    const formattedImpact = useMemo(() => {
        if (!gmv?.length) {
            return null
        }

        const potentialImpact = computeRoundedPotentialImpact(
            estimatedInfluencedGMV,
            gmv,
        )

        if (!potentialImpact?.lowerImpact) {
            return null
        }

        const formatter = getCurrencyFormatter()
        const lower = formatter.format(potentialImpact.lowerImpact)

        return `Unlock up to ${lower} of yearly additional GMV.`
    }, [estimatedInfluencedGMV, gmv])

    return formattedImpact
}
