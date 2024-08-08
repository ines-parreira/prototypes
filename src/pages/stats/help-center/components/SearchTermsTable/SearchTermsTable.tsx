import React, {useState} from 'react'
import Modal from 'pages/common/components/modal/Modal'
import ChartCard from 'pages/stats/ChartCard'
import {StatsFilters} from 'models/stat/types'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'
import HelpCenterStatsTable, {
    TableCellType,
} from '../HelpCenterStatsTable/HelpCenterStatsTable'
import {useSearchTermsMetrics} from '../../hooks/useSearchTermsMetrics'
import SearchQueryModal from '../SearchQueryModal/SearchQueryModal'

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

type SearchTermsTableProps = {
    statsFilters: StatsFilters
    timezone: string
    helpCenterDomain: string
}

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

const SearchTermsTable = ({
    statsFilters,
    timezone,
    helpCenterDomain,
}: SearchTermsTableProps) => {
    const [currentPage, setCurrentPage] = useState(1)

    const [modalState, setModalState] = useState<ModalStateType>(modalIntiState)
    const onModalOpen = (searchQuery: string, articleClickedCount: number) => {
        setModalState({
            isOpen: true,
            searchQuery,
            articlesCount: articleClickedCount,
        })
    }

    const {data, total, isLoading} = useSearchTermsMetrics({
        statsFilters,
        timezone,
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
        <ChartCard title="Search terms with results" noPadding>
            {!isLoading && data.length === 0 ? (
                <NoDataAvailable
                    title="No data available"
                    description="Try adjusting filters to get results."
                    style={{height: 448}}
                />
            ) : (
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
                                timezone={timezone}
                                statsFilters={statsFilters}
                                searchQuery={modalState.searchQuery}
                                onClose={onModalClose}
                                helpCenterDomain={helpCenterDomain}
                                articlesCount={modalState.articlesCount}
                            />
                        )}
                    </Modal>
                </>
            )}
        </ChartCard>
    )
}

export default SearchTermsTable
