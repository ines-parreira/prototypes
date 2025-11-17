import { useContext, useMemo, useState } from 'react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { TopProductRecommendationTableStats } from 'domains/reporting/pages/automate/aiSalesAgent/components/TopProductRecommendationTableStats'
import { WarningBannerContext } from 'domains/reporting/pages/automate/aiSalesAgent/components/WarningBannerProvider'
import { useProductRecommendations } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useProductRecommendations'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

const ITEMS_PER_PAGE = 10

const useNullProductRecommendations = () => {
    return {
        isFetching: false,
        isError: false,
        data: [],
    }
}

const Chart = ({
    chartId,
    dashboard,
    useData,
}: DashboardChartProps & {
    useData: typeof useProductRecommendations
}) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const data = useData(cleanStatsFilters, userTimezone)

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
            hint={{
                title: 'The 25 top recommended products by the Shopping Assistant.',
            }}
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

const TopProductRecommendationTable = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { isBannerVisible } = useContext(WarningBannerContext)

    const ChartComponent = useMemo(() => {
        const useData = isBannerVisible
            ? useNullProductRecommendations
            : useProductRecommendations

        return () => (
            <Chart chartId={chartId} dashboard={dashboard} useData={useData} />
        )
    }, [chartId, dashboard, isBannerVisible])

    return <ChartComponent />
}

export default TopProductRecommendationTable
