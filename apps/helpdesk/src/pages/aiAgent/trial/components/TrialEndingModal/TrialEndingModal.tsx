import { useCallback, useState } from 'react'

import { Tooltip } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { TrialManageModal } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import {
    canRequestTrialExtension,
    COOLDOWN_WAIT_HOURS,
    markTrialExtensionRequested,
} from 'pages/aiAgent/trial/utils/trialExtensionUtils'
import {
    dismissTrialEndingModal,
    isTrialEndingModalDismissed,
} from 'pages/aiAgent/trial/utils/utils'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

type TrialEndingModalProps = {
    storeName: string
    trialType: TrialType
}

export const TrialEndingModal = ({
    storeName,
    trialType,
}: TrialEndingModalProps) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const { storeActivations } = useStoreActivations({ storeName })
    const { trialEndingModal } = useTrialModalProps({ storeName })
    const { remainingDaysFloat, trialEndDatetime, optedOutDatetime } =
        useTrialEnding(storeName, trialType)
    const accountDomain = currentAccount.get('domain')
    const { openUpgradePlanModal, onRequestTrialExtension } =
        useShoppingAssistantTrialFlow({
            accountDomain,
            storeActivations,
            trialType,
        })

    const canRequestExtension = canRequestTrialExtension(trialType)
    const secondaryButtonId =
        'shopping-assistant-request-trial-extension-button-on-trial-ending'
    const isOptedOut = !!optedOutDatetime

    const [isModalDismissed, setIsModalDismissed] = useState(() =>
        isTrialEndingModalDismissed(storeName, trialType),
    )

    const dismissModal = useCallback(() => {
        dismissTrialEndingModal(storeName, trialType)
        setIsModalDismissed(true)
    }, [storeName, trialType])

    const onUpgradeClick = useCallback(() => {
        openUpgradePlanModal(false)
        dismissModal()
    }, [openUpgradePlanModal, dismissModal])

    const onRequestTrialExtensionClick = useCallback(() => {
        if (!canRequestTrialExtension(trialType)) {
            return
        }

        onRequestTrialExtension(trialEndDatetime).then((isSent) => {
            if (isSent) {
                markTrialExtensionRequested(trialType)
                dismissModal()
            }
        })
    }, [onRequestTrialExtension, dismissModal, trialType, trialEndDatetime])

    const primaryAction = isOptedOut
        ? {
              label: 'Upgrade Now',
              onClick: onUpgradeClick,
          }
        : {
              label: 'Dismiss',
              onClick: dismissModal,
          }

    const secondaryAction = isOptedOut
        ? {
              label: 'Request Trial Extension',
              onClick: onRequestTrialExtensionClick,
              isDisabled: !canRequestExtension,
              id: secondaryButtonId,
          }
        : undefined

    const oneDayRemaining = remainingDaysFloat > 0 && remainingDaysFloat <= 1
    const isModalOpen =
        oneDayRemaining && !!trialEndDatetime && !isModalDismissed

    if (!isModalOpen) {
        return null
    }

    return (
        <>
            <TrialManageModal
                title={trialEndingModal.title}
                description={trialEndingModal.description}
                advantages={trialEndingModal.advantages}
                secondaryDescription={trialEndingModal.secondaryDescription}
                onClose={dismissModal}
                primaryAction={primaryAction}
                secondaryAction={secondaryAction}
            />
            {secondaryAction && !canRequestExtension && (
                <Tooltip
                    target={secondaryButtonId}
                    placement="top"
                    disabled={canRequestExtension}
                >
                    Trial extension request was already sent within the last{' '}
                    {COOLDOWN_WAIT_HOURS}
                    hours. Please wait before requesting again.
                </Tooltip>
            )}
        </>
    )
}
