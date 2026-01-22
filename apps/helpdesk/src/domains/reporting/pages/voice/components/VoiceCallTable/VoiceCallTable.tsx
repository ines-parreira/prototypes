import { useEffect, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { VoiceCallTableColumn } from 'domains/reporting/pages/voice/components/VoiceCallTable/constants'
import useVoiceCallTableOrdering from 'domains/reporting/pages/voice/components/VoiceCallTable/useVoiceCallTableOrdering'
import css from 'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallTable.less'
import VoiceCallTableContent from 'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallTableContent'
import {
    CALL_LIST_PAGE_SIZE,
    MAX_VOICE_CALLS_PAGE_NUMBER,
} from 'domains/reporting/pages/voice/constants/voiceOverview'
import { useVoiceCallCount } from 'domains/reporting/pages/voice/hooks/useVoiceCallCount'
import { useVoiceCallList } from 'domains/reporting/pages/voice/hooks/useVoiceCallList'
import type { VoiceCallFilterOptions } from 'domains/reporting/pages/voice/models/types'
import { VoiceCallFilterDirection } from 'domains/reporting/pages/voice/models/types'
import Pagination from 'pages/common/components/Pagination'

type VoiceCallTableProps = {
    statsFilters: StatsFilters
    userTimezone: string
    filterOption: VoiceCallFilterOptions
}

const columns = [
    VoiceCallTableColumn.Activity,
    VoiceCallTableColumn.Integration,
    VoiceCallTableColumn.Queue,
    VoiceCallTableColumn.Date,
    VoiceCallTableColumn.SlaStatus,
    VoiceCallTableColumn.State,
    VoiceCallTableColumn.Recording,
    VoiceCallTableColumn.Duration,
    VoiceCallTableColumn.WaitTime,
    VoiceCallTableColumn.Ticket,
]

export const VoiceCallTable = ({
    statsFilters,
    userTimezone,
    filterOption,
}: VoiceCallTableProps) => {
    const [currentPage, setCurrentPage] = useState(1)
    const isVoiceSLAEnabled = useFlag(FeatureFlagKey.VoiceSLA)

    const {
        onOrderChange,
        orderByColumnName,
        orderByDimension,
        orderDirection,
    } = useVoiceCallTableOrdering()

    const { data, isFetching } = useVoiceCallList(
        statsFilters,
        userTimezone,
        currentPage,
        CALL_LIST_PAGE_SIZE,
        getVoiceSegmentFromFilter(filterOption),
        orderByDimension,
        orderDirection,
        filterOption?.statuses,
    )

    // TODO(new-stats-api): when we fully migrate to V2, refactor to use total from useVoiceCallList
    const { totalPages } = useVoiceCallCount(
        statsFilters,
        userTimezone,
        getVoiceSegmentFromFilter(filterOption),
        undefined,
        filterOption?.statuses,
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
                columns={
                    isVoiceSLAEnabled
                        ? columns
                        : columns.filter(
                              (col) => col !== VoiceCallTableColumn.SlaStatus,
                          )
                }
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

const getVoiceSegmentFromFilter = (
    filter: VoiceCallFilterOptions,
): VoiceCallSegment | undefined => {
    switch (filter.direction) {
        case VoiceCallFilterDirection.All:
            return undefined
        case VoiceCallFilterDirection.Inbound:
            return VoiceCallSegment.inboundCalls
        case VoiceCallFilterDirection.Outbound:
            return VoiceCallSegment.outboundCalls
    }
}
