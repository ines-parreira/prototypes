import React from 'react'

import { useSessionStorage } from '@repo/hooks'

import { Button } from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './PlaygroundActionsModal.less'

interface PlaygroundActionsModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

const PlaygroundActionsModal: React.FC<PlaygroundActionsModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null)
    const [isConfirmed, setIsConfirmed] = useSessionStorage(
        'aiAgentPlaygroundActionsModalSelected',
        false,
    )

    const handleConfirmationClick = () => {
        if (checkboxRef.current) {
            const newValue = !checkboxRef.current.checked
            checkboxRef.current.checked = newValue
            setIsConfirmed(newValue)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="medium"
            isClosable={false}
            className={css.PlaygroundActionsModal}
        >
            <ModalHeader title="Enable Actions in test mode?"></ModalHeader>
            <ModalBody className={css.modalBody}>
                <div className={css.modalContent}>
                    <span>
                        When Actions are triggered in test mode, they use live
                        customer data. This means:
                    </span>
                    <ul>
                        <li>Customer data may be updated or deleted</li>
                        <li>Real orders may be modified or cancelled</li>
                        <li>Changes cannot be undone</li>
                    </ul>
                </div>
                <div
                    className={css.modalBodyConfirmation}
                    onClick={handleConfirmationClick}
                >
                    <div className={css.checkboxContainer}>
                        <input
                            ref={checkboxRef}
                            checked={isConfirmed}
                            type="checkbox"
                            id="confirmActions"
                            onChange={(e) => setIsConfirmed(e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className={css.modalBodyConfirmationText}>
                        I understand that enabling Actions in test mode may
                        cause irreversible changes to live customer data.
                    </div>
                </div>
            </ModalBody>
            <ModalFooter className={css.modalFooter}>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button
                    intent="destructive"
                    isDisabled={!isConfirmed}
                    onClick={onConfirm}
                >
                    Enable Actions
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default PlaygroundActionsModal
