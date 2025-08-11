import _noop from 'lodash/noop'

import { Button } from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './UnsavedChangesModal.less'

export type UnsavedChangesModalProps = {
    onDiscard: () => void
    isOpen: boolean
    onClose: () => void
    onSave: () => Promise<void> | void
    body?: React.ReactNode
    title?: string
    shouldShowDiscardButton?: boolean
    shouldShowSaveButton?: boolean
}

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
    onDiscard,
    onSave,
    isOpen,
    onClose,
    shouldShowDiscardButton = true,
    shouldShowSaveButton = true,
    body = `Your changes to this page will be lost if you don’t save them.`,
    title = 'Save changes?',
}) => {
    return (
        <Modal isOpen={isOpen} isClosable={false} onClose={_noop}>
            <ModalHeader title={title} />
            <ModalBody className={css.body}>{body}</ModalBody>
            <ModalFooter className={css.footer}>
                <div>
                    {shouldShowDiscardButton && (
                        <Button
                            fillStyle="ghost"
                            intent="destructive"
                            onClick={onDiscard}
                        >
                            Discard Changes
                        </Button>
                    )}
                </div>
                <div className={css.rightButtons}>
                    <Button intent="secondary" onClick={onClose}>
                        Back To Editing
                    </Button>
                    {shouldShowSaveButton && (
                        <Button onClick={onSave}>Save Changes</Button>
                    )}
                </div>
            </ModalFooter>
        </Modal>
    )
}

export default UnsavedChangesModal
