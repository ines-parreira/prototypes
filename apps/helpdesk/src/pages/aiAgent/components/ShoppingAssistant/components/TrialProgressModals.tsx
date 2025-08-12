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
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

export type TrialProgressModalsProps = {
    storeName?: string
}

export const TrialProgressModals = ({
    storeName,
}: TrialProgressModalsProps) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const { storeActivations } = useStoreActivations()
    const [isOptOutModalOpen, setIsOptOutModalOpen] = useState(false)

    const { upgradePlanAsync, isLoading: isUpgradePlanLoading } =
        useUpgradePlan()

    const accountDomain = currentAccount.get('domain')

    const {
        isManageTrialModalOpen,
        closeManageTrialModal,
        isUpgradePlanModalOpen,
        openTrialUpgradeModal,
        closeUpgradePlanModal,
        onRequestTrialExtension,
        closeAllTrialModals,
    } = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
    })

    const onOptOutClick = () => {
        closeManageTrialModal()
        setIsOptOutModalOpen(true)
    }

    const onUpgradeClick = useCallback(async () => {
        logEvent(SegmentEvent.PricingModalClicked, {
            type: 'upgraded',
        })
        await upgradePlanAsync()
        closeAllTrialModals()
    }, [upgradePlanAsync, closeAllTrialModals])

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
                                  onClick: openTrialUpgradeModal,
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
                    onClose={() => setIsOptOutModalOpen(false)}
                    onRequestTrialExtension={onRequestTrialExtension}
                />
            )}

            {storeName && <TrialEndingModal storeName={storeName} />}
        </>
    )
}
