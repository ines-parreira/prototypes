import React from 'react'

import StatsPage from 'pages/stats/StatsPage'
import {VOICE_OVERVIEW_PAGE_TITLE} from 'pages/stats/voice/constants/voiceOverview'

function VoiceOverview() {
    return (
        <StatsPage title={VOICE_OVERVIEW_PAGE_TITLE} filters={<></>}>
            {' '}
        </StatsPage>
    )
}

export default VoiceOverview
