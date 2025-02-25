import React from 'react'

import { useNewStatsFilters } from 'hooks/reporting/support-performance/useNewStatsFilters'
import ChartCard from 'pages/stats/ChartCard'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'
import HelpCenterStatsTable, {
    TableCellType,
} from 'pages/stats/help-center/components/HelpCenterStatsTable/HelpCenterStatsTable'
import { useNoSearchResultsMetrics } from 'pages/stats/help-center/hooks/useNoSearchResultsMetrics'
import { NoDataAvailable } from 'pages/stats/NoDataAvailable'

const ITEMS_PER_PAGE = 20

const columns = [
    {
        type: TableCellType.String,
        name: 'Search term',
        width: 245,
    },
    {
        type: TableCellType.Number,
        name: 'Search count',
        tooltip: {
            title: 'Number of times the term was used in the search bar',
        },
    },
]

export const NO_SEARCH_TABLE_TITLE = 'No search results'

const NoSearchTable = ({ chartId, dashboard }: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone } = useNewStatsFilters()
    const [currentPage, setCurrentPage] = React.useState(1)

    const { data, total, isLoading } = useNoSearchResultsMetrics({
        statsFilters: cleanStatsFilters,
        timezone: userTimezone,
        currentPage: currentPage,
        itemPerPage: ITEMS_PER_PAGE,
    })

    const onPageChange = (page: number) => {
        if (currentPage !== page) {
            setCurrentPage(page)
        }
    }

    const count = Math.ceil(total / ITEMS_PER_PAGE)

    return (
        <ChartCard
            title={NO_SEARCH_TABLE_TITLE}
            noPadding
            chartId={chartId}
            dashboard={dashboard}
        >
            {!isLoading && data.length === 0 ? (
                <NoDataAvailable
                    title="No data available"
                    description="Try adjusting filters to get results."
                    style={{ height: 448 }}
                />
            ) : (
                <HelpCenterStatsTable
                    onPageChange={onPageChange}
                    isLoading={isLoading}
                    currentPage={currentPage}
                    count={count}
                    pageSize={ITEMS_PER_PAGE}
                    columns={columns}
                    data={data}
                />
            )}
        </ChartCard>
    )
}

export default NoSearchTable
