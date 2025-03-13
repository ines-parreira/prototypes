import React from 'react'

import { Button } from '@gorgias/merchant-ui-kit'

import { StoreConfiguration } from 'models/aiAgent/types'
import { ActivationProgress } from 'pages/aiAgent/Activation/components/ActivationProgress/ActivationProgress'
import { AiAgentActivationStoreCard as StoreCard } from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/AiAgentActivationStoreCard'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'

import css from './AiAgentActivationModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void
    accountDomain: string
    storeConfigs: StoreConfiguration[]
    // This function is used to notify the parent component if we try to enable sales
    // if the callback returns false, we will cancel the action
    onSalesEnabled: () => boolean
    pageName: string
}
export const AiAgentActivationModal = ({
    isOpen,
    onClose,
    accountDomain,
    storeConfigs,
    onSalesEnabled,
    pageName,
}: Props) => {
    const {
        storeActivations,
        score: { totalScore, currentScore },
        onSalesChange,
        onSupportChange,
        onSupportChatChange,
        onSupportEmailChange,
        onSave,
        isLoading,
    } = useStoreActivations({
        accountDomain,
        storeConfigurations: storeConfigs,
        pageName,
    })

    const progressPercentage = Math.round((currentScore / totalScore) * 100)

    const onSaveClick = async () => {
        await onSave()
        onClose()
    }

    return (
        <Modal
            className={css.modal}
            classNameContent={css.modalContent}
            isOpen={isOpen}
            onClose={onClose}
        >
            <div className={css.modalHeader}>
                <div className={css.modalTitle}>Manage AI Agent Activation</div>
                <div className={css.activationStatus}>
                    <ActivationProgress percentage={progressPercentage} />
                </div>
            </div>

            <ModalBody className={css.modalBody}>
                <div className={css.storeCardsList}>
                    {Object.entries(storeActivations).map(
                        ([storeName, store]) => (
                            <StoreCard
                                key={storeName}
                                isDisabled={isLoading}
                                store={store}
                                onSalesChange={(value) => {
                                    // If we try to activate sales, we need to check if the user is on a new plan
                                    if (value) {
                                        const shouldContinueTheAction =
                                            onSalesEnabled()

                                        if (!shouldContinueTheAction) {
                                            return
                                        }
                                    }

                                    onSalesChange(storeName, value)
                                }}
                                onSupportChange={(value) =>
                                    onSupportChange(storeName, value)
                                }
                                onSupportChatChange={(value) =>
                                    onSupportChatChange(storeName, value)
                                }
                                onSupportEmailChange={(value) =>
                                    onSupportEmailChange(storeName, value)
                                }
                            />
                        ),
                    )}
                </div>
            </ModalBody>

            <div className={css.footer}>
                <Button intent="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={onSaveClick} isLoading={isLoading}>
                    Save
                </Button>
            </div>
        </Modal>
    )
}
