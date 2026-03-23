import { Button } from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

type Props = {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

export const ShopifyScriptTagScopeModal = ({
    isOpen,
    onClose,
    onConfirm,
}: Props) => {
    return (
        <Modal
            onClose={onClose}
            isOpen={isOpen}
            container={document.getElementById('root') as Element}
        >
            <ModalHeader title="Update Shopify permissions" />
            <ModalBody>
                Please update Shopify permissions before installing your chat to
                ensure better stability.
            </ModalBody>
            <ModalActionsFooter>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
                <Button onClick={onConfirm}>Update</Button>
            </ModalActionsFooter>
        </Modal>
    )
}
