import React, { useState } from 'react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { TopProductRecommendationTableStats } from 'pages/stats/aiSalesAgent/components/TopProductRecommendationTableStats'
import { useProductRecommendations } from 'pages/stats/aiSalesAgent/metrics/useProductRecommendations'
import ChartCard from 'pages/stats/ChartCard'
import { DashboardChartProps } from 'pages/stats/dashboards/types'

const ITEMS_PER_PAGE = 10

const TopProductRecommendationTable = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const data = useProductRecommendations(cleanStatsFilters, userTimezone)

    const [offset, setOffset] = useState(0)

    const handleClickNextPage = () => {
        let nextValue = offset + ITEMS_PER_PAGE
        if (nextValue >= data.data.length) {
            nextValue = data.data.length - 1
        }
        setOffset(nextValue)
    }
    const handleClickPrevPage = () => {
        let nextValue = offset - ITEMS_PER_PAGE
        if (nextValue < 0) {
            nextValue = 0
        }
        setOffset(nextValue)
    }

    return (
        <ChartCard
            title="Top products recommended"
            noPadding={true}
            chartId={chartId}
            dashboard={dashboard}
        >
            <TopProductRecommendationTableStats
                isLoading={data.isFetching || data.isError}
                rows={data.data}
                perPage={ITEMS_PER_PAGE}
                offset={offset}
                onClickNextPage={handleClickNextPage}
                onClickPrevPage={handleClickPrevPage}
            />
        </ChartCard>
    )
}

export default TopProductRecommendationTable
