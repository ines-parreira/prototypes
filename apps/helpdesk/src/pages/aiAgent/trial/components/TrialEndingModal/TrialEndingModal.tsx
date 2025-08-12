import { useCallback, useState } from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { TrialManageModal } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

const TRIAL_ENDING_TOMORROW_DISMISSED_KEY =
    'ai-agent-trial-ending-tomorrow-dismissed'

type TrialEndingModalProps = {
    storeName: string
}

export const TrialEndingModal = ({ storeName }: TrialEndingModalProps) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const { storeActivations } = useStoreActivations({ storeName })
    const { trialEndingModal } = useTrialModalProps({ storeName })
    const { remainingDaysFloat, trialEndDatetime, optedOutDatetime } =
        useTrialEnding(storeName)
    const accountDomain = currentAccount.get('domain')
    const { openUpgradePlanModal, onRequestTrialExtension } =
        useShoppingAssistantTrialFlow({
            accountDomain,
            storeActivations,
        })

    const isShoppingAssistantDuringTrialEnabled = useFlag(
        FeatureFlagKey.ShoppingAssistantDuringTrial,
        false,
    )

    const isOptedOut = !!optedOutDatetime

    const [isModalDismissed, setIsModalDismissed] = useState(
        () =>
            localStorage.getItem(TRIAL_ENDING_TOMORROW_DISMISSED_KEY) ===
            'true',
    )

    const dismissModal = useCallback(() => {
        localStorage.setItem(TRIAL_ENDING_TOMORROW_DISMISSED_KEY, 'true')
        setIsModalDismissed(true)
    }, [])

    const onUpgradeClick = useCallback(() => {
        openUpgradePlanModal()
        dismissModal()
    }, [openUpgradePlanModal, dismissModal])

    const onRequestTrialExtensionClick = useCallback(() => {
        onRequestTrialExtension().then((isSent) => {
            if (isSent) {
                dismissModal()
            }
        })
    }, [onRequestTrialExtension, dismissModal])

    const primaryAction =
        isOptedOut && isShoppingAssistantDuringTrialEnabled
            ? {
                  label: 'Upgrade Now',
                  onClick: onUpgradeClick,
              }
            : {
                  label: 'Dismiss',
                  onClick: dismissModal,
              }

    const secondaryAction =
        isOptedOut && isShoppingAssistantDuringTrialEnabled
            ? {
                  label: 'Request Trial Extension',
                  onClick: onRequestTrialExtensionClick,
              }
            : undefined

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
            primaryAction={primaryAction}
            secondaryAction={secondaryAction}
        />
    )
}
