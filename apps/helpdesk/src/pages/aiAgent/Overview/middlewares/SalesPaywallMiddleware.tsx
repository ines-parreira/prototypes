import type React from 'react'
import { useCallback, useEffect, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useHistory, useParams } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import { AiAgentNotificationType } from 'automate/notifications/types'
import { useAiAgentUpgradePlan } from 'hooks/aiAgent/useAiAgentUpgradePlan'
import useAppSelector from 'hooks/useAppSelector'
import { useModalManager } from 'hooks/useModalManager'
import { AiAgentOnboardingState } from 'models/aiAgent/types'
import AIAgentTrialSuccessModal, {
    MODAL_NAME as AI_TRIAL_MODAL_NAME,
} from 'pages/aiAgent/Activation/components/AIAgentTrialSuccessModal'
import { useActivateAiAgentTrial } from 'pages/aiAgent/Activation/hooks/useActivateAiAgentTrial'
import { useActivation } from 'pages/aiAgent/Activation/hooks/useActivation'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { AiAgentPaywallView } from 'pages/aiAgent/AiAgentPaywallView'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS } from 'pages/aiAgent/components/ShoppingAssistant/constants/shoppingAssistant'
import type { AIAgentCTAOptions } from 'pages/aiAgent/components/ShoppingAssistant/hooks/useAiAgentPaywallCTA'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { SALES, WIZARD_UPDATE_QUERY_KEY } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import { WizardStepEnum } from 'pages/aiAgent/Onboarding_V2/types'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { TrialActivatedModal } from 'pages/aiAgent/trial/components/TrialActivatedModal/TrialActivatedModal'
import { UpgradePlanModal } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useNotifyAdmins } from 'pages/aiAgent/trial/hooks/useNotifyAdmins'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import {
    EXTERNAL_URLS,
    useTrialModalProps,
} from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import { hasAutomatePlanAboveGen6 } from 'pages/aiAgent/utils/trial.utils'
import LinkButton from 'pages/common/components/button/LinkButton'
import RequestTrialModal from 'pages/common/components/RequestTrialModal/RequestTrialModal'
import TrialFinishSetupModal from 'pages/common/components/TrialFinishSetupModal/TrialFinishSetupModal'
import TrialTryModal from 'pages/common/components/TrialTryModal/TrialTryModal'
import { getCurrentAutomatePlan, getHasAutomate } from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser, getRoleName } from 'state/currentUser/selectors'

import { TrialPaywallMiddleware } from './TrialPaywallMiddleware'

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

export type Props = {}

