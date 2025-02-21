import React, {useEffect, useState} from 'react'

import {StatsFilters} from 'models/stat/types'
import Pagination from 'pages/common/components/Pagination'
import {
    CALL_LIST_PAGE_SIZE,
    MAX_VOICE_CALLS_PAGE_NUMBER,
} from 'pages/stats/voice/constants/voiceOverview'
import {useVoiceCallCount} from 'pages/stats/voice/hooks/useVoiceCallCount'
import {useVoiceCallList} from 'pages/stats/voice/hooks/useVoiceCallList'
import {
    getVoiceSegmentFromFilter,
    VoiceCallFilterOptions,
} from 'pages/stats/voice/models/types'

import useVoiceCallTableOrdering from './useVoiceCallTableOrdering'
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

    const {onOrderChange, orderByColumnName, orderByDimension, orderDirection} =
        useVoiceCallTableOrdering()

    const {data, isFetching} = useVoiceCallList(
        statsFilters,
        userTimezone,
        currentPage,
        CALL_LIST_PAGE_SIZE,
        getVoiceSegmentFromFilter(filterOption),
        orderByDimension,
        orderDirection
    )
    const {totalPages} = useVoiceCallCount(
        statsFilters,
        userTimezone,
        getVoiceSegmentFromFilter(filterOption)
    )

    const handlePageChange = (nextPage: number) => {
        setCurrentPage(nextPage)
    }

    useEffect(() => {
        if (!isFetching && currentPage > totalPages) {
            handlePageChange(totalPages === 0 ? 1 : totalPages)
        }
    }, [currentPage, totalPages, isFetching])

    return (
        <>
            <VoiceCallTableContent
                data={data}
                isFetching={isFetching}
                orderBy={orderByColumnName}
                orderDirection={orderDirection}
                onColumnClick={onOrderChange}
            />
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
