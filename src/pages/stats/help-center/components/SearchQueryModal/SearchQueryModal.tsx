import {ModalHeader} from 'reactstrap'
import React, {useState} from 'react'
import ModalBody from 'pages/common/components/modal/ModalBody'
import {StatsFilters} from 'models/stat/types'
import HelpCenterStatsTable, {
    TableCellType,
} from '../HelpCenterStatsTable/HelpCenterStatsTable'
import {useSearchQueryMetrics} from '../../hooks/useSearchQueryMetrics'

const ITEMS_PER_PAGE = 10

const columns = [
    {
        type: TableCellType.String,
        name: 'Article clicked',
        width: 800,
    },
    {
        type: TableCellType.Number,
        name: 'Clicks',
    },
]

type SearchQueryModalProps = {
    onClose: () => void
    statsFilters: StatsFilters
    timezone: string
    searchQuery: string
    articleClickedCount: number
}

const SearchQueryModal = ({
    onClose,
    statsFilters,
    timezone,
    searchQuery,
    articleClickedCount,
}: SearchQueryModalProps) => {
    const [currentPage, setCurrentPage] = useState(1)
    const onPageChange = (page: number) => {
        if (currentPage !== page) {
            setCurrentPage(page)
        }
    }

    const {isLoading, data} = useSearchQueryMetrics({
        statsFilters,
        timezone,
        searchQuery,
    })

    return (
        <>
            <ModalHeader toggle={onClose}>{searchQuery}</ModalHeader>
            <ModalBody>
                <HelpCenterStatsTable
                    isLoading={isLoading}
                    currentPage={currentPage}
                    onPageChange={onPageChange}
                    count={articleClickedCount}
                    pageSize={
                        articleClickedCount < ITEMS_PER_PAGE
                            ? articleClickedCount
                            : ITEMS_PER_PAGE
                    }
                    columns={columns}
                    data={data}
                />
            </ModalBody>
        </>
    )
}

export default SearchQueryModal
