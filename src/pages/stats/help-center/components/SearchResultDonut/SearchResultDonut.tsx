import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import ChartCard from 'pages/stats/common/components/ChartCard'
import DonutChart from 'pages/stats/common/components/charts/DonutChart/DonutChart'
import { NoDataAvailable } from 'pages/stats/common/components/NoDataAvailable'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import css from 'pages/stats/help-center/components/SearchResultDonut/SearchResultDonut.less'
import {
    SEARCH_RESULTS_DONUT_TITLE,
    SEARCH_RESULTS_DONUT_TOOLTIP,
} from 'pages/stats/help-center/HelpCenterMetricsConfig'
import { useSearchResultRange } from 'pages/stats/help-center/hooks/useSearchResultRange'

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
