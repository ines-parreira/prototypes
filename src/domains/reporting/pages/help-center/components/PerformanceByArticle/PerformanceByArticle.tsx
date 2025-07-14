import { useState } from 'react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import HelpCenterStatsTable, {
    TableCellType,
} from 'domains/reporting/pages/help-center/components/HelpCenterStatsTable/HelpCenterStatsTable'
import { usePerformanceByArticleMetrics } from 'domains/reporting/pages/help-center/hooks/usePerformanceByArticleMetrics'

const columns = [
    {
        type: TableCellType.String,
        name: 'Article',
        width: 594,
    },
    {
        type: TableCellType.Number,
        name: 'Views',
        tooltip: {
            title: 'Total number of views, including duplicate views by the same user',
        },
    },
    {
        type: TableCellType.Percent,
        name: 'Rating',
        tooltip: {
            title: 'Quality of article calculated by: (# of positive reactions / (total # of reactions)) * 100 across all time',
        },
    },
    {
        type: TableCellType.String,
        name: '👍 | 👎',
        tooltip: {
            title: 'Number of positive reactions compared to negative reactions',
        },
    },
    {
        type: TableCellType.Date,
        name: 'last updated',
        width: 160,
        tooltip: {
            title: 'The most recent date the article was edited',
        },
    },
]

const ITEMS_PER_PAGE = 20

type Props = {
    helpCenterDomain: string
    helpCenterId: number
} & DashboardChartProps

export const PerformanceByArticle = ({
    helpCenterDomain,
    helpCenterId,
    dashboard,
    chartId,
}: Props) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const [currentPage, setCurrentPage] = useState(1)

    const onPageChange = (page: number) => {
        if (currentPage !== page) {
            setCurrentPage(page)
        }
    }

    const { data, total, isLoading } = usePerformanceByArticleMetrics({
        itemPerPage: ITEMS_PER_PAGE,
        timezone: userTimezone,
        currentPage,
        statsFilters: cleanStatsFilters,
        helpCenterDomain,
        helpCenterId,
    })

    const count = Math.ceil(total / ITEMS_PER_PAGE)

    return (
        <ChartCard
            title={'Performance by articles'}
            noPadding
            chartId={chartId}
            dashboard={dashboard}
        >
            {!isLoading && data.length === 0 ? (
                <NoDataAvailable
                    title="No data available"
                    description="Try adjusting filters to get results."
                    style={{ height: 1156 }}
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
