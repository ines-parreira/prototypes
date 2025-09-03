import { TrialEndedModal } from 'pages/aiAgent/trial/components/TrialEndedModal/TrialEndedModal'
import { TrialEndingModal } from 'pages/aiAgent/trial/components/TrialEndingModal/TrialEndingModal'
import { TrialManageModal } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import TrialOptOutModal from 'pages/aiAgent/trial/components/TrialOptOutModal/TrialOptOutModal'
import { UpgradePlanModal } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { TrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import TrialFinishSetupModal from 'pages/common/components/TrialFinishSetupModal/TrialFinishSetupModal'

import { TrialType } from '../types/ShoppingAssistant'

export type TrialSharedModalsProps = {
    shopName: string
    trialType: TrialType
    trialModalProps: TrialModalProps
}

export const TrialSharedModals = ({
    shopName,
    trialType,
    trialModalProps,
}: TrialSharedModalsProps) => {
    return (
        <>
            <TrialEndedModal storeName={shopName} trialType={trialType} />
            <TrialManageModal {...trialModalProps.trialManageModal} />
            {trialModalProps.upgradePlanModal.isOpen && (
                <UpgradePlanModal {...trialModalProps.upgradePlanModal} />
            )}

            {trialModalProps.trialOptOutModal.isOpen && (
                <TrialOptOutModal {...trialModalProps.trialOptOutModal} />
            )}

            <TrialEndingModal storeName={shopName} trialType={trialType} />

            <TrialFinishSetupModal {...trialModalProps.trialFinishSetupModal} />
        </>
    )
}
