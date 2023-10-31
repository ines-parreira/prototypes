import React from 'react'

import StatsPage from 'pages/stats/StatsPage'
import {VOICE_OVERVIEW_PAGE_TITLE} from 'pages/stats/voice/constants/voiceOverview'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import {AccountFeature} from 'state/currentAccount/types'

function VoiceOverview() {
    return (
        <StatsPage title={VOICE_OVERVIEW_PAGE_TITLE} filters={<></>}>
            {' '}
        </StatsPage>
    )
}

export default withFeaturePaywall(AccountFeature.PhoneNumber)(VoiceOverview)
