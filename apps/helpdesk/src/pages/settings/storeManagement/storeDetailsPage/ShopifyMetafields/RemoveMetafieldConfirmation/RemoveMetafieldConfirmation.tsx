import React from 'react'

import { Button } from '@gorgias/axiom'

import Modal from '../../../../../common/components/modal/Modal'
import ModalActionsFooter from '../../../../../common/components/modal/ModalActionsFooter'
import ModalBody from '../../../../../common/components/modal/ModalBody'
import ModalHeader from '../../../../../common/components/modal/ModalHeader'

import styles from './DeleteMetafieldConfirmation.less'

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
