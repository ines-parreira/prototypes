import { useCallback, useState } from 'react'

import moment from 'moment'

import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { TrialManageModal } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import {
    dismissTrialEndedModal,
    isTrialEndedModalDismissed,
} from 'pages/aiAgent/trial/utils/utils'

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

    const [isModalDismissed, setIsModalDismissed] = useState(() =>
        isTrialEndedModalDismissed(storeName, trialType),
    )

    const dismissModal = useCallback(() => {
        dismissTrialEndedModal(storeName, trialType)
        setIsModalDismissed(true)
    }, [storeName, trialType])

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
                onClick: () => {}, // TODO: Implement this
            }}
            secondaryAction={{
                label: 'No, thanks',
                onClick: dismissModal,
            }}
        />
    )
}
