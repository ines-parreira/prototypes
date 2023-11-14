import React from 'react'
import DonutChart from 'pages/stats/common/components/charts/DonutChart/DonutChart'
import ChartCard from 'pages/stats/ChartCard'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'
import {StatsFilters} from 'models/stat/types'
import {useSearchResultRange} from '../../hooks/useSearchResultRange'
import css from './SearchResultDonut.less'

type SearchResultDonutProps = {
    statsFilters: StatsFilters
    timezone: string
}

const SearchResultDonut = ({
    statsFilters,
    timezone,
}: SearchResultDonutProps) => {
    const {data, isLoading} = useSearchResultRange(statsFilters, timezone)

    return (
        <ChartCard
            title="Search results"
            className={css.card}
            hint="Distribution of total searches resulting in articles shown to the user vs. no search results"
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
