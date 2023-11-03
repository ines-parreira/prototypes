import React from 'react'
import ChartCard from 'pages/stats/ChartCard'
import {StatsFilters} from 'models/stat/types'
import HelpCenterStatsTable, {
    TableCellType,
} from '../HelpCenterStatsTable/HelpCenterStatsTable'
import {usePerformanceByArticleMetrics} from '../../hooks/usePerformanceByArticleMetrics'

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
            title: 'Number of positive reactions compared to negative',
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

type PerformanceByArticleProps = {
    statsFilters: StatsFilters
    timezone: string
    helpCenterDomain: string
    helpCenterId: number
}

export const PerformanceByArticle = ({
    statsFilters,
    timezone,
    helpCenterDomain,
    helpCenterId,
}: PerformanceByArticleProps) => {
    const [currentPage, setCurrentPage] = React.useState(1)

    const onPageChange = (page: number) => {
        if (currentPage !== page) {
            setCurrentPage(page)
        }
    }

    const {data, total, isLoading} = usePerformanceByArticleMetrics({
        itemPerPage: ITEMS_PER_PAGE,
        timezone,
        currentPage,
        statsFilters,
        helpCenterDomain,
        helpCenterId,
    })

    const count = Math.ceil(total / ITEMS_PER_PAGE)

    return (
        <ChartCard title="Performance by articles" noPadding>
            <HelpCenterStatsTable
                onPageChange={onPageChange}
                isLoading={isLoading}
                currentPage={currentPage}
                count={count}
                pageSize={ITEMS_PER_PAGE}
                columns={columns}
                data={data}
            />
        </ChartCard>
    )
}
