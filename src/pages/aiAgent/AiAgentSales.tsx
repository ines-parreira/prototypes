import React from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'

import { SalesPaywall } from './components/SalesPaywall/SalesPaywall'
import { SalesSettings } from './components/SalesSettings/SalesSettings'

import css from './AiAgentSales.less'

export const AiAgentSales = () => {
    const flags = useFlags()

    return (
        <div className={css.sales}>
            {/* TODO: fix condition when it is defined */}
            {flags[FeatureFlagKey.StandaloneAIAgentSalesPage] &&
                !flags[FeatureFlagKey.StandaloneAIAgentSalesPaywallPage] && (
                    <SalesSettings />
                )}

            {flags[FeatureFlagKey.StandaloneAIAgentSalesPaywallPage] && (
                <SalesPaywall />
            )}
        </div>
    )
}
