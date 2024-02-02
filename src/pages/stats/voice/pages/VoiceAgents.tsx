import React from 'react'
import {PaywallConfig, paywallConfigs} from 'config/paywalls'
import StatsPage from 'pages/stats/StatsPage'
import withFeaturePaywall from 'pages/common/utils/withFeaturePaywall'
import {AccountFeature} from 'state/currentAccount/types'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import {VOICE_AGENTS_PAGE_TITLE} from 'pages/stats/voice/constants/voiceAgents'

function VoiceAgents() {
    return (
        <StatsPage title={VOICE_AGENTS_PAGE_TITLE} filters={<></>}>
            <AnalyticsFooter />
        </StatsPage>
    )
}

export default withFeaturePaywall(AccountFeature.PhoneNumber, undefined, {
    [AccountFeature.PhoneNumber]: {
        ...paywallConfigs[AccountFeature.PhoneNumber],
        pageHeader: VOICE_AGENTS_PAGE_TITLE,
    } as PaywallConfig,
})(VoiceAgents)
