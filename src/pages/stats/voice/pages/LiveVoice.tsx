import React from 'react'
import StatsPage from 'pages/stats/StatsPage'
import LiveVoiceFilters from 'pages/stats/voice/components/LiveVoiceFilters'
import StatCurrentDate from 'pages/stats/common/components/StatCurrentDate'
import LiveVoiceAgentsList from 'pages/stats/voice/components/LiveVoiceAgentsList'

import css from './LiveVoice.less'

export default function LiveVoice() {
    return (
        <StatsPage title="Live Voice" titleExtra={<StatCurrentDate />}>
            <div className={css.wrapper}>
                <div>
                    <LiveVoiceFilters />
                </div>
                <div className={css.agentsSection}>
                    <LiveVoiceAgentsList />
                </div>
            </div>
        </StatsPage>
    )
}
