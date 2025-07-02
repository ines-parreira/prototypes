import React, { useEffect, useState } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { useHistory, useParams } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { atLeastOneStoreHasActiveTrialOnSpecificStores } from 'hooks/aiAgent/useCanUseAiSalesAgent'
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
import { UpgradePlanModal } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import { AIButton } from 'pages/common/components/AIButton/AIButton'
import { getCurrentAutomatePlan, getHasAutomate } from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser, getRoleName } from 'state/currentUser/selectors'

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
        const { storeActivations } = useStoreActivations()

        const currentStoreHasActiveTrial =
            atLeastOneStoreHasActiveTrialOnSpecificStores(storeActivations)

        const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
        const currentAccount = useAppSelector(getCurrentAccountState)
        const currentUser = useAppSelector(getCurrentUser)
        const userRole = useAppSelector(getRoleName)
        const history = useHistory()
        const hasNewAutomatePlan = (currentAutomatePlan?.generation ?? 0) >= 6

        const [isTrialModalRevampOpen, setIsTrialModalRevampOpen] =
            useState(false)

        const accountDomain = currentAccount.get('domain')

        const onSuccess = () => {
            trialModal.openModal(AI_TRIAL_MODAL_NAME, false)
        }

        const isShoppingAssistantTrialRevampEnabled = useFlag(
            FeatureFlagKey.ShoppingAssistantTrialRevamp,
            false,
        )

        const { canSeeTrialCTA } = useShoppingAssistantTrialAccess()

        const {
            canStartTrial: canStartTrialOriginal,
            routes,
            startTrial: startTrialOriginal,
            isLoading,
            canStartTrialFromFeatureFlag,
            shopName,
        } = useActivateAiAgentTrial({
            accountDomain,
            storeActivations,
            onSuccess,
        })

        const displayTrialButton = isShoppingAssistantTrialRevampEnabled
            ? canSeeTrialCTA
            : canStartTrialOriginal || canStartTrialFromFeatureFlag

        const onStartTrialClicked = () => {
            if (isShoppingAssistantTrialRevampEnabled) {
                setIsTrialModalRevampOpen(true)
            } else {
                startTrialOriginal()
            }
        }

        const { earlyAccessModal, showEarlyAccessModal } = useActivation({
            autoDisplayEarlyAccessDisabled:
                currentStoreHasActiveTrial ||
                isLoading ||
                displayTrialButton ||
                canStartTrialFromFeatureFlag,
        })

        const eventData = {
            accountId: currentAccount.get('id'),
            userId: currentUser.get('id'),
            userRole: userRole || '',
            type: 'sales-paywall',
            storeName: shopName || '',
        }

        const isAiSalesBetaUser = !!flags[FeatureFlagKey.AiSalesAgentBeta]
        const isAiSalesAlphaDemoUser =
            !!flags[FeatureFlagKey.AiSalesAgentBypassPlanCheck]

        const showUpgradePaywall =
            isAiSalesBetaUser &&
            !hasNewAutomatePlan &&
            !currentStoreHasActiveTrial &&
            !isAiSalesAlphaDemoUser
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
                {isTrialModalRevampOpen && (
                    <UpgradePlanModal
                        title="Try Shopping Assistant for 14 days at no additional cost"
                        onClose={() => {
                            setIsTrialModalRevampOpen(false)
                        }}
                        onConfirm={() => {
                            setIsTrialModalRevampOpen(false)
                        }}
                        currentPlan={{
                            title: 'Support Agent',
                            description:
                                'Provide best-in-class automated support',
                            price: '$450',
                            billingPeriod: 'month',
                            features: [
                                '2000 automated interactions',
                                'Deliver instant answers to repetitive questions and improve customer satisfaction',
                                'Automatically handle orders, returns, and subscriptions quickly, 24/7',
                            ],
                            buttonText: 'Keep current plan',
                        }}
                        newPlan={{
                            title: 'Support Agent and Shopping Assistant ',
                            description:
                                'Unlock full potential to drive more sales',
                            price: '$530',
                            billingPeriod: 'month after trial ends',
                            features: [
                                'Everything in Support Agent skills',
                                'Proactively engage with customers to guide discovery',
                                'Personalize recommendations with rich customer insights',
                                'Intelligent upsell using customer input, not guesswork',
                                'Offer discounts based on purchase intent',
                            ],
                            buttonText: 'Try for 14 days',
                            priceTooltipText:
                                'Once you upgrade, each support or sales interaction will cost $1 per resolution, plus a $X.XX helpdesk fee.',
                        }}
                    />
                )}
                <PaywallWrapperComponent
                    showUpgradePaywall={showUpgradePaywall}
                    showEarlyAccessModal={showEarlyAccessModal}
                    displayTrialButton={displayTrialButton}
                    startTrial={() => {
                        logEvent(
                            SegmentEvent.AiAgentShoppingAssistantStartTrialClicked,
                            {
                                ...eventData,
                            },
                        )
                        onStartTrialClicked()
                    }}
                    earlyAccessModal={earlyAccessModal}
                    showSalesSettings={showSalesSettings}
                    ChildComponent={ChildComponent}
                    eventData={eventData}
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
    displayTrialButton,
    startTrial,
    earlyAccessModal,
    showSalesSettings,
    ChildComponent,
    eventData,
}: {
    showUpgradePaywall: boolean
    showEarlyAccessModal: () => void
    displayTrialButton: boolean
    startTrial: () => void
    earlyAccessModal: React.ReactNode
    showSalesSettings: boolean
    ChildComponent: React.ComponentType<any>
    eventData: Record<string, string>
}) => {
    const flags = useFlags()
    const isAiShoppingAssistantEnabled =
        !!flags[FeatureFlagKey.AiShoppingAssistantEnabled]

    useEffect(() => {
        if (
            isAiShoppingAssistantEnabled &&
            showUpgradePaywall &&
            displayTrialButton
        ) {
            logEvent(SegmentEvent.AiAgentShoppingAssistantTrialCtaDisplayed, {
                ...eventData,
            })
        }
    }, [
        displayTrialButton,
        isAiShoppingAssistantEnabled,
        showUpgradePaywall,
        eventData,
    ])

    if (isAiShoppingAssistantEnabled && showUpgradePaywall) {
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
                        {displayTrialButton && (
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
