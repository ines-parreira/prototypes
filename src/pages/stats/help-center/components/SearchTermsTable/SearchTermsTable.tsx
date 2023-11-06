import React from 'react'
import ChartCard from 'pages/stats/ChartCard'
import {StatsFilters} from 'models/stat/types'
import HelpCenterStatsTable, {
    TableCellType,
} from '../HelpCenterStatsTable/HelpCenterStatsTable'
import {useSearchTermsMetrics} from '../../hooks/useSearchTermsMetrics'

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
    {
        type: TableCellType.Number,
        name: 'Article clicked',
        tooltip: {
            title: '# of unique articles that were selected from the results returned',
        },
    },
    {
        type: TableCellType.Percent,
        name: 'Click - through rate',
        width: 200,
        tooltip: {
            title: '% of search sessions where there was at least 1 click on a search result',
        },
    },
]

type SearchTermsTableProps = {
    statsFilters: StatsFilters
    timezone: string
}

const SearchTermsTable = ({statsFilters, timezone}: SearchTermsTableProps) => {
    const [currentPage, setCurrentPage] = React.useState(1)

    const {data, total, isLoading} = useSearchTermsMetrics({
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
        <ChartCard title="Search terms with results" noPadding>
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

export default SearchTermsTable
