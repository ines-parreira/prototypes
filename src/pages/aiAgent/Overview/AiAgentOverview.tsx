import { useEffect } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import modalImage from 'assets/img/ai-agent/ai_agent_onboarding_thankyou.png'
import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import { useActivation } from 'pages/aiAgent//Activation/hooks/useActivation'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import ThankYouModal from 'pages/aiAgent/Onboarding/components/ThankYouModal/ThankYouModal'
import { KpiSection } from 'pages/aiAgent/Overview/components/KpiSection/KpiSection'
import { ResourcesSection } from 'pages/aiAgent/Overview/components/ResourcesSection/ResourcesSection'
import { Separator } from 'pages/aiAgent/Overview/components/Separator/Separator'
import { Title } from 'pages/aiAgent/Overview/components/Title/Title'
import { useHasNoOnboardedStores } from 'pages/aiAgent/Overview/hooks/useHasNoOnboardedStores'
import { useThankYouModal } from 'pages/aiAgent/Overview/hooks/useThankYouModal'
import { AiAgentOverviewLayout } from 'pages/aiAgent/Overview/layout/AiAgentOverviewLayout'
import { TrialActivatedModal } from 'pages/aiAgent/trial/components/TrialActivatedModal/TrialActivatedModal'
import { TrialAlertBanner } from 'pages/aiAgent/trial/components/TrialAlertBanner/TrialAlertBanner'
import { UpgradePlanModal } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'

import { PendingTasksSectionConnected } from './components/PendingTasksSection/PendingTasksSectionConnected'

export const AiAgentOverview = () => {
    const currentUser = useAppSelector(getCurrentUser)
    const currentAccount = useAppSelector(getCurrentAccountState)

    const hasResourceSection =
        useFlags()[FeatureFlagKey.StandaloneConvAiOverviewPageResourceSection]

    const {
        activationButton,
        activationModal,
        earlyAccessModal,
        isOnNewPlan,
        showEarlyAccessModal,
        showActivationModal,
    } = useActivation({
        autoDisplayEarlyAccessDisabled: true,
    })

    useEffectOnce(() => {
        logEvent(SegmentEvent.AiAgentOverviewPageView)
    })

    const accountDomain = currentAccount.get('domain')

    const { isOpen, isLoading, handleModalAction, modalContent } =
        useThankYouModal()

    const { canSeeTrialCTA, canBookDemo, hasActiveTrial } =
        useShoppingAssistantTrialAccess()

    const { storeActivations } = useStoreActivations()

    const {
        startTrial,
        isLoading: isTrialRevampLoading,
        isTrialModalOpen: isTrialUpgradeModalOpen,
        isSuccessModalOpen,
        closeTrialUpgradeModal,
        closeSuccessModal,
        onConfirmTrial,
        onDismissTrialUpgradeModal,
    } = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
    })

    useEffect(() => {
        if ((canSeeTrialCTA || canBookDemo) && !hasActiveTrial) {
            logEvent(SegmentEvent.TrialBannerOverviewViewed, {
                type: canBookDemo ? 'Demo' : 'Trial',
            })
        }
    }, [canSeeTrialCTA, canBookDemo, hasActiveTrial])

    const onConfirmModal = () => handleModalAction('confirm')
    const onCloseModal = () => handleModalAction('close')

    const trialModalProps = useTrialModalProps({ onConfirmTrial })

    const hasNoOnboardedStores = useHasNoOnboardedStores()

    return (
        <AiAgentOverviewLayout>
            <Title
                firstName={currentUser.get('firstname')}
                activationButton={
                    hasNoOnboardedStores ? null : activationButton
                }
            />
            {(canSeeTrialCTA || canBookDemo) && !hasActiveTrial && (
                <TrialAlertBanner {...trialModalProps.trialAlertBanner} />
            )}

            {isTrialUpgradeModalOpen && (
                <UpgradePlanModal
                    {...trialModalProps.trialUpgradePlanModal}
                    onClose={closeTrialUpgradeModal}
                    onConfirm={startTrial}
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

            <KpiSection
                isOnNewPlan={isOnNewPlan}
                showActivationModal={showActivationModal}
                showEarlyAccessModal={showEarlyAccessModal}
            />
            <PendingTasksSectionConnected />
            {hasResourceSection && (
                <>
                    <Separator />
                    <ResourcesSection />
                </>
            )}
            <ThankYouModal
                isOpen={isOpen}
                title={modalContent.title}
                description={modalContent.description}
                image={<img src={modalImage} alt="Thank you" />}
                actionLabel={modalContent.actionLabel}
                closeLabel={modalContent.closeLabel}
                onClick={onConfirmModal}
                onClose={onCloseModal}
                isLoading={isLoading}
                isActionLoading={modalContent.actionLoading}
            />
            {activationModal}
            {earlyAccessModal}
        </AiAgentOverviewLayout>
    )
}