export const SalesPaywallMiddleware =
    (ChildComponent: React.ComponentType<any>) =>
    (__props: Props): React.ReactElement => {
        const hasAutomate = useAppSelector(getHasAutomate)
        const { storeActivations } = useStoreActivations({
            withChatIntegrationsStatus: true,
            withStoresKnowledgeStatus: true,
        })

        const trialMilestone = useSalesTrialRevampMilestone()
        const { shopName } = useParams<{ shopName?: string }>()
        const currentStore = shopName ? storeActivations[shopName] : undefined
        const currentStoreName = currentStore?.name ?? shopName

        const {
            canSeeTrialCTA,
            canSeeSubscribeNowCTA,
            hasCurrentStoreTrialStarted,
            hasCurrentStoreTrialExpired,
            hasAnyTrialActive,
            hasAnyTrialOptedIn,
            canBookDemo,
            hasCurrentStoreTrialOptedOut,
            canNotifyAdmin,
            isTrialingSubscription,
            isOnboarded,
            isLoading: isTrialAccessLoading,
            trialType,
            isAdminUser,
        } = useTrialAccess(currentStoreName)

        const currentStoreHasActiveTrial =
            (hasCurrentStoreTrialStarted && !hasCurrentStoreTrialExpired) ||
            (!currentStoreName && hasAnyTrialActive)
        const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
        const currentAccount = useAppSelector(getCurrentAccountState)
        const currentUser = useAppSelector(getCurrentUser)
        const userRole = useAppSelector(getRoleName)
        const history = useHistory()
        const hasNewAutomatePlan = hasAutomatePlanAboveGen6(currentAutomatePlan)

        const accountDomain = currentAccount.get('domain')

        const onSuccessOriginal = () => {
            trialModal.openModal(AI_TRIAL_MODAL_NAME, false)
        }

        const { upgradePlanAsync } = useUpgradePlan()

        const isShoppingAssistantTrialRevampEnabled = trialMilestone !== 'off'

        const { isDisabled: isNotifyAdminDisabled } = useNotifyAdmins(
            shopName,
            trialType,
        )

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

        const { storeConfiguration } = useAiAgentStoreConfigurationContext()
        const isOnUpdateOnboardingWizard =
            storeConfiguration?.wizard?.completedDatetime === null
        const canStartOnboarding =
            (hasCurrentStoreTrialExpired ||
                isTrialingSubscription ||
                hasAutomatePlanAboveGen6(currentAutomatePlan)) &&
            !isOnboarded

        const aiAgentNavigation = useAiAgentNavigation({
            shopName: shopName ?? '',
        })

        const displayTrialButton = isShoppingAssistantTrialRevampEnabled
            ? canSeeTrialCTA
            : canStartTrialOriginal || canStartTrialFromFeatureFlag

        const {
            startTrialDeprecated: startRevampTrial,
            isLoading: isTrialRevampLoading,
            isTrialModalOpen,
            isSuccessModalOpen,
            closeTrialUpgradeModal,
            closeSuccessModal,
            isTrialRequestModalOpen,
            openTrialUpgradeModal,
            closeTrialRequestModal,
            openUpgradePlanModal,
            closeUpgradePlanModal,
            closeManageTrialModal,
            onDismissTrialUpgradeModal,
            isTrialFinishSetupModalOpen,
            closeTrialFinishSetupModal,
            openTrialRequestModal,
        } = useShoppingAssistantTrialFlow({
            accountDomain,
            storeActivations,
            trialType,
        })

        const onStartTrialClicked = () => {
            if (ishoppingAssistantTrialImprovement) {
                openTrialUpgradeModal()
            } else if (isShoppingAssistantTrialRevampEnabled) {
                if (hasAnyTrialOptedIn) {
                    startRevampTrial()
                } else {
                    openTrialUpgradeModal()
                }
            } else {
                startTrialOriginal()
            }
        }

        const {
            onboardingNotificationState,
            handleOnSave,
            handleOnSendOrCancelNotification,
            handleOnPerformActionPostReceivedNotification,
        } = useAiAgentOnboardingNotification({ shopName: shopName })

        const handleOnFinishSetupNotification = useCallback(async () => {
            const isFinishedSetupNotificationAlreadyReceived =
                !!onboardingNotificationState?.finishAiAgentSetupNotificationReceivedDatetime

            if (!isFinishedSetupNotificationAlreadyReceived) {
                handleOnSendOrCancelNotification({
                    aiAgentNotificationType:
                        AiAgentNotificationType.FinishAiAgentSetup,
                })
            }

            if (isOnUpdateOnboardingWizard) return

            handleOnSendOrCancelNotification({
                aiAgentNotificationType:
                    AiAgentNotificationType.StartAiAgentSetup,
                isCancel: true,
            })

            await handleOnSave({
                onboardingState: AiAgentOnboardingState.StartedSetup,
            })

            handleOnPerformActionPostReceivedNotification(
                AiAgentNotificationType.StartAiAgentSetup,
            )
        }, [
            handleOnSave,
            handleOnSendOrCancelNotification,
            handleOnPerformActionPostReceivedNotification,
            isOnUpdateOnboardingWizard,
            onboardingNotificationState?.finishAiAgentSetupNotificationReceivedDatetime,
        ])

        const onOnboardingWizardClick = useCallback(() => {
            if (isAdminUser) {
                void handleOnFinishSetupNotification()
            }

            logEvent(SegmentEvent.AiAgentWelcomePageCtaClicked, {
                version: 'Dynamic',
                store: shopName,
            })

            const path = aiAgentNavigation.routes.onboardingWizardStep(
                WizardStepEnum.TONE_OF_VOICE,
            )

            history.push({
                pathname: path,
                search: isOnUpdateOnboardingWizard
                    ? `?${WIZARD_UPDATE_QUERY_KEY}=true`
                    : '',
            })
        }, [
            aiAgentNavigation.routes,
            handleOnFinishSetupNotification,
            history,
            isAdminUser,
            isOnUpdateOnboardingWizard,
            shopName,
        ])

        const { earlyAccessModal, showEarlyAccessModal } = useActivation({
            autoDisplayEarlyAccessDisabled:
                currentStoreHasActiveTrial ||
                isLoading ||
                displayTrialButton ||
                canStartTrialFromFeatureFlag,
        })
        const { data: upgradePlanData, isLoading: upgradePlanDataLoading } =
            useAiAgentUpgradePlan()
        const displayNotifyAdminButton =
            canNotifyAdmin &&
            !displayTrialButton &&
            !hasCurrentStoreTrialStarted &&
            !hasCurrentStoreTrialOptedOut &&
            (!upgradePlanData || !isAdminUser) && // Show only if no plan AND user is not admin
            !upgradePlanDataLoading

        const eventData = {
            accountId: currentAccount.get('id'),
            userId: currentUser.get('id'),
            userRole: userRole || '',
            type: 'sales-paywall',
            storeName: shopName ?? '',
        }

        const isAiSalesAlphaDemoUser = useFlag(
            FeatureFlagKey.AiSalesAgentBypassPlanCheck,
        )

        const ishoppingAssistantTrialImprovement = useFlag(
            FeatureFlagKey.ShoppingAssistantTrialImprovement,
        )

        const isAbTestingEnabled = useFlag(
            FeatureFlagKey.AiShoppingAssistantAbTesting,
            false,
        )

        const showUpgradePaywall =
            !hasNewAutomatePlan &&
            !currentStoreHasActiveTrial &&
            !isAiSalesAlphaDemoUser &&
            !isAbTestingEnabled

        const showSalesSettings =
            hasNewAutomatePlan ||
            isAiSalesAlphaDemoUser ||
            currentStoreHasActiveTrial ||
            isAbTestingEnabled

        const trialModal = useModalManager(AI_TRIAL_MODAL_NAME, {
            autoDestroy: false,
        })

        const trialModalProps = useTrialModalProps({ storeName: shopName })

        const onUpgradeClick = useCallback(async () => {
            logEvent(SegmentEvent.PricingModalClicked, {
                type: 'upgraded',
                trialType: TrialType.ShoppingAssistant,
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
                    openUpgradePlanModal(false)
                }
            } else {
                showEarlyAccessModal()
            }
        }

        if (
            !hasAutomate &&
            !isTrialAccessLoading &&
            ((shopName === undefined && !hasAnyTrialActive) ||
                (shopName !== undefined &&
                    (!hasCurrentStoreTrialStarted ||
                        hasCurrentStoreTrialExpired)))
        ) {
            return (
                <PaywallWrapper>
                    <TrialPaywallMiddleware shopName={shopName} />
                </PaywallWrapper>
            )
        }

        return (
            <>
                <PaywallWrapperComponent
                    showUpgradePaywall={showUpgradePaywall}
                    showEarlyAccessModal={onUpgradePlanClicked}
                    displayUpgradeButton={!!upgradePlanData && isAdminUser}
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
                    canSeeTrial={canSeeTrialCTA}
                    isAdminUser={isAdminUser}
                    canSeeSubscribeNow={canSeeSubscribeNowCTA}
                    hasCurrentStoreTrialOptedOut={hasCurrentStoreTrialOptedOut}
                    isTrialAccessLoading={isTrialAccessLoading!}
                    canNotifyAdmin={displayNotifyAdminButton}
                    isNotifyAdminDisabled={isNotifyAdminDisabled}
                    canStartOnboarding={canStartOnboarding}
                    isOnUpdateOnboardingWizard={isOnUpdateOnboardingWizard}
                    onNotifyAdminClick={openTrialRequestModal}
                    onOnboardingWizardClick={onOnboardingWizardClick}
                />
                {/* TODO: [AIFLY-547] remove previous upgrade plan modal */}
                {!ishoppingAssistantTrialImprovement && isTrialModalOpen && (
                    <UpgradePlanModal
                        {...trialModalProps.trialUpgradePlanModal}
                        onClose={closeTrialUpgradeModal}
                        onConfirm={startRevampTrial}
                        onDismiss={onDismissTrialUpgradeModal}
                        isLoading={isTrialRevampLoading}
                        isTrial
                    />
                )}

                {ishoppingAssistantTrialImprovement && (
                    <>
                        <TrialTryModal
                            {...trialModalProps.newTrialUpgradePlanModal}
                            isOpen={isTrialModalOpen}
                        />
                        <RequestTrialModal
                            {...trialModalProps.trialRequestModal}
                            isOpen={isTrialRequestModalOpen}
                            onClose={closeTrialRequestModal}
                        />
                        <TrialFinishSetupModal
                            {...trialModalProps.trialFinishSetupModal}
                            isOpen={isTrialFinishSetupModalOpen}
                            onClose={closeTrialFinishSetupModal}
                        />
                    </>
                )}

                {isSuccessModalOpen && (
                    <TrialActivatedModal
                        {...trialModalProps.trialActivatedModal}
                        onConfirm={closeSuccessModal}
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
    showSalesSettings,
    ChildComponent,
    eventData,
    canBookDemo,
    canSeeTrial,
    isAdminUser,
    canSeeSubscribeNow,
    hasCurrentStoreTrialOptedOut,
    isTrialAccessLoading,
    canNotifyAdmin,
    isNotifyAdminDisabled,
    canStartOnboarding,
    isOnUpdateOnboardingWizard,
    onNotifyAdminClick,
    onOnboardingWizardClick,
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
    canSeeTrial: boolean
    isAdminUser: boolean
    canSeeSubscribeNow: boolean
    hasCurrentStoreTrialOptedOut: boolean
    isTrialAccessLoading: boolean
    canNotifyAdmin: boolean
    isNotifyAdminDisabled: boolean
    canStartOnboarding: boolean
    isOnUpdateOnboardingWizard: boolean
    onNotifyAdminClick: () => void
    onOnboardingWizardClick: () => void
}) => {
    const isAiShoppingAssistantEnabled = useFlag(
        FeatureFlagKey.AiShoppingAssistantEnabled,
    )

    const queryParams = new URLSearchParams(location.search)

    const isFromEmailOrNotification =
        queryParams.get('from') === 'email' ||
        queryParams.get('from') === 'notification'

    const shouldStartTrial =
        !isTrialAccessLoading &&
        isAiShoppingAssistantEnabled &&
        showUpgradePaywall &&
        displayTrialButton &&
        !canBookDemo &&
        !hasCurrentStoreTrialOptedOut &&
        isFromEmailOrNotification

    useEffect(() => {
        if (
            isAiShoppingAssistantEnabled &&
            showUpgradePaywall &&
            displayTrialButton
        ) {
            logEvent(SegmentEvent.AiAgentShoppingAssistantTrialCtaDisplayed, {
                ...eventData,
            })

            logEvent(SegmentEvent.TrialLinkPaywallViewed, {
                trialType: TrialType.ShoppingAssistant,
            })
        }
    }, [
        displayTrialButton,
        isAiShoppingAssistantEnabled,
        showUpgradePaywall,
        eventData,
    ])

    useEffect(() => {
        if (shouldStartTrial) {
            startTrial()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldStartTrial])

    const SetupAIAgentAction = useMemo(
        (): AIAgentCTAOptions => ({
            label: isOnUpdateOnboardingWizard
                ? 'Continue Setup'
                : 'Set Up AI Agent',
            'data-candu-id': 'ai-agent-welcome-page',
            onClick: onOnboardingWizardClick,
        }),
        [onOnboardingWizardClick, isOnUpdateOnboardingWizard],
    )

    const SubscribeNowAction = useMemo(
        (): AIAgentCTAOptions => ({
            label: 'Upgrade Now',
            onClick: showEarlyAccessModal,
        }),
        [showEarlyAccessModal],
    )

    const TryTrialAction = useMemo(
        (): AIAgentCTAOptions => ({
            label: `Try for ${SHOPPING_ASSISTANT_TRIAL_DURATION_DAYS} days`,
            onClick: startTrial,
        }),
        [startTrial],
    )

    const NotifyAdminAction = useMemo(
        (): AIAgentCTAOptions => ({
            label: isNotifyAdminDisabled ? 'Admin notified' : 'Notify admin',
            leadingIcon: 'notifications_none',
            isDisabled: isNotifyAdminDisabled,
            onClick: onNotifyAdminClick,
        }),
        [isNotifyAdminDisabled, onNotifyAdminClick],
    )

    const LearnMoreAction = useMemo(
        (): AIAgentCTAOptions => ({
            label: 'Learn more',
            href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_LEARN_MORE,
        }),
        [],
    )

    const BookDemoAction = useMemo(
        (): AIAgentCTAOptions => ({
            label: 'Book a demo',
            onClick: () => {
                window.open(
                    EXTERNAL_URLS.BOOK_DEMO_SHOPPING_ASSISTANT,
                    '_blank',
                )
            },
        }),
        [],
    )

    if (isAiShoppingAssistantEnabled && showUpgradePaywall) {
        const actionsOrderedByPriority: (AIAgentCTAOptions | null)[] = []

        // If onboarding is possible, anyone can start it and that's the only option we allow
        if (canStartOnboarding) {
            actionsOrderedByPriority.push(SetupAIAgentAction)
        } else if (!isAdminUser) {
            // If the non-admin user cannot notify an admin, show nothing
            if (!canNotifyAdmin) {
                return null
            }

            actionsOrderedByPriority.push(
                NotifyAdminAction,
                canBookDemo ? BookDemoAction : LearnMoreAction,
                canBookDemo ? LearnMoreAction : null,
            )
        } else {
            // Only admins can self serve, but not all merchants can
            const selfService = canSeeSubscribeNow
                ? SubscribeNowAction
                : canSeeTrial
                  ? TryTrialAction
                  : null

            // Not all merchants can book demos
            const bookADemo = canBookDemo ? BookDemoAction : null

            // Learn more doesn't always have enough space, so it is only shown
            // if the user can't both self serve and book a demo
            const learnMore =
                (canSeeSubscribeNow || canSeeTrial) && canBookDemo
                    ? null
                    : LearnMoreAction

            // "Start AI Agent only" button should NOT appear on Shopping Assistant paywall
            // It should only appear on the AI Agent paywall (handled by useAiAgentPaywallCTA)
            actionsOrderedByPriority.push(selfService, bookADemo, learnMore)
        }

        // Actions are ordered but can be null, filter the nulls out
        const filteredActions: AIAgentCTAOptions[] =
            actionsOrderedByPriority.filter(Boolean) as AIAgentCTAOptions[]

        return (
            <PaywallWrapper>
                <AiAgentPaywallView
                    aiAgentPaywallFeature={AIAgentPaywallFeatures.Upgrade}
                >
                    <>
                        <div className={css.ctaButtons}>
                            <>
                                {filteredActions[0].href === undefined ? (
                                    <Button
                                        className={
                                            filteredActions[0].isDisabled
                                                ? ''
                                                : css.primaryButton
                                        }
                                        intent="primary"
                                        size="medium"
                                        onClick={filteredActions[0].onClick}
                                        leadingIcon={
                                            filteredActions[0].leadingIcon
                                        }
                                        isDisabled={
                                            filteredActions[0].isDisabled
                                        }
                                    >
                                        {filteredActions[0].label}
                                    </Button>
                                ) : (
                                    // Edge case - LearnMore as primary needs href
                                    // Button doesn't support href
                                    // LinkButton doesn't support leadingIcon
                                    <LinkButton
                                        className={css.primaryButton}
                                        intent="primary"
                                        size="medium"
                                        onClick={filteredActions[0].onClick}
                                        href={filteredActions[0].href}
                                    >
                                        {filteredActions[0].label}
                                    </LinkButton>
                                )}
                                <div
                                    data-candu-id={
                                        filteredActions[0]['data-candu-id']
                                    }
                                />
                            </>
                            {filteredActions[1] ? (
                                <LinkButton
                                    className={css.secondaryButton}
                                    fillStyle="ghost"
                                    onClick={filteredActions[1].onClick}
                                    href={filteredActions[1].href}
                                    isDisabled={filteredActions[1].isDisabled}
                                >
                                    {filteredActions[1].label}
                                </LinkButton>
                            ) : null}
                        </div>
                        {filteredActions[2] ? (
                            <div className={css.tertiaryButton}>
                                <div className={css.tertiaryContainer}>
                                    <LinkButton
                                        className={css.tertiaryContainerButton}
                                        fillStyle="ghost"
                                        intent="secondary"
                                        size="medium"
                                        href={filteredActions[2].href}
                                        onClick={filteredActions[2].onClick}
                                        isDisabled={
                                            filteredActions[2].isDisabled
                                        }
                                    >
                                        <span
                                            className={css.tertiaryButtonText}
                                        >
                                            {filteredActions[2].label}
                                        </span>
                                    </LinkButton>
                                </div>
                            </div>
                        ) : null}
                    </>
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
