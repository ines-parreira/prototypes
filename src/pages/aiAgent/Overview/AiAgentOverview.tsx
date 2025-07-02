import { useState } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import modalImage from 'assets/img/ai-agent/ai_agent_onboarding_thankyou.png'
import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import { useActivation } from 'pages/aiAgent//Activation/hooks/useActivation'
import ThankYouModal from 'pages/aiAgent/Onboarding/components/ThankYouModal/ThankYouModal'
import { KpiSection } from 'pages/aiAgent/Overview/components/KpiSection/KpiSection'
import { ResourcesSection } from 'pages/aiAgent/Overview/components/ResourcesSection/ResourcesSection'
import { Separator } from 'pages/aiAgent/Overview/components/Separator/Separator'
import { Title } from 'pages/aiAgent/Overview/components/Title/Title'
import { useThankYouModal } from 'pages/aiAgent/Overview/hooks/useThankYouModal'
import { AiAgentOverviewLayout } from 'pages/aiAgent/Overview/layout/AiAgentOverviewLayout'
import { TrialAlertBanner } from 'pages/aiAgent/trial/components/TrialAlertBanner/TrialAlertBanner'
import { UpgradePlanModal } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { getCurrentUser } from 'state/currentUser/selectors'

import { PendingTasksSectionConnected } from './components/PendingTasksSection/PendingTasksSectionConnected'

export const AiAgentOverview = () => {
    const currentUser = useAppSelector(getCurrentUser)

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

    const { isOpen, isLoading, handleModalAction, modalContent } =
        useThankYouModal()

    const { canSeeTrialCTA: canSeeTrialRevamp } =
        useShoppingAssistantTrialAccess()

    const [isUpgradeTrialModalRevampOpen, setIsUpgradeTrialModalRevampOpen] =
        useState(false)

    const onConfirmModal = () => handleModalAction('confirm')
    const onCloseModal = () => handleModalAction('close')

    return (
        <AiAgentOverviewLayout>
            <Title
                firstName={currentUser.get('firstname')}
                activationButton={activationButton}
            />
            {canSeeTrialRevamp && (
                <TrialAlertBanner
                    title="Drive more revenue with Shopping Assistant"
                    description="Make every interaction personal. With AI Agent’s new shopping assistant features, you can offer real-time recommendations powered by rich insights and persuasive selling skills that help customers buy with confidence."
                    primaryAction={{
                        label: 'Try for 14 days',
                        onClick: () => {
                            setIsUpgradeTrialModalRevampOpen(true)
                        },
                    }}
                    secondaryAction={{
                        label: 'How Shopping Assistant Accelerates Growth',
                        onClick: () => {
                            window.open(
                                'https://www.gorgias.com/ai-shopping-assistant',
                                '_blank',
                            )
                        },
                    }}
                />
            )}

            {isUpgradeTrialModalRevampOpen && (
                <UpgradePlanModal
                    title="Try Shopping Assistant for 14 days at no additional cost"
                    onClose={() => {
                        setIsUpgradeTrialModalRevampOpen(false)
                    }}
                    onConfirm={() => {
                        setIsUpgradeTrialModalRevampOpen(false)
                    }}
                    currentPlan={{
                        title: 'Support Agent',
                        description: 'Provide best-in-class automated support',
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
