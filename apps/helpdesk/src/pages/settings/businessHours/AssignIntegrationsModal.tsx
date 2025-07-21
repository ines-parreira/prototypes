import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

type Props = {
    isOpen: boolean
    onClose: () => void
}

export default function AssignIntegrationsModal({ isOpen, onClose }: Props) {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader title="Select integrations" />
            <ModalBody>Assign Integrations</ModalBody>
        </Modal>
    )
}
