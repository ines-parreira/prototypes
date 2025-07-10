import { useMemo } from 'react'

import { useHistory } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import { useModalManager } from 'hooks/useModalManager'
import { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { getShopNameFromStoreActivations } from 'pages/aiAgent/utils/getShopNameFromStoreActivations'

import { useStartShoppingAssistantTrial } from './useStartShoppingAssistantTrial'

type UseShoppingAssistantTrialFlowProps = {
    accountDomain: string
    storeActivations: Record<string, StoreActivation>
    onUpgradeModalClose?: () => void
    onSuccessModalOpen?: () => void
}

const TRIAL_UPGRADE_MODAL_NAME = 'ShoppingAssistantTrialUpgradeModal'
const UPGRADE_MODAL_NAME = 'ShoppingAssistantUpgradeModal'
const SUCCESS_MODAL_NAME = 'ShoppingAssistantSuccessModal'
const MANAGE_TRIAL_MODAL_NAME = 'ShoppingAssistantManageTrialModal'

type UseShoppingAssistantTrialFlowReturn = {
    startTrial: () => void
    isLoading: boolean
    isTrialModalOpen: boolean
    isSuccessModalOpen: boolean
    isManageTrialModalOpen: boolean
    isUpgradePlanModalOpen: boolean
    closeTrialUpgradeModal: () => void
    onDismissTrialUpgradeModal: () => void
    onDismissUpgradePlanModal: () => void
    closeSuccessModal: () => void
    closeManageTrialModal: () => void
    openTrialUpgradeModal: () => void
    onConfirmTrial: () => void
    openManageTrialModal: () => void
    openUpgradePlanModal: () => void
    closeUpgradePlanModal: () => void
}

export const useShoppingAssistantTrialFlow = ({
    accountDomain,
    storeActivations,
    onUpgradeModalClose,
    onSuccessModalOpen,
}: UseShoppingAssistantTrialFlowProps): UseShoppingAssistantTrialFlowReturn => {
    const trialModal = useModalManager(TRIAL_UPGRADE_MODAL_NAME, {
        autoDestroy: false,
    })
    const upgradeModal = useModalManager(UPGRADE_MODAL_NAME, {
        autoDestroy: false,
    })
    const successModal = useModalManager(SUCCESS_MODAL_NAME, {
        autoDestroy: false,
    })
    const manageTrialModal = useModalManager(MANAGE_TRIAL_MODAL_NAME, {
        autoDestroy: false,
    })
    const history = useHistory()

    const shopName = useMemo(
        () => getShopNameFromStoreActivations(storeActivations),
        [storeActivations],
    )
    const { routes } = useAiAgentNavigation({ shopName })

    const { mutateAsync: triggerTrialMutation, isLoading } =
        useStartShoppingAssistantTrial()

    const startTrial = () => {
        logEvent(SegmentEvent.PricingModalClicked, {
            type: 'trial_started',
        })
        triggerTrialMutation(
            {
                accountDomain,
                storeActivations,
            },
            {
                onSuccess: () => {
                    // Close upgrade modal and open success modal
                    trialModal.closeModal(TRIAL_UPGRADE_MODAL_NAME)
                    successModal.openModal(SUCCESS_MODAL_NAME)

                    // Call optional callbacks
                    onUpgradeModalClose?.()
                    onSuccessModalOpen?.()
                },
            },
        )
    }

    const onDismissTrialUpgradeModal = () => {
        logEvent(SegmentEvent.PricingModalClicked, {
            type: 'current_plan',
        })
        trialModal.closeModal(TRIAL_UPGRADE_MODAL_NAME)
        onUpgradeModalClose?.()
    }

    const closeTrialUpgradeModal = () => {
        logEvent(SegmentEvent.PricingModalClicked, {
            type: 'closed',
        })
        trialModal.closeModal(TRIAL_UPGRADE_MODAL_NAME)
        onUpgradeModalClose?.()
    }

    const onDismissUpgradePlanModal = () => {
        logEvent(SegmentEvent.PricingModalClicked, {
            type: 'current_plan',
        })
        upgradeModal.closeModal(UPGRADE_MODAL_NAME)
    }

    const closeUpgradePlanModal = () => {
        upgradeModal.closeModal(UPGRADE_MODAL_NAME)
    }

    const closeManageTrialModal = () => {
        manageTrialModal.closeModal(MANAGE_TRIAL_MODAL_NAME)
    }

    const closeSuccessModal = () => {
        history.push(routes.customerEngagement)
        successModal.closeModal(SUCCESS_MODAL_NAME)
    }

    const openManageTrialModal = () => {
        manageTrialModal.openModal(MANAGE_TRIAL_MODAL_NAME)
    }

    const openTrialUpgradeModal = () => {
        trialModal.openModal(TRIAL_UPGRADE_MODAL_NAME)
    }

    const openUpgradePlanModal = () => {
        upgradeModal.openModal(UPGRADE_MODAL_NAME)
    }

    const onConfirmTrial = () => {
        if (Object.keys(storeActivations).length > 1) {
            history.push(routes.customerEngagement)
        } else {
            openTrialUpgradeModal()
        }
    }

    return {
        startTrial,
        isLoading,
        isUpgradePlanModalOpen: upgradeModal.isOpen(UPGRADE_MODAL_NAME),
        isTrialModalOpen: trialModal.isOpen(TRIAL_UPGRADE_MODAL_NAME),
        isSuccessModalOpen: successModal.isOpen(SUCCESS_MODAL_NAME),
        isManageTrialModalOpen: manageTrialModal.isOpen(
            MANAGE_TRIAL_MODAL_NAME,
        ),
        closeTrialUpgradeModal,
        onDismissTrialUpgradeModal,
        onDismissUpgradePlanModal,
        closeSuccessModal,
        closeManageTrialModal,
        openTrialUpgradeModal,
        onConfirmTrial,
        openManageTrialModal,
        openUpgradePlanModal,
        closeUpgradePlanModal,
    }
}
