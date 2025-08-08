import { useMemo } from 'react'

import moment from 'moment'

import { MetricTrendFormat } from 'domains/reporting/pages/common/utils'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'

import { useAIJourneyConversionRate } from '../useAIJourneyConversionRate/useAIJourneyConversionRate'
import { useAIJourneyGmvInfluenced } from '../useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced'
import { useAIJourneyTotalOrders } from '../useAIJourneyTotalOrders/useAIJourneyTotalOrders'
import { useClickThroughRate } from '../useClickThroughRate/useClickThroughRate'

export type filterType = {
    period: {
        start_datetime: string
        end_datetime: string
    }
}

export type MetricProps = {
    label: string
    value: number | null | undefined
    prevValue: number | null | undefined
    interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
    metricFormat: MetricTrendFormat
    currency?: string
    isLoading: boolean
}

export const useAIJourneyKpis = () => {
    const { userTimezone } = useAppSelector(getCleanStatsFiltersWithTimezone)
    const filters: filterType = useMemo(() => {
        const start_datetime = moment()
            .subtract(30, 'days')
            .startOf('day')
            .format()

        return {
            period: {
                start_datetime,
                end_datetime: moment().endOf('day').format(),
            },
        }
    }, [])

    const gmvInfluenced = useAIJourneyGmvInfluenced(userTimezone, filters)
    const totalOrders = useAIJourneyTotalOrders(userTimezone, filters)
    const conversionRate = useAIJourneyConversionRate(userTimezone, filters)
    const clickThroughRate = useClickThroughRate(userTimezone, filters)

    return [gmvInfluenced, totalOrders, conversionRate, clickThroughRate]
}
