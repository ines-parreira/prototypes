import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

interface ImportMetafieldFlowProps {
    onClose: () => void
    isOpen: boolean
}

export default function ImportMetafieldFlow({
    onClose,
    isOpen,
}: ImportMetafieldFlowProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="medium">
            <ModalHeader title="Import Shopify metafields to Gorgias" />
            <ModalBody>Import Metafield Flow Content</ModalBody>
        </Modal>
    )
}
