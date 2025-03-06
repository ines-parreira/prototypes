import React from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { useParams } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'

import { AiAgentLayout } from './components/AiAgentLayout/AiAgentLayout'
import { SalesPaywall } from './components/SalesPaywall/SalesPaywall'
import { SalesSettings } from './components/SalesSettings/SalesSettings'
import { AI_AGENT } from './constants'

import css from './AiAgentSales.less'

export const AiAgentSales = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()
    const flags = useFlags()
    const isStandaloneMenuEnabled = flags[FeatureFlagKey.ConvAiStandaloneMenu]

    const content = (
        <div className={css.sales}>
            {/* TODO: fix condition when it is defined */}
            {flags[FeatureFlagKey.StandaloneAIAgentSalesPage] &&
                !flags[FeatureFlagKey.StandaloneAIAgentSalesPaywallPage] && (
                    <SalesSettings contentOnly={!isStandaloneMenuEnabled} />
                )}

            {flags[FeatureFlagKey.StandaloneAIAgentSalesPaywallPage] && (
                <SalesPaywall />
            )}
        </div>
    )

    return isStandaloneMenuEnabled ? (
        content
    ) : (
        <AiAgentLayout
            shopName={shopName}
            className={css.container}
            title={AI_AGENT}
        >
            {content}
        </AiAgentLayout>
    )
}
