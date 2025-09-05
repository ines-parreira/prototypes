import { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import { aiJourneyTotalMessagesQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import { useMetric } from 'domains/reporting/hooks/useMetric'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

import { MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

export type UseAIJourneyTotalMessagesParams = {
    journeyId?: string
    filters: FilterType
}

export const useAIJourneyTotalMessages = ({
    journeyId,
    filters,
}: UseAIJourneyTotalMessagesParams): MetricProps => {
    const { currency } = useCurrency()
    const { userTimezone } = useAppSelector(getCleanStatsFiltersWithTimezone)

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
