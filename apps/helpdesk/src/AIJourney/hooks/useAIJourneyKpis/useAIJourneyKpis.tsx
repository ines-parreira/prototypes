import { useEffect, useMemo } from 'react'

import moment from 'moment'

import { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import { mergeStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import { useAIJourneyConversionRate } from '../useAIJourneyConversionRate/useAIJourneyConversionRate'
import { useAIJourneyGmvInfluenced } from '../useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced'
import { useAIJourneyResponseRate } from '../useAIJourneyResponseRate/useAIJourneyResponseRate'
import { useAIJourneyTotalOrders } from '../useAIJourneyTotalOrders/useAIJourneyTotalOrders'
import { useClickThroughRate } from '../useClickThroughRate/useClickThroughRate'

export type FilterType = {
    period: {
        start_datetime: string
        end_datetime: string
    }
}

export type MetricProps = {
    label: string
    value: number
    prevValue?: number | null | undefined
    series?: TimeSeriesDataItem[]
    interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
    metricFormat: MetricValueFormat
    currency?: string
    isLoading: boolean
    drilldown?: DrillDownMetric
}

export const useAIJourneyKpis = (
    integrationId: string,
    shopName: string,
    customStartDate?: string,
    customEndDate?: string,
) => {
    const dispatch = useAppDispatch()

    const granularity = ReportingGranularity.Week
    const { userTimezone } = useAppSelector(getCleanStatsFiltersWithTimezone)
    const filters: FilterType = useMemo(() => {
        const start_datetime =
            customStartDate ??
            moment().subtract(28, 'days').startOf('day').format()
        const end_datetime = customEndDate ?? moment().endOf('day').format()

        return {
            period: {
                start_datetime,
                end_datetime,
            },
        }
    }, [customStartDate, customEndDate])

    useEffect(() => {
        dispatch(
            mergeStatsFilters({
                period: {
                    start_datetime: filters.period.start_datetime,
                    end_datetime: filters.period.end_datetime,
                },
            }),
        )
    }, [filters.period, dispatch])

    const gmvInfluenced = useAIJourneyGmvInfluenced(
        integrationId,
        userTimezone,
        filters,
        granularity,
    )
    const totalOrders = useAIJourneyTotalOrders(
        integrationId,
        userTimezone,
        filters,
        granularity,
        shopName,
    )
    const conversionRate = useAIJourneyConversionRate(
        integrationId,
        userTimezone,
        filters,
        granularity,
    )
    const clickThroughRate = useClickThroughRate(
        integrationId,
        userTimezone,
        filters,
        granularity,
    )

    const responseRate = useAIJourneyResponseRate(
        integrationId,
        userTimezone,
        filters,
        granularity,
        shopName,
    )

    return {
        period: {
            start: filters.period.start_datetime,
            end: filters.period.end_datetime,
        },
        metrics: [
            gmvInfluenced,
            totalOrders,
            conversionRate,
            clickThroughRate,
            responseRate,
        ],
    }
}
