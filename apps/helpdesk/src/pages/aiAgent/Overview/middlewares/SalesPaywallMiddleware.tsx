import React, { useCallback, useEffect } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { useHistory, useParams } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { atLeastOneStoreHasActiveTrialOnSpecificStores } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import useAppSelector from 'hooks/useAppSelector'
import { useModalManager } from 'hooks/useModalManager'
import { useEarlyAccessAutomatePlan } from 'models/billing/queries'
import AIAgentTrialSuccessModal, {
    MODAL_NAME as AI_TRIAL_MODAL_NAME,
} from 'pages/aiAgent/Activation/components/AIAgentTrialSuccessModal'
import { useActivateAiAgentTrial } from 'pages/aiAgent/Activation/hooks/useActivateAiAgentTrial'
import { useActivation } from 'pages/aiAgent/Activation/hooks/useActivation'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { SALES } from 'pages/aiAgent/constants'
import { TrialActivatedModal } from 'pages/aiAgent/trial/components/TrialActivatedModal/TrialActivatedModal'
import { TrialEndedModal } from 'pages/aiAgent/trial/components/TrialEndingModal/TrialEndingModal'
import { UpgradePlanModal } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import {
    EXTERNAL_URLS,
    useTrialModalProps,
} from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
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
        const { storeActivations } = useStoreActivations({
            withChatIntegrationsStatus: true,
            withStoresKnowledgeStatus: true,
        })

        const trialMilestone = useSalesTrialRevampMilestone()
        const { shopName } = useParams<{ shopName?: string }>()
        const currentStore = shopName ? storeActivations[shopName] : undefined
        const {
            canSeeTrialCTA,
            hasCurrentStoreTrialStarted,
            hasCurrentStoreTrialExpired,
            hasAnyTrialOptedIn,
            canBookDemo,
            hasCurrentStoreTrialOptedOut,
        } = useShoppingAssistantTrialAccess(currentStore?.name)

        const currentStoreHasActiveTrial =
            trialMilestone === 'milestone-1'
                ? hasCurrentStoreTrialStarted && !hasCurrentStoreTrialExpired
                : atLeastOneStoreHasActiveTrialOnSpecificStores(
                      storeActivations,
                  )

        const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
        const currentAccount = useAppSelector(getCurrentAccountState)
        const currentUser = useAppSelector(getCurrentUser)
        const userRole = useAppSelector(getRoleName)
        const history = useHistory()
        const hasNewAutomatePlan = (currentAutomatePlan?.generation ?? 0) >= 6

        const accountDomain = currentAccount.get('domain')

        const onSuccessOriginal = () => {
            trialModal.openModal(AI_TRIAL_MODAL_NAME, false)
        }

        const { upgradePlanAsync, isLoading: isUpgradePlanLoading } =
            useUpgradePlan()

        const isShoppingAssistantTrialRevampEnabled = trialMilestone !== 'off'

        const {
            canStartTrial: canStartTrialOriginal,
            routes,
            startTrial: startTrialOriginal,
            isLoading,
            canStartTrialFromFeatureFlag,
        } = useActivateAiAgentTrial({
            accountDomain,
            storeActivations,
            onSuccess: onSuccessOriginal,
        })

        const displayTrialButton = isShoppingAssistantTrialRevampEnabled
            ? canSeeTrialCTA
            : canStartTrialOriginal || canStartTrialFromFeatureFlag

        const {
            startTrial: startRevampTrial,
            isLoading: isTrialRevampLoading,
            isTrialModalOpen,
            isSuccessModalOpen,
            closeTrialUpgradeModal,
            closeSuccessModal,
            openTrialUpgradeModal,
            openUpgradePlanModal,
            closeUpgradePlanModal,
            closeManageTrialModal,
            isUpgradePlanModalOpen,
            onDismissTrialUpgradeModal,
            onDismissUpgradePlanModal,
        } = useShoppingAssistantTrialFlow({
            accountDomain,
            storeActivations,
        })

        const onStartTrialClicked = () => {
            if (isShoppingAssistantTrialRevampEnabled) {
                if (hasAnyTrialOptedIn) {
                    startRevampTrial()
                } else {
                    openTrialUpgradeModal()
                }
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
        const { data: earlyAccessPlan } = useEarlyAccessAutomatePlan()

        const eventData = {
            accountId: currentAccount.get('id'),
            userId: currentUser.get('id'),
            userRole: userRole || '',
            type: 'sales-paywall',
            storeName: shopName ?? '',
        }

        const isAiSalesAlphaDemoUser =
            !!flags[FeatureFlagKey.AiSalesAgentBypassPlanCheck]

        const showUpgradePaywall =
            !hasNewAutomatePlan &&
            !currentStoreHasActiveTrial &&
            !isAiSalesAlphaDemoUser

        const showSalesSettings =
            hasNewAutomatePlan ||
            isAiSalesAlphaDemoUser ||
            currentStoreHasActiveTrial

        const trialModal = useModalManager(AI_TRIAL_MODAL_NAME, {
            autoDestroy: false,
        })

        const trialModalProps = useTrialModalProps({ storeName: shopName })

        const onUpgradeClick = useCallback(async () => {
            logEvent(SegmentEvent.PricingModalClicked, {
                type: 'upgraded',
            })
            await upgradePlanAsync()
            closeManageTrialModal()
            closeUpgradePlanModal()
        }, [upgradePlanAsync, closeManageTrialModal, closeUpgradePlanModal])

        const onUpgradePlanClicked = () => {
            if (isShoppingAssistantTrialRevampEnabled) {
                if (hasAnyTrialOptedIn) {
                    onUpgradeClick()
                } else {
                    openUpgradePlanModal()
                }
            } else {
                showEarlyAccessModal()
            }
        }

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
                    showEarlyAccessModal={onUpgradePlanClicked}
                    displayUpgradeButton={!!earlyAccessPlan}
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
                    canBookDemo={canBookDemo}
                    hasCurrentStoreTrialOptedOut={hasCurrentStoreTrialOptedOut}
                />

                {isTrialModalOpen && (
                    <UpgradePlanModal
                        {...trialModalProps.trialUpgradePlanModal}
                        onClose={closeTrialUpgradeModal}
                        onConfirm={startRevampTrial}
                        onDismiss={onDismissTrialUpgradeModal}
                        isLoading={isTrialRevampLoading}
                        isTrial
                    />
                )}

                {isSuccessModalOpen && (
                    <TrialActivatedModal
                        {...trialModalProps.trialActivatedModal}
                        onConfirm={closeSuccessModal}
                    />
                )}

                {isUpgradePlanModalOpen && (
                    <UpgradePlanModal
                        {...trialModalProps.upgradePlanModal}
                        onClose={closeUpgradePlanModal}
                        onConfirm={onUpgradeClick}
                        onDismiss={onDismissUpgradePlanModal}
                        isLoading={isUpgradePlanLoading}
                    />
                )}

                {currentStore && (
                    <TrialEndedModal
                        storeConfiguration={currentStore.configuration}
                    />
                )}

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
    displayUpgradeButton = false,
    showSalesSettings,
    ChildComponent,
    eventData,
    canBookDemo,
    hasCurrentStoreTrialOptedOut,
}: {
    showUpgradePaywall: boolean
    showEarlyAccessModal: () => void
    displayTrialButton: boolean
    startTrial: () => void
    earlyAccessModal: React.ReactNode
    displayUpgradeButton: boolean
    showSalesSettings: boolean
    ChildComponent: React.ComponentType<any>
    eventData: Record<string, string>
    canBookDemo: boolean
    hasCurrentStoreTrialOptedOut: boolean
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

            logEvent(SegmentEvent.TrialLinkPaywallViewed)
        }
    }, [
        displayTrialButton,
        isAiShoppingAssistantEnabled,
        showUpgradePaywall,
        eventData,
    ])

    const renderSecondaryActionButton = () => {
        if (canBookDemo) {
            return (
                <Button
                    fillStyle="ghost"
                    onClick={() => {
                        window.open(EXTERNAL_URLS.BOOK_DEMO, '_blank')
                    }}
                    className={css.trialButton}
                >
                    Book a demo
                </Button>
            )
        }

        if (!displayTrialButton) {
            return null
        }

        if (hasCurrentStoreTrialOptedOut) {
            return (
                <Button
                    fillStyle="ghost"
                    onClick={() => {
                        window.open(
                            EXTERNAL_URLS.SHOPPING_ASSISTANT_INFO,
                            '_blank',
                        )
                    }}
                    className={css.trialButton}
                >
                    How shopping Assistants boosts sales
                </Button>
            )
        }

        return (
            <Button
                fillStyle="ghost"
                onClick={startTrial}
                className={css.trialButton}
            >
                Start 14-Day Trial At No Additional Cost
            </Button>
        )
    }

    if (isAiShoppingAssistantEnabled && showUpgradePaywall) {
        return (
            <PaywallWrapper>
                <AiAgentPaywallView
                    aiAgentPaywallFeature={AIAgentPaywallFeatures.Upgrade}
                >
                    <div className={css.buttonsWrapper}>
                        {displayUpgradeButton && (
                            <Button
                                size="medium"
                                onClick={showEarlyAccessModal}
                                className={css.upgradeButton}
                            >
                                Upgrade Now
                            </Button>
                        )}
                        {renderSecondaryActionButton()}
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
