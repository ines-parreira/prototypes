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
import { getCurrentUser } from 'state/currentUser/selectors'

import { PendingTasksSectionConnected } from './components/PendingTasksSection/PendingTasksSectionConnected'

export const AiAgentOverview = () => {
    const currentUser = useAppSelector(getCurrentUser)

    const hasResourceSection =
        useFlags()[FeatureFlagKey.StandaloneConvAiOverviewPageResourceSection]

    const { ActivationButton, ActivationModal, EarlyAccessModal } =
        useActivation('overview', { autoDisplayEarlyAccessDisabled: true })

    useEffectOnce(() => {
        logEvent(SegmentEvent.AiAgentOverviewPageView)
    })

    const { isOpen, isLoading, handleModalAction, modalContent } =
        useThankYouModal()

    const onConfirmModal = () => handleModalAction('confirm')
    const onCloseModal = () => handleModalAction('close')

    return (
        <AiAgentOverviewLayout>
            <Title
                firstName={currentUser.get('firstname')}
                activationButton={<ActivationButton />}
            />
            <KpiSection />
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
            />
            <ActivationModal />
            <EarlyAccessModal />
        </AiAgentOverviewLayout>
    )
}
