import React from 'react'

import {StatsFilters} from 'models/stat/types'
import ChartCard from 'pages/stats/ChartCard'
import DonutChart from 'pages/stats/common/components/charts/DonutChart/DonutChart'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'

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
            hint={{
                title: 'Distribution of total searches resulting in articles shown to the user vs. no search results',
            }}
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
