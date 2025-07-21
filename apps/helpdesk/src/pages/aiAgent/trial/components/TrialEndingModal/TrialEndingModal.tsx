import { useCallback, useState } from 'react'

import moment from 'moment'

import { StoreConfiguration } from 'models/aiAgent/types'
import { TrialManageModal } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

const TRIAL_ENDED_DISMISSED_KEY = 'ai-agent-trial-ended-dismissed'

export const TrialEndedModal = ({
    storeConfiguration,
}: {
    storeConfiguration: StoreConfiguration
}) => {
    const storeName = storeConfiguration.storeName
    const { manageTrialModal } = useTrialModalProps({ storeName })
    const { trialTerminationDatetime, forceHideModal } =
        useTrialEnding(storeName)
    const trialMilestone = useSalesTrialRevampMilestone()
    const isRevampTrialMilestone1Enabled = trialMilestone === 'milestone-1'

    const [isTrialEndedDismissed, setIsTrialEndedDismissed] = useState(
        () => localStorage.getItem(TRIAL_ENDED_DISMISSED_KEY) === 'true',
    )

    const dismissTrialEnded = useCallback(() => {
        localStorage.setItem(TRIAL_ENDED_DISMISSED_KEY, 'true')
        setIsTrialEndedDismissed(true)
    }, [])

    const now = moment()
    const isTrialEndedModalOpen =
        isRevampTrialMilestone1Enabled &&
        !isTrialEndedDismissed &&
        !!trialTerminationDatetime &&
        moment(trialTerminationDatetime).isBefore(now)

    if (!isTrialEndedModalOpen || forceHideModal) {
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

const TRIAL_ENDING_TOMORROW_DISMISSED_KEY =
    'ai-agent-trial-ending-tomorrow-dismissed'

export const TrialEndingTomorrowModal = ({
    storeConfiguration,
}: {
    storeConfiguration: StoreConfiguration
}) => {
    const storeName = storeConfiguration.storeName
    const { manageTrialModal } = useTrialModalProps({ storeName })
    const { remainingDays, trialEndDatetime, forceHideModal } =
        useTrialEnding(storeName)
    const trialMilestone = useSalesTrialRevampMilestone()
    const isRevampTrialMilestone1Enabled = trialMilestone === 'milestone-1'

    const [isTrialEndingTomorrowDismissed, setIsTrialEndingTomorrowDismissed] =
        useState(
            () =>
                localStorage.getItem(TRIAL_ENDING_TOMORROW_DISMISSED_KEY) ===
                'true',
        )

    const dismissTrialEndingTomorrow = useCallback(() => {
        localStorage.setItem(TRIAL_ENDING_TOMORROW_DISMISSED_KEY, 'true')
        setIsTrialEndingTomorrowDismissed(true)
    }, [])

    const isTrialEndingTomorrowModalOpen =
        isRevampTrialMilestone1Enabled &&
        !isTrialEndingTomorrowDismissed &&
        !!trialEndDatetime &&
        remainingDays === 1

    if (!isTrialEndingTomorrowModalOpen || forceHideModal) {
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
