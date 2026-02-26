import { LegacyButton as Button } from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

export type GorgiasChatIntegrationLanguageDeleteModalProps = {
    isOpen: boolean
    language: string
    onConfirm: () => void
    onDiscard: () => void
}

const GorgiasChatIntegrationLanguageDeleteModal = ({
    isOpen,
    language,
    onConfirm,
    onDiscard,
}: GorgiasChatIntegrationLanguageDeleteModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onDiscard} size="small">
            <ModalHeader title={`Delete ${language}`} />
            <ModalBody>
                <p>
                    By deleting this language, your chat will not be displayed
                    in {language} anymore.
                </p>
            </ModalBody>
            <ModalActionsFooter>
                <Button
                    data-testid="discard-delete-button"
                    intent="secondary"
                    onClick={onDiscard}
                >
                    Keep Language
                </Button>
                <Button
                    data-testid="confirm-delete-button"
                    intent="destructive"
                    onClick={onConfirm}
                >
                    Delete
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}

export default GorgiasChatIntegrationLanguageDeleteModal
