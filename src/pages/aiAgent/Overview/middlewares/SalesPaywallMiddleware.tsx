import React from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { useParams } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { SALES } from 'pages/aiAgent/constants'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import { getHasAutomate } from 'state/billing/selectors'

import css from './SalesPaywallMiddleware.less'

export const SalesPaywallMiddleware =
    (ChildComponent: React.ComponentType<any>) => (): React.ReactElement => {
        const { shopName } = useParams<{
            shopName: string
        }>()
        const flags = useFlags()
        const isSalesPageEnabled =
            flags[FeatureFlagKey.StandaloneAIAgentSalesPage]
        const hasAutomate = useAppSelector(getHasAutomate)

        const automatePaywallView = (
            <AiAgentPaywallView
                aiAgentPaywallFeature={AIAgentPaywallFeatures.Automate}
            />
        )

        const salesPaywallView = (
            <AiAgentPaywallView
                aiAgentPaywallFeature={AIAgentPaywallFeatures.SalesWaitlist}
            >
                <div data-candu-id="ai-agent-waitlist" />
            </AiAgentPaywallView>
        )

        if (!isSalesPageEnabled) {
            return (
                <AiAgentLayout shopName={shopName} title={SALES}>
                    <div className={css.wrapper}>
                        {hasAutomate ? salesPaywallView : automatePaywallView}
                    </div>
                </AiAgentLayout>
            )
        }

        return <ChildComponent />
    }
