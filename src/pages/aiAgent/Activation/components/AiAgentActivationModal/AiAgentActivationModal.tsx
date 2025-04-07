import { Button } from '@gorgias/merchant-ui-kit'

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
    isLoading?: boolean
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
    isLoading,
    onClose,
    progressPercentage,
    storeActivations,
    onSalesChange,
    onSupportChange,
    onSupportChatChange,
    onSupportEmailChange,
    onSaveClick,
}: Props) => (
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
            <div className={css.storeCardsList}>
                {Object.entries(storeActivations).map(([storeName, store]) => (
                    <StoreCard
                        key={storeName}
                        isDisabled={isLoading}
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
