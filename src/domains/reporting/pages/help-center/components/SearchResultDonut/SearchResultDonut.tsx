import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import DonutChart from 'domains/reporting/pages/common/components/charts/DonutChart/DonutChart'
import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import css from 'domains/reporting/pages/help-center/components/SearchResultDonut/SearchResultDonut.less'
import {
    SEARCH_RESULTS_DONUT_TITLE,
    SEARCH_RESULTS_DONUT_TOOLTIP,
} from 'domains/reporting/pages/help-center/HelpCenterMetricsConfig'
import { useSearchResultRange } from 'domains/reporting/pages/help-center/hooks/useSearchResultRange'

const SearchResultDonut = ({ chartId, dashboard }: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const { data, isLoading } = useSearchResultRange(
        cleanStatsFilters,
        userTimezone,
    )

    return (
        <ChartCard
            title={SEARCH_RESULTS_DONUT_TITLE}
            className={css.card}
            hint={SEARCH_RESULTS_DONUT_TOOLTIP}
            dashboard={dashboard}
            chartId={chartId}
        >
            {!isLoading && data.length === 0 ? (
                <NoDataAvailable
                    title="No data available"
                    description="Try adjusting filters to get results."
                    style={{ height: '100%' }}
                />
            ) : (
                <DonutChart
                    data={data}
                    showTooltip
                    displayLegend
                    height={180}
                    isLoading={isLoading}
                    legendClassName={css.legend}
                    className={css.donut}
                />
            )}
        </ChartCard>
    )
}

export default SearchResultDonut
