import { LegacyButton as Button } from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './DeleteModal.less'

type Props = {
    isDeleting: boolean
    isModalOpen: boolean
    onDelete: () => Promise<void>
    setModalOpen: (arg1: boolean) => void
    title: string
    description: string
}

export const DeleteModal = ({
    isDeleting,
    isModalOpen,
    onDelete,
    setModalOpen,
    title,
    description,
}: Props) => {
    return (
        <Modal
            classNameDialog={css.modal}
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            isClosable={false}
            size="medium"
        >
            <ModalHeader title={title} />
            <ModalBody>{description}</ModalBody>
            <ModalActionsFooter>
                <Button
                    intent="secondary"
                    fillStyle="fill"
                    onClick={() => setModalOpen(false)}
                >
                    Cancel
                </Button>
                <Button
                    intent="destructive"
                    fillStyle="fill"
                    isLoading={isDeleting}
                    onClick={onDelete}
                >
                    Delete
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}
