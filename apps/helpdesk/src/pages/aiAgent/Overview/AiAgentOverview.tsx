import { useEffect } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { useParams } from 'react-router-dom'

import modalImage from 'assets/img/ai-agent/ai_agent_onboarding_thankyou.png'
import { logEvent, SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import { useActivation } from 'pages/aiAgent//Activation/hooks/useActivation'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import ThankYouModal from 'pages/aiAgent/Onboarding/components/ThankYouModal/ThankYouModal'
import { KpiSection } from 'pages/aiAgent/Overview/components/KpiSection/KpiSection'
import { ResourcesSection } from 'pages/aiAgent/Overview/components/ResourcesSection/ResourcesSection'
import { useThankYouModal } from 'pages/aiAgent/Overview/hooks/useThankYouModal'
import { AiAgentOverviewLayout } from 'pages/aiAgent/Overview/layout/AiAgentOverviewLayout'
import { TrialActivatedModal } from 'pages/aiAgent/trial/components/TrialActivatedModal/TrialActivatedModal'
import { TrialAlertBanner } from 'pages/aiAgent/trial/components/TrialAlertBanner/TrialAlertBanner'
import { UpgradePlanModal } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { useTrialAccess } from '../trial/hooks/useTrialAccess'
import { PendingTasksSectionConnected } from './components/PendingTasksSection/PendingTasksSectionConnected'

export const AiAgentOverview = () => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()

    const currentAccount = useAppSelector(getCurrentAccountState)

    const hasResourceSection =
        useFlags()[FeatureFlagKey.StandaloneConvAiOverviewPageResourceSection]

    const isShoppingAssistantTrialImprovement =
        useFlags()[FeatureFlagKey.ShoppingAssistantTrialImprovement]

    const {
        activationModal,
        earlyAccessModal,
        isOnNewPlan,
        showEarlyAccessModal,
        showActivationModal,
    } = useActivation({
        autoDisplayEarlyAccessDisabled: true,
    })

    useEffectOnce(() => {
        logEvent(SegmentEvent.AiAgentOverviewPageView, {
            shopName,
            shopType,
        })
    })

    const accountDomain = currentAccount.get('domain')

    const { isOpen, isLoading, handleModalAction, modalContent } =
        useThankYouModal()

    const { canSeeTrialCTA, canBookDemo, hasAnyTrialStarted, trialType } =
        useTrialAccess(shopName)

    const { storeActivations } = useStoreActivations()

    const {
        startTrialDeprecated,
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
        trialType,
    })

    /* TODO: [AIFLY-547] remove this when the trial improvement is enabled */
    useEffect(() => {
        if (
            (canSeeTrialCTA || canBookDemo) &&
            !hasAnyTrialStarted &&
            !isShoppingAssistantTrialImprovement
        ) {
            logEvent(SegmentEvent.TrialBannerOverviewViewed, {
                type: canBookDemo ? 'Demo' : 'Trial',
            })
        }
    }, [
        canSeeTrialCTA,
        canBookDemo,
        hasAnyTrialStarted,
        isShoppingAssistantTrialImprovement,
    ])

    const onConfirmModal = () => handleModalAction('confirm')
    const onCloseModal = () => handleModalAction('close')

    const trialModalProps = useTrialModalProps({ onConfirmTrial })

    return (
        <AiAgentOverviewLayout shopName={shopName}>
            {/* TODO: [AIFLY-547] remove this when the trial improvement is enabled */}
            {!isShoppingAssistantTrialImprovement && (
                <>
                    {(canSeeTrialCTA || canBookDemo) && !hasAnyTrialStarted && (
                        <TrialAlertBanner
                            {...trialModalProps.trialAlertBanner}
                        />
                    )}

                    {isTrialUpgradeModalOpen && (
                        <UpgradePlanModal
                            {...trialModalProps.trialUpgradePlanModal}
                            onClose={closeTrialUpgradeModal}
                            onConfirm={startTrialDeprecated}
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
                </>
            )}

            <KpiSection
                isOnNewPlan={isOnNewPlan}
                showActivationModal={showActivationModal}
                showEarlyAccessModal={showEarlyAccessModal}
                shopName={shopName}
            />
            <PendingTasksSectionConnected shopName={shopName} />
            {hasResourceSection && <ResourcesSection />}
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
