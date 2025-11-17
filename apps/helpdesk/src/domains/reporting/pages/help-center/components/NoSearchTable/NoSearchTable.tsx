import { useState } from 'react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import HelpCenterStatsTable, {
    TableCellType,
} from 'domains/reporting/pages/help-center/components/HelpCenterStatsTable/HelpCenterStatsTable'
import { useNoSearchResultsMetrics } from 'domains/reporting/pages/help-center/hooks/useNoSearchResultsMetrics'

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
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const [currentPage, setCurrentPage] = useState(1)

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
