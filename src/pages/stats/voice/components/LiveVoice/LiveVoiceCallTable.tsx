import React, { useMemo, useState } from 'react'

import { LiveCallQueueVoiceCall } from '@gorgias/helpdesk-queries'

import useOrderBy from 'hooks/useOrderBy'
import { OrderDirection } from 'models/api/types'
import * as ToggleButton from 'pages/common/components/ToggleButton'
import ChartCard from 'pages/stats/common/components/ChartCard'
import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'

import { LIVE_VOICE_CALLS_TITLE } from '../../constants/liveVoice'
import { VoiceCallTableColumnName } from '../VoiceCallTable/constants'
import VoiceCallTableContent from '../VoiceCallTable/VoiceCallTableContent'
import { LiveVoiceStatusFilterOption } from './types'
import {
    filterLiveCallsByStatus,
    formatVoiceCallsData,
    liveVoiceCallTableColumns,
    orderLiveVoiceCallsByOngoingTime,
} from './utils'

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
