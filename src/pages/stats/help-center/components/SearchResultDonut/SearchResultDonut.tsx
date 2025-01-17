import React from 'react'

import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'

import ChartCard from 'pages/stats/ChartCard'
import DonutChart from 'pages/stats/common/components/charts/DonutChart/DonutChart'
import css from 'pages/stats/help-center/components/SearchResultDonut/SearchResultDonut.less'
import {
    SEARCH_RESULTS_DONUT_TITLE,
    SEARCH_RESULTS_DONUT_TOOLTIP,
} from 'pages/stats/help-center/HelpCenterMetricsConfig'
import {useSearchResultRange} from 'pages/stats/help-center/hooks/useSearchResultRange'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'

const SearchResultDonut = () => {
    const {cleanStatsFilters, userTimezone} = useNewStatsFilters()
    const {data, isLoading} = useSearchResultRange(
        cleanStatsFilters,
        userTimezone
    )

    return (
        <ChartCard
            title={SEARCH_RESULTS_DONUT_TITLE}
            className={css.card}
            hint={SEARCH_RESULTS_DONUT_TOOLTIP}
        >
            {!isLoading && data.length === 0 ? (
                <NoDataAvailable
                    title="No data available"
                    description="Try adjusting filters to get results."
                    style={{height: '100%'}}
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
