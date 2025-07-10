import React, { useCallback, useEffect } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { useHistory, useParams } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
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
import { TrialActivatedModal } from 'pages/aiAgent/trial/components/TrialActivatedModal/TrialActivatedModal'
import { UpgradePlanModal } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
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
        const { storeActivations } = useStoreActivations()

        const trialMilestone = useSalesTrialRevampMilestone()
        const currentStoreHasActiveTrial =
            trialMilestone === 'milestone-1'
                ? Object.values(storeActivations).some(
                      (store) => store.configuration.sales?.trial.startDatetime,
                  )
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

        const { upgradePlan, isLoading: isUpgradePlanLoading } =
            useUpgradePlan()

        const isShoppingAssistantTrialRevampEnabled = trialMilestone !== 'off'

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
                openTrialUpgradeModal()
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

        const onUpgradePlanClicked = () => {
            if (isShoppingAssistantTrialRevampEnabled) {
                openUpgradePlanModal()
            } else {
                showEarlyAccessModal()
            }
        }

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

        const trialModalProps = useTrialModalProps({})

        const onUpgradeClick = useCallback(() => {
            logEvent(SegmentEvent.PricingModalClicked, {
                type: 'upgraded',
            })
            upgradePlan()
            closeManageTrialModal()
            closeUpgradePlanModal()
        }, [upgradePlan, closeManageTrialModal, closeUpgradePlanModal])

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

                <PaywallWrapperComponent
                    showUpgradePaywall={showUpgradePaywall}
                    showEarlyAccessModal={onUpgradePlanClicked}
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

            logEvent(SegmentEvent.TrialLinkPaywallViewed)
        }
    }, [
        displayTrialButton,
        isAiShoppingAssistantEnabled,
        showUpgradePaywall,
        eventData,
    ])

    const trialMilestone = useSalesTrialRevampMilestone()

    if (isAiShoppingAssistantEnabled && showUpgradePaywall) {
        return (
            <PaywallWrapper>
                <AiAgentPaywallView
                    aiAgentPaywallFeature={AIAgentPaywallFeatures.Upgrade}
                >
                    <div className={css.buttonsWrapper}>
                        <Button
                            size="medium"
                            onClick={showEarlyAccessModal}
                            // TMP: Disable upgrade now for Milestone 1 while we're working on the Upgrade API
                            isDisabled={trialMilestone === 'milestone-1'}
                            className={css.upgradeButton}
                        >
                            Upgrade Now
                        </Button>
                        {displayTrialButton && (
                            <Button
                                fillStyle="ghost"
                                onClick={startTrial}
                                className={css.trialButton}
                            >
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
