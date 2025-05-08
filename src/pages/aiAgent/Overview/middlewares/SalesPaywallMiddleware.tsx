import React from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { useParams } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { useActivation } from 'pages/aiAgent/Activation/hooks/useActivation'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { SALES } from 'pages/aiAgent/constants'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import { AIButton } from 'pages/common/components/AIButton/AIButton'
import { getCurrentAutomatePlan, getHasAutomate } from 'state/billing/selectors'

import css from './SalesPaywallMiddleware.less'

type PaywallWrapperProps = {
    children: React.ReactNode
}
const PaywallWrapper = ({ children }: PaywallWrapperProps) => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    return (
        <AiAgentLayout shopName={shopName} title={SALES} fullscreen>
            <div className={css.wrapper}>{children}</div>
        </AiAgentLayout>
    )
}

export const SalesPaywallMiddleware =
    (ChildComponent: React.ComponentType<any>) => (): React.ReactElement => {
        const flags = useFlags()
        const hasAutomate = useAppSelector(getHasAutomate)
        const { earlyAccessModal, showEarlyAccessModal } = useActivation(
            window.location.pathname,
        )

        const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
        const hasNewAutomatePlan = (currentAutomatePlan?.generation ?? 0) >= 6

        const isAiSalesBetaUser = !!flags[FeatureFlagKey.AiSalesAgentBeta]
        const isAiSalesAlphaDemoUser =
            !!flags[FeatureFlagKey.AiSalesAgentBypassPlanCheck]

        const showUpgradePaywall =
            isAiSalesBetaUser && !hasNewAutomatePlan && !isAiSalesAlphaDemoUser
        const showSalesSettings =
            (isAiSalesBetaUser && hasNewAutomatePlan) || isAiSalesAlphaDemoUser

        const isAiShoppingAssistantEnabled =
            !!flags[FeatureFlagKey.AiShoppingAssistantEnabled]

        if (!hasAutomate) {
            return (
                <PaywallWrapper>
                    <AiAgentPaywallView
                        aiAgentPaywallFeature={AIAgentPaywallFeatures.Automate}
                    />
                </PaywallWrapper>
            )
        }

        if (isAiShoppingAssistantEnabled) {
            if (showUpgradePaywall) {
                return (
                    <PaywallWrapper>
                        <AiAgentPaywallView
                            aiAgentPaywallFeature={
                                AIAgentPaywallFeatures.Upgrade
                            }
                        >
                            <AIButton
                                intent="primary"
                                size="medium"
                                onClick={showEarlyAccessModal}
                            >
                                Upgrade Now
                            </AIButton>
                        </AiAgentPaywallView>
                        {earlyAccessModal}
                    </PaywallWrapper>
                )
            }

            if (showSalesSettings) {
                return <ChildComponent />
            }
        }

        return (
            <PaywallWrapper>
                <AiAgentPaywallView
                    aiAgentPaywallFeature={AIAgentPaywallFeatures.SalesWaitlist}
                >
                    <div data-candu-id="ai-agent-waitlist" />
                </AiAgentPaywallView>
            </PaywallWrapper>
        )
    }
