import { MetricPerDimensionTrend } from 'hooks/reporting/useMetricPerDimension'
import { useTicketCountPerProductWithEnrichment } from 'hooks/reporting/voice-of-customer/metricsPerProduct'
import { OrderDirection } from 'models/api/types'
import { TicketProductsEnrichedCube } from 'models/reporting/cubes/core/TicketProductsEnrichedCube'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

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
