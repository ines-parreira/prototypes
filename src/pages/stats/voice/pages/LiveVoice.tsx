import React from 'react'
import {useListLiveCallQueueVoiceCalls} from '@gorgias/api-queries'
import StatsPage from 'pages/stats/StatsPage'
import LiveVoiceFilters from 'pages/stats/voice/components/LiveVoice/LiveVoiceFilters'
import StatCurrentDate from 'pages/stats/common/components/StatCurrentDate'
import LiveVoiceAgentsSection from 'pages/stats/voice/components/LiveVoice/LiveVoiceAgentsSection'
import LiveVoiceCallTable from 'pages/stats/voice/components/LiveVoice/LiveVoiceCallTable'

import {LIVE_VOICE_PAGE_TITLE} from '../constants/liveVoice'
import LiveVoiceMetrics from '../components/LiveVoice/LiveVoiceMetrics'
import css from './LiveVoice.less'

export default function LiveVoice() {
    const {data: voiceCalls, isLoading} = useListLiveCallQueueVoiceCalls(
        {
            agent_ids: [],
            integration_ids: [],
        },
        {
            http: {
                paramsSerializer: {
                    indexes: null,
                },
            },
            query: {
                staleTime: Infinity,
                refetchOnMount: 'always',
                refetchOnWindowFocus: false,
            },
        }
    )

    return (
        <StatsPage
            title={LIVE_VOICE_PAGE_TITLE}
            titleExtra={<StatCurrentDate />}
        >
            <div className={css.wrapper}>
                <div>
                    <LiveVoiceFilters />
                    <LiveVoiceMetrics
                        isLoadingVoiceCalls={isLoading}
                        liveVoiceCalls={voiceCalls?.data?.data ?? []}
                    />
                    <LiveVoiceCallTable
                        isLoading={isLoading}
                        voiceCalls={voiceCalls?.data?.data ?? []}
                    />
                </div>
                <div className={css.agentsSection}>
                    <LiveVoiceAgentsSection />
                </div>
            </div>
        </StatsPage>
    )
}
