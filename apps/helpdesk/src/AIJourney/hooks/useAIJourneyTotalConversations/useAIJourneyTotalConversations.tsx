import { FilterType } from 'AIJourney/hooks/useFilters/useFilters'
import { aiJourneyTotalConversationsQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import { useMetric } from 'domains/reporting/hooks/useMetric'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import useAppSelector from 'hooks/useAppSelector'

import { MetricProps } from '../useAIJourneyKpis/useAIJourneyKpis'

export type UseAIJourneyTotalConversationsParams = {
    journeyId?: string
    filters: FilterType
}

export const useAIJourneyTotalConversations = ({
    journeyId,
    filters,
}: UseAIJourneyTotalConversationsParams): MetricProps => {
    const { userTimezone } = useAppSelector(getCleanStatsFiltersWithTimezone)

    const { data, isFetching } = useMetric(
        aiJourneyTotalConversationsQueryFactory(
            filters,
            userTimezone,
            journeyId,
        ),
    )

    return {
        label: 'Total Conversations',
        value: data?.value || 0,
        interpretAs: 'more-is-better',
        metricFormat: 'decimal-precision-1',
        isLoading: isFetching,
    }
}
