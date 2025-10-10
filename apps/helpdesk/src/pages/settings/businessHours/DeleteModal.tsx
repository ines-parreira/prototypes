import { LegacyButton as Button } from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import css from './DeleteModal.less'

type Props = {
    isDeleting: boolean
    isModalOpen: boolean
    name: string
    onDelete: () => void
    setModalOpen: (arg1: boolean) => void
}

export const DeleteModal = ({
    isDeleting,
    isModalOpen,
    name,
    onDelete,
    setModalOpen,
}: Props) => {
    return (
        <Modal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            isClosable={false}
            size="medium"
        >
            <ModalHeader title="Delete business hours?" />
            <ModalBody>
                {
                    <>
                        Are you sure you want to delete <b>{name}</b> custom
                        business hours?
                        <br />
                        <br />
                        The custom schedule will be deleted and all integrations
                        assigned to it will revert to default business hours.
                    </>
                }
            </ModalBody>
            <ModalActionsFooter innerClassName={css.footer}>
                <Button
                    intent="secondary"
                    fillStyle="ghost"
                    onClick={() => setModalOpen(false)}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    intent="destructive"
                    isLoading={isDeleting}
                    onClick={onDelete}
                >
                    Delete
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}
