import { useMemo } from 'react'

import moment from 'moment'

import { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { MetricTrendFormat } from 'domains/reporting/pages/common/utils'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'

import { useAIJourneyConversionRate } from '../useAIJourneyConversionRate/useAIJourneyConversionRate'
import { useAIJourneyGmvInfluenced } from '../useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced'
import { useAIJourneyResponseRate } from '../useAIJourneyResponseRate/useAIJourneyResponseRate'

export type filterType = {
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
    metricFormat: MetricTrendFormat
    currency?: string
    isLoading: boolean
}

export const useAbandonedCartKpis = (
    integrationId: string,
    journeyId?: string,
    customStartDate?: string,
    customEndDate?: string,
) => {
    const granularity = ReportingGranularity.Week
    const { userTimezone } = useAppSelector(getCleanStatsFiltersWithTimezone)
    const filters: filterType = useMemo(() => {
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

    const gmvInfluenced = useAIJourneyGmvInfluenced(
        integrationId,
        userTimezone,
        filters,
        granularity,
        journeyId,
    )

    const conversionRate = useAIJourneyConversionRate(
        integrationId,
        userTimezone,
        filters,
        granularity,
        journeyId,
    )

    const responseRate = useAIJourneyResponseRate(
        integrationId,
        userTimezone,
        filters,
        granularity,
        journeyId,
    )

    return {
        period: {
            start: filters.period.start_datetime,
            end: filters.period.end_datetime,
        },
        metrics: [gmvInfluenced, conversionRate, responseRate],
    }
}
