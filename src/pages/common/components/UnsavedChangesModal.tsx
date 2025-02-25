import React from 'react'

import _noop from 'lodash/noop'

import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './UnsavedChangesModal.less'

type Props = {
    onDiscard: () => void
    isOpen: boolean
    onClose: () => void
    onSave: () => Promise<void> | void
}

const UnsavedChangesModal: React.FC<Props> = ({
    onDiscard,
    onSave,
    isOpen,
    onClose,
}) => {
    return (
        <Modal isOpen={isOpen} isClosable={false} onClose={_noop}>
            <ModalHeader title="Save changes?" />
            <ModalBody className={css.body}>
                Your changes to this page will be lost if you don’t save them.
            </ModalBody>
            <ModalFooter className={css.footer}>
                <div>
                    <Button
                        fillStyle="ghost"
                        intent="destructive"
                        onClick={onDiscard}
                    >
                        Discard Changes
                    </Button>
                </div>
                <div className={css.rightButtons}>
                    <Button intent="secondary" onClick={onClose}>
                        Back To Editing
                    </Button>
                    <Button onClick={onSave}>Save Changes</Button>
                </div>
            </ModalFooter>
        </Modal>
    )
}

export default UnsavedChangesModal
