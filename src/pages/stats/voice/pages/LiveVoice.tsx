import React from 'react'
import StatsPage from 'pages/stats/StatsPage'
import LiveVoiceFilters from 'pages/stats/voice/components/LiveVoice/LiveVoiceFilters'
import StatCurrentDate from 'pages/stats/common/components/StatCurrentDate'
import LiveVoiceAgentsSection from 'pages/stats/voice/components/LiveVoice/LiveVoiceAgentsSection'

import css from './LiveVoice.less'

export default function LiveVoice() {
    return (
        <StatsPage title="Live voice" titleExtra={<StatCurrentDate />}>
            <div className={css.wrapper}>
                <div>
                    <LiveVoiceFilters />
                </div>
                <div className={css.agentsSection}>
                    <LiveVoiceAgentsSection />
                </div>
            </div>
        </StatsPage>
    )
}
