import { useFlags } from 'launchdarkly-react-client-sdk'
import { useParams } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { getHasAutomate } from 'state/billing/selectors'

import { AiAgentPaywallView } from './AiAgentPaywallView'
import { AiAgentLayout } from './components/AiAgentLayout/AiAgentLayout'
import { SalesSettings } from './components/SalesSettings/SalesSettings'
import { AI_AGENT, SALES } from './constants'
import { AIAgentPaywallFeatures } from './types'

import css from './AiAgentSales.less'

export const AiAgentSales = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()
    const flags = useFlags()
    const isStandaloneMenuEnabled = flags[FeatureFlagKey.ConvAiStandaloneMenu]
    const hasAutomate = useAppSelector(getHasAutomate)

    const paywallContent = hasAutomate ? (
        <AiAgentPaywallView
            aiAgentPaywallFeature={AIAgentPaywallFeatures.SalesWaitlist}
        >
            <div data-candu-id="ai-agent-waitlist" />
        </AiAgentPaywallView>
    ) : (
        <AiAgentPaywallView
            aiAgentPaywallFeature={AIAgentPaywallFeatures.Automate}
        />
    )

    const content = (
        <div className={css.sales}>
            {/* TODO: fix condition when it is defined */}
            {flags[FeatureFlagKey.StandaloneAIAgentSalesPage] ? (
                <SalesSettings />
            ) : (
                paywallContent
            )}
        </div>
    )

    return (
        <AiAgentLayout
            shopName={shopName}
            className={css.container}
            title={isStandaloneMenuEnabled ? SALES : AI_AGENT}
            hideViewAiAgentTicketsButton={isStandaloneMenuEnabled}
        >
            {content}
        </AiAgentLayout>
    )
}
