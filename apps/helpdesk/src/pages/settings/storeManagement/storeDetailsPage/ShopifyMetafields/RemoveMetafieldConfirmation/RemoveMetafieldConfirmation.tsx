import React from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import styles from './RemoveMetafieldConfirmation.less'

type Props = {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

const RemoveMetafieldConfirmation = ({ isOpen, onClose, onConfirm }: Props) => {
    const handleConfirm = () => {
        onConfirm()
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="medium"
            classNameContent={styles.modalContent}
        >
            <ModalHeader className={styles.header} title="Remove metafield?" />

            <ModalBody>
                Once removed, the metafield data won&apos;t be available to use
                in Gorgias, or to view in the customer profile. You can add it
                back at any time.
            </ModalBody>

            <ModalActionsFooter innerClassName={styles.actions}>
                <Button intent="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handleConfirm}>Remove</Button>
            </ModalActionsFooter>
        </Modal>
    )
}

export default RemoveMetafieldConfirmation
