import React, {useState} from 'react'
import {StatsFilters} from 'models/stat/types'
import {useVoiceCallList} from 'pages/stats/voice/hooks/useVoiceCallList'
import {useVoiceCallCount} from 'pages/stats/voice/hooks/useVoiceCallCount'
import {
    getVoiceSegmentFromFilter,
    VoiceCallFilterOptions,
} from 'pages/stats/voice/models/types'
import {
    CALL_LIST_PAGE_SIZE,
    MAX_VOICE_CALLS_PAGE_NUMBER,
} from 'pages/stats/voice/constants/voiceOverview'

import Pagination from 'pages/common/components/Pagination'
import css from './VoiceCallTable.less'
import VoiceCallTableContent from './VoiceCallTableContent'

type VoiceCallTableProps = {
    statsFilters: StatsFilters
    userTimezone: string
    filterOption?: VoiceCallFilterOptions
}

export const VoiceCallTable = ({
    statsFilters,
    userTimezone,
    filterOption,
}: VoiceCallTableProps) => {
    const [currentPage, setCurrentPage] = useState(1)
    const {data, isFetching} = useVoiceCallList(
        statsFilters,
        userTimezone,
        currentPage,
        CALL_LIST_PAGE_SIZE,
        getVoiceSegmentFromFilter(filterOption)
    )
    const {totalPages} = useVoiceCallCount(
        statsFilters,
        userTimezone,
        getVoiceSegmentFromFilter(filterOption)
    )

    const handlePageChange = (nextPage: number) => {
        setCurrentPage(nextPage)
    }

    return (
        <>
            <VoiceCallTableContent data={data} isFetching={isFetching} />
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    pageCount={
                        totalPages > MAX_VOICE_CALLS_PAGE_NUMBER
                            ? MAX_VOICE_CALLS_PAGE_NUMBER
                            : totalPages
                    }
                    onChange={handlePageChange}
                    className={css.pagination}
                />
            )}
        </>
    )
}
