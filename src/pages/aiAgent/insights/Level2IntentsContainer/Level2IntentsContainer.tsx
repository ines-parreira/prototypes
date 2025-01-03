import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {useParams} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import {AiAgentLayout} from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {AI_AGENT, OPTIMIZE} from 'pages/aiAgent/constants'
import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import BackLink from 'pages/common/components/BackLink'

export const Level2IntentsContainer = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()
    const {routes} = useAiAgentNavigation({shopName})

    const isStandaloneMenuEnabled =
        useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]

    return (
        <AiAgentLayout
            shopName={shopName}
            title={isStandaloneMenuEnabled ? OPTIMIZE : AI_AGENT}
        >
            <div>
                <BackLink path={routes.optimize} label="Back to Optimize" />
                <div>Level2IntentsContainer</div>
            </div>
        </AiAgentLayout>
    )
}
