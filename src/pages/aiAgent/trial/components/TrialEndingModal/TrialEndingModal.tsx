import { TrialManageModal } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

export const TrialEndedModal = () => {
    const { manageTrialModal } = useTrialModalProps({})
    const { isTrialEnded: isTrialEndedModalOpen, dismissTrialEnded } =
        useTrialEnding()

    if (!isTrialEndedModalOpen) {
        return null
    }

    return (
        <TrialManageModal
            title="Your trial has ended — and it made an impact."
            description={manageTrialModal.description}
            advantages={manageTrialModal.advantages}
            secondaryDescription={manageTrialModal.secondaryDescription}
            onClose={dismissTrialEnded}
            primaryAction={{
                label: 'Upgrade to Reactivate',
                onClick: () => {},
            }}
            secondaryAction={{
                label: 'No, thanks',
                onClick: dismissTrialEnded,
            }}
        />
    )
}

export const TrialEndingTomorrowModal = () => {
    const { manageTrialModal } = useTrialModalProps({})
    const {
        isTrialEndingTomorrow: isTrialEndingTomorrowModalOpen,
        dismissTrialEndingTomorrow,
    } = useTrialEnding()

    if (!isTrialEndingTomorrowModalOpen) {
        return null
    }

    return (
        <TrialManageModal
            title="Shopping Assistant trial ends tomorrow"
            description={manageTrialModal.description}
            advantages={manageTrialModal.advantages}
            secondaryDescription={manageTrialModal.secondaryDescription}
            onClose={dismissTrialEndingTomorrow}
            primaryAction={{
                label: 'Upgrade to Reactivate',
                onClick: () => {},
            }}
            secondaryAction={{
                label: 'No, thanks',
                onClick: dismissTrialEndingTomorrow,
            }}
        />
    )
}
