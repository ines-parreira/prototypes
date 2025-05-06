import { useMemo } from 'react'

import moment from 'moment'

import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import { ReportingGranularity } from 'models/reporting/types'
import { useGmvUsdOverTimeSeries } from 'pages/stats/automate/aiSalesAgent/metrics/useGmvUsdOverTimeSeries'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { formatCurrency } from 'pages/stats/common/utils'
import { getTimezone } from 'state/currentUser/selectors'

const estimatedInfluencedGMV = 0.03
const lowerImpactMultiplier = 0.8
const upperImpactMultiplier = 1.2
const roundTo = 10

export const computeRoundedPotentialImpact = (data: TimeSeriesDataItem[][]) => {
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

export const usePotentialImpact = (storeIntegration?: number) => {
    const timezone = useAppSelector(getTimezone) ?? 'UTC'

    const { from, to } = useMemo(() => {
        const now = moment()

        return {
            from: now.clone().subtract(30, 'd').toISOString(),
            to: now.toISOString(),
        }
    }, [])

    const { data, error, isLoading } = useGmvUsdOverTimeSeries(
        {
            period: {
                end_datetime: to,
                start_datetime: from,
            },
            storeIntegrations:
                storeIntegration !== undefined
                    ? {
                          operator: LogicalOperatorEnum.ONE_OF,
                          values: [storeIntegration],
                      }
                    : undefined,
        },
        timezone,
        ReportingGranularity.Day,
    )

    const formattedImpact = useMemo(() => {
        if (error || !data?.length) {
            return null
        }

        const potentialImpact = computeRoundedPotentialImpact(data)

        if (!potentialImpact?.lowerImpact || !potentialImpact?.upperImpact) {
            return null
        }

        const { lowerImpact, upperImpact } = potentialImpact

        return `Unlock between ${formatCurrency(lowerImpact, 'USD')} and ${formatCurrency(upperImpact, 'USD')} of additional GMV.`
    }, [data, error])

    return {
        potentialImpact: formattedImpact,
        isPotentialImpactLoading: isLoading,
    }
}
