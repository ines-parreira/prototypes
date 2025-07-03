import { useMemo } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useHistory } from 'react-router-dom'

import { useModalManager } from 'hooks/useModalManager'
import { storeConfigurationKeys } from 'models/aiAgent/queries'
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

const UPGRADE_MODAL_NAME = 'ShoppingAssistantUpgradeModal'
const SUCCESS_MODAL_NAME = 'ShoppingAssistantSuccessModal'

type UseShoppingAssistantTrialFlowReturn = {
    startTrial: () => void
    isLoading: boolean
    isTrialModalOpen: boolean
    isSuccessModalOpen: boolean
    closeUpgradeModal: () => void
    closeSuccessModal: () => void
    openUpgradeModal: () => void
    onConfirmTrial: () => void
}

export const useShoppingAssistantTrialFlow = ({
    accountDomain,
    storeActivations,
    onUpgradeModalClose,
    onSuccessModalOpen,
}: UseShoppingAssistantTrialFlowProps): UseShoppingAssistantTrialFlowReturn => {
    const trialModal = useModalManager(UPGRADE_MODAL_NAME, {
        autoDestroy: false,
    })
    const successModal = useModalManager(SUCCESS_MODAL_NAME, {
        autoDestroy: false,
    })

    const queryClient = useQueryClient()
    const history = useHistory()

    const shopName = useMemo(
        () => getShopNameFromStoreActivations(storeActivations),
        [storeActivations],
    )
    const { routes } = useAiAgentNavigation({ shopName })

    const { mutateAsync: triggerTrialMutation, isLoading } =
        useStartShoppingAssistantTrial()

    const startTrial = () => {
        triggerTrialMutation(
            {
                accountDomain,
                storeActivations,
            },
            {
                onSuccess: () => {
                    // Refresh the store activations cache
                    queryClient.invalidateQueries({
                        queryKey: storeConfigurationKeys.all(),
                    })

                    // Close upgrade modal and open success modal
                    trialModal.closeModal(UPGRADE_MODAL_NAME)
                    successModal.openModal(SUCCESS_MODAL_NAME)

                    // Call optional callbacks
                    onUpgradeModalClose?.()
                    onSuccessModalOpen?.()
                },
            },
        )
    }

    const closeUpgradeModal = () => {
        trialModal.closeModal(UPGRADE_MODAL_NAME)
        onUpgradeModalClose?.()
    }

    const closeSuccessModal = () => {
        history.push(routes.customerEngagement)
        successModal.closeModal(SUCCESS_MODAL_NAME)
    }

    const openUpgradeModal = () => {
        trialModal.openModal(UPGRADE_MODAL_NAME)
    }

    const onConfirmTrial = () => {
        if (Object.keys(storeActivations).length > 1) {
            history.push(routes.customerEngagement)
        } else {
            openUpgradeModal()
        }
    }

    return {
        startTrial,
        isLoading,
        isTrialModalOpen: trialModal.isOpen(UPGRADE_MODAL_NAME),
        isSuccessModalOpen: successModal.isOpen(SUCCESS_MODAL_NAME),
        closeUpgradeModal,
        closeSuccessModal,
        openUpgradeModal,
        onConfirmTrial,
    }
}
