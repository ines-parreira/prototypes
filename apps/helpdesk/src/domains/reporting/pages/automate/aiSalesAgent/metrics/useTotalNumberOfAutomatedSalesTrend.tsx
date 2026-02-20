import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { totalNumberOfAutomatedSalesQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { AISalesAgentTotalNumberOfAutomatedSalesQueryFactoryV2 } from 'domains/reporting/models/scopes/AISalesAgentConversations'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

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
        AISalesAgentTotalNumberOfAutomatedSalesQueryFactoryV2({
            filters,
            timezone,
        }),
        AISalesAgentTotalNumberOfAutomatedSalesQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
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
        AISalesAgentTotalNumberOfAutomatedSalesQueryFactoryV2({
            filters,
            timezone,
        }),
        AISalesAgentTotalNumberOfAutomatedSalesQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

export {
    useTotalNumberOfAutomatedSalesTrend,
    fetchTotalNumberOfAutomatedSalesTrend,
}
