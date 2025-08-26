import { useCallback, useState } from 'react'

import moment from 'moment'

import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { TrialManageModal } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

const TRIAL_ENDED_DISMISSED_KEY = 'ai-agent-trial-ended-dismissed'

export const TrialEndedModal = ({
    storeName,
    trialType,
}: {
    storeName: string
    trialType: TrialType
}) => {
    const { trialEndedModal } = useTrialModalProps({ storeName })
    const { trialTerminationDatetime, optedOutDatetime } = useTrialEnding(
        storeName,
        trialType,
    )

    const [isModalDismissed, setIsModalDismissed] = useState(
        () => localStorage.getItem(TRIAL_ENDED_DISMISSED_KEY) === 'true',
    )

    const dismissModal = useCallback(() => {
        localStorage.setItem(TRIAL_ENDED_DISMISSED_KEY, 'true')
        setIsModalDismissed(true)
    }, [])

    const now = moment()
    const terminationDatetime = moment(trialTerminationDatetime)
    const terminatedLessThan3DaysAgo =
        terminationDatetime.isBefore(now) &&
        terminationDatetime.isAfter(now.subtract(3, 'days'))
    const isModalOpen =
        terminatedLessThan3DaysAgo && !!optedOutDatetime && !isModalDismissed

    if (!isModalOpen) {
        return null
    }

    return (
        <TrialManageModal
            title={trialEndedModal.title}
            description={trialEndedModal.description}
            advantages={trialEndedModal.advantages}
            secondaryDescription={trialEndedModal.secondaryDescription}
            onClose={dismissModal}
            primaryAction={{
                label: 'Upgrade to Reactivate',
                onClick: () => {},
            }}
            secondaryAction={{
                label: 'No, thanks',
                onClick: dismissModal,
            }}
        />
    )
}
