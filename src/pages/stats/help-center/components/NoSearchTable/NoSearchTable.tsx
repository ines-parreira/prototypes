import React from 'react'
import ChartCard from 'pages/stats/ChartCard'
import {StatsFilters} from 'models/stat/types'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'
import HelpCenterStatsTable, {
    TableCellType,
} from '../HelpCenterStatsTable/HelpCenterStatsTable'
import {useNoSearchResultsMetrics} from '../../hooks/useNoSearchResultsMetrics'

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

type SearchTermsTableProps = {
    statsFilters: StatsFilters
    timezone: string
}

const NoSearchTable = ({statsFilters, timezone}: SearchTermsTableProps) => {
    const [currentPage, setCurrentPage] = React.useState(1)

    const {data, total, isLoading} = useNoSearchResultsMetrics({
        statsFilters,
        timezone,
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
        <ChartCard title="No search results" noPadding>
            {!isLoading && data.length === 0 ? (
                <NoDataAvailable
                    title="No data available"
                    description="Try adjusting filters to get results."
                    style={{height: 448}}
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
