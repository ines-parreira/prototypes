import React, { useState } from 'react'

import { ModalHeader } from 'reactstrap'

import { StatsFilters } from 'models/stat/types'
import ModalBody from 'pages/common/components/modal/ModalBody'

import { useSearchQueryMetrics } from '../../hooks/useSearchQueryMetrics'
import HelpCenterStatsTable, {
    TableCellType,
} from '../HelpCenterStatsTable/HelpCenterStatsTable'

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
    articlesCount: number
    helpCenterDomain: string
}

const SearchQueryModal = ({
    onClose,
    statsFilters,
    timezone,
    searchQuery,
    articlesCount,
    helpCenterDomain,
}: SearchQueryModalProps) => {
    const [currentPage, setCurrentPage] = useState(1)
    const onPageChange = (page: number) => {
        if (currentPage !== page) {
            setCurrentPage(page)
        }
    }

    const { isLoading, data } = useSearchQueryMetrics({
        statsFilters,
        timezone,
        searchQuery,
        helpCenterDomain,
    })

    const count = Math.ceil(articlesCount / ITEMS_PER_PAGE)

    return (
        <>
            <ModalHeader toggle={onClose}>{searchQuery}</ModalHeader>
            <ModalBody>
                <HelpCenterStatsTable
                    isLoading={isLoading}
                    currentPage={currentPage}
                    onPageChange={onPageChange}
                    count={count}
                    /*
                     * We use this number to show skeleton. Because most of the time we have only 1 page it's better to avoid "page jump" after loading
                     * and show only needed amount of lines.
                     */
                    pageSize={
                        articlesCount < ITEMS_PER_PAGE
                            ? articlesCount
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
