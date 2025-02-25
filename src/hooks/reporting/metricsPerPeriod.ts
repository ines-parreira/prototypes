import {
    MetricPerDimensionTrend,
    useMetricPerDimension,
} from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import { tagsTicketCountQueryFactory } from 'models/reporting/queryFactories/ticket-insights/tagsTicketCount'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

export const useTagsTicketCount = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting: OrderDirection,
): MetricPerDimensionTrend => {
    const currentPeriod = useMetricPerDimension(
        tagsTicketCountQueryFactory(statsFilters, timezone, sorting),
    )

    const previousPeriod = useMetricPerDimension(
        tagsTicketCountQueryFactory(
            {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone,
            sorting,
        ),
    )

    return {
        data: {
            value: currentPeriod?.data?.allData ?? [],
            prevValue: previousPeriod?.data?.allData ?? [],
        },
        isError: currentPeriod.isError || previousPeriod.isError,
        isFetching: currentPeriod.isFetching || previousPeriod.isFetching,
    }
}
