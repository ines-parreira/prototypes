import React from 'react'
import StatsPage from 'pages/stats/StatsPage'
import LiveVoiceFilters from 'pages/stats/voice/components/LiveVoiceFilters'
import DashboardSection from 'pages/stats/DashboardSection'
import StatCurrentDate from 'pages/stats/common/components/StatCurrentDate'

import css from './LiveVoice.less'

export default function LiveVoice() {
    return (
        <StatsPage title="Live Voice" titleExtra={<StatCurrentDate />}>
            <div className={css.wrapper}>
                <div>
                    <LiveVoiceFilters />
                </div>
                <DashboardSection title="Agents" className={css.agentsSection}>
                    Agents list
                </DashboardSection>
            </div>
        </StatsPage>
    )
}
