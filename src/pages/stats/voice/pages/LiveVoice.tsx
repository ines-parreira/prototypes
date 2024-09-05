import React from 'react'
import {useListLiveCallQueueVoiceCalls} from '@gorgias/api-queries'
import StatsPage from 'pages/stats/StatsPage'
import LiveVoiceFilters from 'pages/stats/voice/components/LiveVoice/LiveVoiceFilters'
import LiveVoiceAgentsSection from 'pages/stats/voice/components/LiveVoice/LiveVoiceAgentsSection'
import LiveVoiceCallTable from 'pages/stats/voice/components/LiveVoice/LiveVoiceCallTable'
import useAppSelector from 'hooks/useAppSelector'
import {getCleanStatsFiltersWithLogicalOperatorsWithTimezone} from 'state/ui/stats/selectors'
import {FilterKey} from 'models/stat/types'

import {LIVE_VOICE_PAGE_TITLE} from '../constants/liveVoice'
import LiveVoiceMetrics from '../components/LiveVoice/LiveVoiceMetrics'
import css from './LiveVoice.less'

export default function LiveVoice() {
    const {cleanStatsFilters} = useAppSelector(
        getCleanStatsFiltersWithLogicalOperatorsWithTimezone
    )
    const {data: voiceCalls, isLoading} = useListLiveCallQueueVoiceCalls(
        {
            agent_ids: cleanStatsFilters?.[FilterKey.Agents]?.values,
            integration_ids:
                cleanStatsFilters?.[FilterKey.Integrations]?.values,
        },
        {
            http: {
                paramsSerializer: {
                    indexes: null,
                },
            },
            query: {
                refetchOnWindowFocus: false,
                select: (data) => data.data.data,
            },
        }
    )

    return (
        <StatsPage title={LIVE_VOICE_PAGE_TITLE}>
            <div className={css.wrapper}>
                <div className={css.content}>
                    <LiveVoiceFilters />
                    <LiveVoiceMetrics
                        isLoadingVoiceCalls={isLoading}
                        liveVoiceCalls={voiceCalls ?? []}
                        cleanStatsFilters={cleanStatsFilters}
                    />
                    <LiveVoiceCallTable
                        isLoading={isLoading}
                        voiceCalls={voiceCalls ?? []}
                    />
                </div>
                <div className={css.agentsSection}>
                    <LiveVoiceAgentsSection
                        cleanStatsFilters={cleanStatsFilters}
                    />
                </div>
            </div>
        </StatsPage>
    )
}
