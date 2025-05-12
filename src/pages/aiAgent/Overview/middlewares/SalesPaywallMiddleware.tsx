import React from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { useHistory, useParams } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useAtLeastOneStoreHasActiveTrialOnSpecificStores } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import { useModalManager } from 'hooks/useModalManager'
import AIAgentTrialSuccessModal, {
    MODAL_NAME as AI_TRIAL_MODAL_NAME,
} from 'pages/aiAgent/Activation/components/AIAgentTrialSuccessModal'
import { useActivateAiAgentTrial } from 'pages/aiAgent/Activation/hooks/useActivateAiAgentTrial'
import { useActivation } from 'pages/aiAgent/Activation/hooks/useActivation'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { SALES } from 'pages/aiAgent/constants'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import { AIButton } from 'pages/common/components/AIButton/AIButton'
import { getCurrentAutomatePlan, getHasAutomate } from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

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
        const currentAccount = useAppSelector(getCurrentAccountState)
        const { storeActivations } = useStoreActivations({
            pageName: window.location.pathname,
        })
        const history = useHistory()
        const currentStoreHasActiveTrial =
            useAtLeastOneStoreHasActiveTrialOnSpecificStores(storeActivations)
        const hasNewAutomatePlan = (currentAutomatePlan?.generation ?? 0) >= 6

        const accountDomain = currentAccount.get('domain')

        const onSuccess = () => {
            trialModal.openModal(AI_TRIAL_MODAL_NAME, false)
        }

        const { canStartTrial, routes, startTrial } = useActivateAiAgentTrial({
            accountDomain,
            storeActivations,
            onSuccess,
        })

        const isAiSalesBetaUser = !!flags[FeatureFlagKey.AiSalesAgentBeta]
        const isAiSalesAlphaDemoUser =
            !!flags[FeatureFlagKey.AiSalesAgentBypassPlanCheck]

        const showUpgradePaywall =
            isAiSalesBetaUser &&
            !hasNewAutomatePlan &&
            !currentStoreHasActiveTrial
        const showSalesSettings =
            (isAiSalesBetaUser && hasNewAutomatePlan) ||
            isAiSalesAlphaDemoUser ||
            currentStoreHasActiveTrial

        const trialModal = useModalManager(AI_TRIAL_MODAL_NAME, {
            autoDestroy: false,
        })

        if (!hasAutomate) {
            return (
                <PaywallWrapper>
                    <AiAgentPaywallView
                        aiAgentPaywallFeature={AIAgentPaywallFeatures.Automate}
                    />
                </PaywallWrapper>
            )
        }

        return (
            <>
                <PaywallWrapperComponent
                    showUpgradePaywall={showUpgradePaywall}
                    showEarlyAccessModal={showEarlyAccessModal}
                    canStartTrial={canStartTrial}
                    startTrial={startTrial}
                    earlyAccessModal={earlyAccessModal}
                    showSalesSettings={showSalesSettings}
                    ChildComponent={ChildComponent}
                />
                <AIAgentTrialSuccessModal
                    isOpen={trialModal.isOpen(AI_TRIAL_MODAL_NAME)}
                    onClick={() => {
                        history.push(routes.customerEngagement)
                        trialModal.closeModal(AI_TRIAL_MODAL_NAME)
                    }}
                    onClose={() => {
                        trialModal.closeModal(AI_TRIAL_MODAL_NAME)
                    }}
                />
            </>
        )
    }

const PaywallWrapperComponent = ({
    showUpgradePaywall,
    showEarlyAccessModal,
    canStartTrial,
    startTrial,
    earlyAccessModal,
    showSalesSettings,
    ChildComponent,
}: {
    showUpgradePaywall: boolean
    showEarlyAccessModal: () => void
    canStartTrial: boolean
    startTrial: () => void
    earlyAccessModal: React.ReactNode
    showSalesSettings: boolean
    ChildComponent: React.ComponentType<any>
}) => {
    const flags = useFlags()
    const isAiShoppingAssistantEnabled =
        !!flags[FeatureFlagKey.AiShoppingAssistantEnabled]

    if (isAiShoppingAssistantEnabled) {
        if (showUpgradePaywall) {
            return (
                <PaywallWrapper>
                    <AiAgentPaywallView
                        aiAgentPaywallFeature={AIAgentPaywallFeatures.Upgrade}
                    >
                        <div className={css.buttonsWrapper}>
                            <AIButton
                                intent="primary"
                                size="medium"
                                onClick={showEarlyAccessModal}
                            >
                                Upgrade Now
                            </AIButton>
                            {canStartTrial && (
                                <Button fillStyle="ghost" onClick={startTrial}>
                                    Start 14-Day Trial At No Additional Cost
                                </Button>
                            )}
                        </div>
                    </AiAgentPaywallView>
                    {earlyAccessModal}
                </PaywallWrapper>
            )
        }
    }

    if (showSalesSettings) {
        return <ChildComponent />
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
