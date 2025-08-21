import { useMemo } from 'react'

import moment from 'moment'

import { aiJourneyTotalMessagesQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import { useMetric } from 'domains/reporting/hooks/useMetric'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

import { FilterType, MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

export const useAIJourneyTotalMessages = (journeyId?: string): MetricProps => {
    const { currency } = useCurrency()
    const { userTimezone } = useAppSelector(getCleanStatsFiltersWithTimezone)

    const filters: FilterType = useMemo(() => {
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

    const { data, isFetching } = useMetric(
        aiJourneyTotalMessagesQueryFactory(filters, userTimezone, journeyId),
    )

    return {
        label: 'Total Messages Sent',
        value: data?.value || 0,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-precision-1',
        currency,
        isLoading: isFetching,
    }
}
