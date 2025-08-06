import { useMemo } from 'react'

import { useHistory } from 'react-router-dom'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import { useModalManager } from 'hooks/useModalManager'
import { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { getShopNameFromStoreActivations } from 'pages/aiAgent/utils/getShopNameFromStoreActivations'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useNotifyTrialExtensionSlackChannel } from './useNotifyTrialExtensionSlackChannel'
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
const TRIAL_FINISH_SETUP_MODAL_NAME = 'ShoppingAssistantTrialFinishSetupModal'
const TRIAL_REQUEST_MODAL_NAME = 'ShoppingAssistantTrialRequestModal'

const NOTIFY_SUCCESS_MESSAGE =
    "We've received your trial extension request! Our team will review it and get back to you within 2 days via email."
const NOTIFY_ERROR_MESSAGE =
    "We couldn't send your trial extension request. Please try again later or contact our billing team via chat or email."

// TODO: [AIFLY-547] remove startTrial
export type UseShoppingAssistantTrialFlowReturn = {
    startTrial: () => void
    revampStartTrial: () => void
    isLoading: boolean
    isTrialModalOpen: boolean
    isTrialFinishSetupModalOpen: boolean
    isSuccessModalOpen: boolean
    isManageTrialModalOpen: boolean
    isUpgradePlanModalOpen: boolean
    isTrialRequestModalOpen: boolean
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
    closeTrialFinishSetupModal: () => void
    openTrialFinishSetupModal: () => void
    openTrialRequestModal: () => void
    closeTrialRequestModal: () => void
    onRequestTrialExtension: () => Promise<boolean>
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
    const trialFinishSetupModal = useModalManager(
        TRIAL_FINISH_SETUP_MODAL_NAME,
        {
            autoDestroy: false,
        },
    )

    const trialRequestModal = useModalManager(TRIAL_REQUEST_MODAL_NAME, {
        autoDestroy: false,
    })

    const dispatch = useAppDispatch()
    const history = useHistory()
    const notifySlackChannel = useNotifyTrialExtensionSlackChannel()

    const shopName = useMemo(
        () => getShopNameFromStoreActivations(storeActivations),
        [storeActivations],
    )
    const { routes } = useAiAgentNavigation({ shopName })

    const { mutateAsync: triggerTrialMutation, isLoading } =
        useStartShoppingAssistantTrial({
            onError: () => {
                trialModal.closeModal(TRIAL_UPGRADE_MODAL_NAME)
            },
        })

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

    const revampStartTrial = () => {
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
                    // Close upgrade modal and open finish setup modal
                    trialModal.closeModal(TRIAL_UPGRADE_MODAL_NAME)
                    trialFinishSetupModal.openModal(
                        TRIAL_FINISH_SETUP_MODAL_NAME,
                    )

                    onUpgradeModalClose?.()
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

    const closeTrialFinishSetupModal = () => {
        trialFinishSetupModal.closeModal(TRIAL_FINISH_SETUP_MODAL_NAME)
    }

    const openTrialFinishSetupModal = () => {
        trialFinishSetupModal.openModal(TRIAL_FINISH_SETUP_MODAL_NAME)
    }

    const openTrialRequestModal = () => {
        logEvent(SegmentEvent.PricingModalViewed, {
            type: 'Notify',
        })
        trialRequestModal.openModal(TRIAL_REQUEST_MODAL_NAME)
    }

    const closeTrialRequestModal = () => {
        trialRequestModal.closeModal(TRIAL_REQUEST_MODAL_NAME)
    }

    const onRequestTrialExtension = (): Promise<boolean> => {
        logEvent(SegmentEvent.TrialManageTrialExtensionRequestClicked, {
            CTA: 'Request Trial Extension',
        })
        return notifySlackChannel().then((isSent) => {
            if (isSent) {
                dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: NOTIFY_SUCCESS_MESSAGE,
                    }),
                )
                return true
            }

            dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: NOTIFY_ERROR_MESSAGE,
                }),
            )
            return false
        })
    }

    return {
        startTrial,
        revampStartTrial,
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
        closeTrialFinishSetupModal,
        openTrialFinishSetupModal,
        isTrialFinishSetupModalOpen: trialFinishSetupModal.isOpen(
            TRIAL_FINISH_SETUP_MODAL_NAME,
        ),
        isTrialRequestModalOpen: trialRequestModal.isOpen(
            TRIAL_REQUEST_MODAL_NAME,
        ),
        openTrialRequestModal,
        closeTrialRequestModal,
        onRequestTrialExtension,
    }
}
