import React, { useMemo, useState } from 'react'

import { LiveCallQueueVoiceCall } from '@gorgias/helpdesk-queries'

import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import { LiveVoiceStatusFilterOption } from 'domains/reporting/pages/voice/components/LiveVoice/types'
import {
    filterLiveCallsByStatus,
    formatVoiceCallsData,
    liveVoiceCallTableColumns,
    orderLiveVoiceCallsByOngoingTime,
} from 'domains/reporting/pages/voice/components/LiveVoice/utils'
import { VoiceCallTableColumnName } from 'domains/reporting/pages/voice/components/VoiceCallTable/constants'
import VoiceCallTableContent from 'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallTableContent'
import { LIVE_VOICE_CALLS_TITLE } from 'domains/reporting/pages/voice/constants/liveVoice'
import useOrderBy from 'hooks/useOrderBy'
import { OrderDirection } from 'models/api/types'
import * as ToggleButton from 'pages/common/components/ToggleButton'

type Props = {
    voiceCalls: LiveCallQueueVoiceCall[]
    isLoading: boolean
}

export default function LiveVoiceCallTable({ voiceCalls, isLoading }: Props) {
    const [statusFilter, setStatusFilter] = useState(
        LiveVoiceStatusFilterOption.ALL,
    )
    const { orderBy, orderDirection, toggleOrderBy } =
        useOrderBy<VoiceCallTableColumnName>(
            VoiceCallTableColumnName.OngoingTime,
            OrderDirection.Asc,
        )

    const displayedVoiceCalls = useMemo(() => {
        const filteredVoiceCalls = filterLiveCallsByStatus(
            voiceCalls,
            statusFilter,
        )
        const orderedVoiceCalls = orderLiveVoiceCallsByOngoingTime(
            filteredVoiceCalls,
            orderDirection,
        )
        const formattedVoiceCalls = formatVoiceCallsData(orderedVoiceCalls)

        return formattedVoiceCalls
    }, [voiceCalls, statusFilter, orderDirection])

    const handleStatusFilterChange = (status: LiveVoiceStatusFilterOption) => {
        setStatusFilter(status)
    }

    const handleTableColumnClick = (column: VoiceCallTableColumnName) => {
        if (column !== VoiceCallTableColumnName.OngoingTime) {
            return
        }

        toggleOrderBy(column)
    }

    return (
        <DashboardSection>
            <DashboardGridCell>
                <ChartCard
                    title={LIVE_VOICE_CALLS_TITLE}
                    noPadding
                    titleExtra={
                        <ToggleButton.Wrapper
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
                        >
                            <ToggleButton.Option
                                value={LiveVoiceStatusFilterOption.ALL}
                            >
                                All calls
                            </ToggleButton.Option>
                            <ToggleButton.Option
                                value={LiveVoiceStatusFilterOption.IN_QUEUE}
                            >
                                In queue
                            </ToggleButton.Option>
                            <ToggleButton.Option
                                value={LiveVoiceStatusFilterOption.IN_PROGRESS}
                            >
                                In progress
                            </ToggleButton.Option>
                        </ToggleButton.Wrapper>
                    }
                >
                    <VoiceCallTableContent
                        data={displayedVoiceCalls}
                        isFetching={isLoading}
                        noDataTitle={noDataTitle[statusFilter]}
                        columns={liveVoiceCallTableColumns}
                        ongoingTimeColumnTitle={
                            statusFilter ===
                            LiveVoiceStatusFilterOption.IN_QUEUE
                                ? 'Wait time'
                                : undefined
                        }
                        orderBy={orderBy}
                        orderDirection={orderDirection}
                        onColumnClick={handleTableColumnClick}
                    />
                </ChartCard>
            </DashboardGridCell>
        </DashboardSection>
    )
}

const noDataTitle = {
    [LiveVoiceStatusFilterOption.ALL]: 'No live calls',
    [LiveVoiceStatusFilterOption.IN_QUEUE]: 'No calls in queue',
    [LiveVoiceStatusFilterOption.IN_PROGRESS]: 'No calls in progress',
}
