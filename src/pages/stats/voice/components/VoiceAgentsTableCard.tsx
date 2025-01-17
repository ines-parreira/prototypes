import React from 'react'

import ChartCard from 'pages/stats/ChartCard'
import {VoiceAgentsTable} from 'pages/stats/voice/components/VoiceAgentsTable/VoiceAgentsTable'
import {VOICE_CALL_ACTIVITY_TITLE} from 'pages/stats/voice/constants/voiceAgents'

export function VoiceAgentsTableCard() {
    return (
        <ChartCard title={VOICE_CALL_ACTIVITY_TITLE} noPadding>
            <VoiceAgentsTable />
        </ChartCard>
    )
}
