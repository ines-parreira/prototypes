import { useCallback, useState } from 'react'

import { logEvent } from 'common/segment/segment'
import { SegmentEvent } from 'common/segment/types'
import useAppSelector from 'hooks/useAppSelector'
import { useEarlyAccessAutomatePlan } from 'models/billing/queries'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { TrialEndingModal } from 'pages/aiAgent/trial/components/TrialEndingModal/TrialEndingModal'
import { TrialManageModal } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import TrialOptOutModal from 'pages/aiAgent/trial/components/TrialOptOutModal/TrialOptOutModal'
import { UpgradePlanModal } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialEnding } from 'pages/aiAgent/trial/hooks/useTrialEnding'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { TrialType } from '../types/ShoppingAssistant'

export type TrialProgressModalsProps = {
    storeName: string
    trialType: TrialType
}

export const TrialProgressModals = ({
    storeName,
    trialType,
}: TrialProgressModalsProps) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const { storeActivations } = useStoreActivations({ storeName })
    const { trialEndDatetime, isTrialExtended } = useTrialEnding(
        storeName,
        trialType,
    )
    const [isOptOutModalOpen, setIsOptOutModalOpen] = useState(false)

    const { upgradePlanAsync, isLoading: isUpgradePlanLoading } =
        useUpgradePlan()

    const accountDomain = currentAccount.get('domain')

    const {
        isManageTrialModalOpen,
        closeManageTrialModal,
        isUpgradePlanModalOpen,
        closeUpgradePlanModal,
        onRequestTrialExtension,
        closeAllTrialModals,
    } = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
        trialType,
    })

    const onOptOutClick = () => {
        closeManageTrialModal()
        setIsOptOutModalOpen(true)
    }

    const onUpgradeClick = useCallback(async () => {
        logEvent(SegmentEvent.PricingModalClicked, {
            type: 'upgraded',
            trialType,
        })
        await upgradePlanAsync()
        closeAllTrialModals()
    }, [upgradePlanAsync, closeAllTrialModals, trialType])

    const trialModalProps = useTrialModalProps({
        storeName,
    })

    const { data: earlyAccessPlan } = useEarlyAccessAutomatePlan()

    return (
        <>
            {isManageTrialModalOpen && (
                <TrialManageModal
                    {...trialModalProps.trialEndingModal}
                    title="Manage Shopping Assistant trial"
                    onClose={closeManageTrialModal}
                    primaryAction={
                        earlyAccessPlan
                            ? {
                                  label: 'Upgrade Now',
                                  onClick: onUpgradeClick,
                              }
                            : undefined
                    }
                    secondaryAction={{
                        label: 'Opt Out',
                        onClick: onOptOutClick,
                    }}
                />
            )}

            {isUpgradePlanModalOpen && (
                <UpgradePlanModal
                    {...trialModalProps.upgradePlanModal}
                    onClose={closeUpgradePlanModal}
                    onConfirm={onUpgradeClick}
                    onDismiss={closeUpgradePlanModal}
                    isLoading={isUpgradePlanLoading}
                />
            )}

            {isOptOutModalOpen && (
                <TrialOptOutModal
                    isOpen={isOptOutModalOpen}
                    isTrialExtended={isTrialExtended}
                    onClose={() => setIsOptOutModalOpen(false)}
                    onRequestTrialExtension={() =>
                        onRequestTrialExtension(trialEndDatetime)
                    }
                    trialType={trialType}
                />
            )}

            {storeName && (
                <TrialEndingModal storeName={storeName} trialType={trialType} />
            )}
        </>
    )
}
