import { Button, LoadingSpinner } from '@gorgias/merchant-ui-kit'

import { ActivationProgress } from 'pages/aiAgent/Activation/components/ActivationProgress/ActivationProgress'
import {
    StoreActivation,
    AiAgentActivationStoreCard as StoreCard,
} from 'pages/aiAgent/Activation/components/AiAgentActivationStoreCard/AiAgentActivationStoreCard'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'

import css from './AiAgentActivationModal.less'

type Props = {
    isOpen: boolean
    isFetchLoading: boolean
    isSaveLoading: boolean
    onClose: () => void
    progressPercentage: number
    storeActivations: Record<string, StoreActivation>
    onSalesChange: (storeName: string, value: boolean) => void
    onSupportChange: (storeName: string, value: boolean) => void
    onSupportChatChange: (storeName: string, value: boolean) => void
    onSupportEmailChange: (storeName: string, value: boolean) => void
    onSaveClick: () => void
}
export const AiAgentActivationModal = ({
    isOpen,
    isFetchLoading,
    isSaveLoading,
    onClose,
    progressPercentage,
    storeActivations,
    onSalesChange,
    onSupportChange,
    onSupportChatChange,
    onSupportEmailChange,
    onSaveClick,
}: Props) => {
    const storeActivationList = Object.entries(storeActivations)
    return (
        <Modal
            preventCloseClickOutside
            className={css.modal}
            classNameContent={css.modalContent}
            classNameDialog={css.modalDialog}
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
                {isFetchLoading ? (
                    <div className={css.loadingContainer}>
                        <LoadingSpinner size="big" />
                    </div>
                ) : (
                    <div className={css.storeCardsList}>
                        {storeActivationList.map(([storeName, store]) => (
                            <StoreCard
                                key={storeName}
                                isDisabled={isSaveLoading}
                                store={store}
                                onSalesChange={(value) =>
                                    onSalesChange(storeName, value)
                                }
                                onSupportChange={(value) =>
                                    onSupportChange(storeName, value)
                                }
                                onSupportChatChange={(value) =>
                                    onSupportChatChange(storeName, value)
                                }
                                onSupportEmailChange={(value) =>
                                    onSupportEmailChange(storeName, value)
                                }
                                closeModal={onClose}
                            />
                        ))}
                    </div>
                )}
            </ModalBody>

            <div className={css.footer}>
                <Button intent="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    onClick={onSaveClick}
                    isLoading={isFetchLoading || isSaveLoading}
                >
                    Save
                </Button>
            </div>
        </Modal>
    )
}
