import { useCallback, useState } from 'react'

import { StoreConfiguration } from 'models/aiAgent/types'
import { TrialManageModal } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

const TRIAL_ENDING_TOMORROW_DISMISSED_KEY =
    'ai-agent-trial-ending-tomorrow-dismissed'

export const TrialEndingTomorrowModal = ({
    storeConfiguration,
}: {
    storeConfiguration: StoreConfiguration
}) => {
    const storeName = storeConfiguration.storeName
    const { trialEndingModal } = useTrialModalProps({ storeName })
    const { remainingDaysFloat, trialEndDatetime } = useTrialEnding(storeName)

    const [isModalDismissed, setIsModalDismissed] = useState(
        () =>
            localStorage.getItem(TRIAL_ENDING_TOMORROW_DISMISSED_KEY) ===
            'true',
    )

    const dismissModal = useCallback(() => {
        localStorage.setItem(TRIAL_ENDING_TOMORROW_DISMISSED_KEY, 'true')
        setIsModalDismissed(true)
    }, [])

    const oneDayRemaining = remainingDaysFloat > 0 && remainingDaysFloat <= 1
    const isModalOpen =
        oneDayRemaining && !!trialEndDatetime && !isModalDismissed

    if (!isModalOpen) {
        return null
    }

    return (
        <TrialManageModal
            title={trialEndingModal.title}
            description={trialEndingModal.description}
            advantages={trialEndingModal.advantages}
            secondaryDescription={trialEndingModal.secondaryDescription}
            onClose={dismissModal}
            primaryAction={{
                label: 'Dismiss',
                onClick: dismissModal,
            }}
        />
    )
}
