import React, { useState } from 'react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import HelpCenterStatsTable, {
    TableCellType,
} from 'domains/reporting/pages/help-center/components/HelpCenterStatsTable/HelpCenterStatsTable'
import SearchQueryModal from 'domains/reporting/pages/help-center/components/SearchQueryModal/SearchQueryModal'
import { useSearchTermsMetrics } from 'domains/reporting/pages/help-center/hooks/useSearchTermsMetrics'
import Modal from 'pages/common/components/modal/Modal'

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
            title: 'Total # of articles clicked from the results returned',
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

type ModalStateType =
    | {
          isOpen: false
      }
    | {
          isOpen: true
          searchQuery: string
          articlesCount: number
      }

const modalIntiState: ModalStateType = {
    isOpen: false,
}

type Props = {
    helpCenterDomain: string
}

export const SearchTermsTable = ({ helpCenterDomain }: Props) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const [currentPage, setCurrentPage] = useState(1)

    const [modalState, setModalState] = useState<ModalStateType>(modalIntiState)
    const onModalOpen = (searchQuery: string, articleClickedCount: number) => {
        setModalState({
            isOpen: true,
            searchQuery,
            articlesCount: articleClickedCount,
        })
    }

    const { data, total, isLoading } = useSearchTermsMetrics({
        statsFilters: cleanStatsFilters,
        timezone: userTimezone,
        currentPage: currentPage,
        itemPerPage: ITEMS_PER_PAGE,
        onModalOpen,
    })

    const onPageChange = (page: number) => {
        if (currentPage !== page) {
            setCurrentPage(page)
        }
    }

    const count = Math.ceil(total / ITEMS_PER_PAGE)

    const onModalClose = () => {
        setModalState(modalIntiState)
    }

    return (
        <>
            <HelpCenterStatsTable
                onPageChange={onPageChange}
                isLoading={isLoading}
                currentPage={currentPage}
                count={count}
                pageSize={ITEMS_PER_PAGE}
                columns={columns}
                data={data}
            />
            <Modal
                isOpen={modalState.isOpen}
                onClose={onModalClose}
                size="huge"
            >
                {modalState.isOpen && (
                    <SearchQueryModal
                        timezone={userTimezone}
                        statsFilters={cleanStatsFilters}
                        searchQuery={modalState.searchQuery}
                        onClose={onModalClose}
                        helpCenterDomain={helpCenterDomain}
                        articlesCount={modalState.articlesCount}
                    />
                )}
            </Modal>
        </>
    )
}
