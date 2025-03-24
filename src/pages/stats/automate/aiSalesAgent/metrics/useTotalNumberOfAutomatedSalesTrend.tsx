import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { totalNumberOfAutomatedSalesQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

const useTotalNumberOfAutomatedSalesTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useMetricTrend(
        totalNumberOfAutomatedSalesQueryFactory(filters, timezone),
        totalNumberOfAutomatedSalesQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

const fetchTotalNumberOfAutomatedSalesTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        totalNumberOfAutomatedSalesQueryFactory(filters, timezone),
        totalNumberOfAutomatedSalesQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export {
    useTotalNumberOfAutomatedSalesTrend,
    fetchTotalNumberOfAutomatedSalesTrend,
}
