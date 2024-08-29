import React from 'react'
import StatsPage from 'pages/stats/StatsPage'
import LiveVoiceFilters from 'pages/stats/voice/components/LiveVoice/LiveVoiceFilters'
import StatCurrentDate from 'pages/stats/common/components/StatCurrentDate'
import LiveVoiceAgentsSection from 'pages/stats/voice/components/LiveVoice/LiveVoiceAgentsSection'
import LiveVoiceCallTable from 'pages/stats/voice/components/LiveVoice/LiveVoiceCallTable'

import {LIVE_VOICE_PAGE_TITLE} from '../constants/liveVoice'
import css from './LiveVoice.less'

export default function LiveVoice() {
    return (
        <StatsPage
            title={LIVE_VOICE_PAGE_TITLE}
            titleExtra={<StatCurrentDate />}
        >
            <div className={css.wrapper}>
                <div>
                    <LiveVoiceFilters />
                    <LiveVoiceCallTable />
                </div>
                <div className={css.agentsSection}>
                    <LiveVoiceAgentsSection />
                </div>
            </div>
        </StatsPage>
    )
}
