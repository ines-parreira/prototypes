import type { MetricPerDimensionTrend } from 'domains/reporting/hooks/useMetricPerDimension'
import { useTicketCountPerProductWithEnrichment } from 'domains/reporting/hooks/voice-of-customer/metricsPerProduct'
import type { TicketProductsEnrichedCube } from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

export const useTicketsPerProductTrend = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting: OrderDirection,
): MetricPerDimensionTrend<TicketProductsEnrichedCube> => {
    const currentPeriod = useTicketCountPerProductWithEnrichment(
        statsFilters,
        timezone,
        sorting,
    )
    const previousPeriod = useTicketCountPerProductWithEnrichment(
        {
            ...statsFilters,
            period: getPreviousPeriod(statsFilters.period),
        },
        timezone,
        sorting,
    )

    return {
        data: {
            value: currentPeriod.data?.allData ?? [],
            prevValue: previousPeriod.data?.allData ?? [],
        },
        isError: currentPeriod.isError || previousPeriod.isError,
        isFetching: currentPeriod.isFetching || previousPeriod.isFetching,
    }
}
