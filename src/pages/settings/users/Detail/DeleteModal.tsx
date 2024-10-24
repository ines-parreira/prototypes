import React from 'react'

import {useDeleteAgent} from 'hooks/agents/useDeleteAgent'
import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

import {navigateBackToUserList} from './constants'

type Props = {
    agentId: number
    isModalOpen: boolean
    setModalOpen: (arg1: boolean) => void
    name: string
}

export const DeleteModal = ({
    agentId,
    name,
    isModalOpen,
    setModalOpen,
}: Props) => {
    const {mutateAsync: deleteAgent, isLoading: isDeleting} =
        useDeleteAgent(name)
    return (
        <Modal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            isClosable={false}
            size="small"
        >
            <ModalHeader title={`Delete ${name}?`} />
            <ModalBody>
                Deleting this user will unassign them from all their tickets,
                open or closed, and will delete their statistics.
                <br />
                <br />
                This action is irreversible.
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" onClick={() => setModalOpen(false)}>
                    Cancel
                </Button>
                <Button
                    type="button"
                    intent="destructive"
                    isLoading={isDeleting}
                    onClick={async () => {
                        try {
                            await deleteAgent([agentId], {
                                onSuccess: navigateBackToUserList,
                            })
                        } finally {
                            setModalOpen(false)
                        }
                    }}
                >
                    Delete User
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}
