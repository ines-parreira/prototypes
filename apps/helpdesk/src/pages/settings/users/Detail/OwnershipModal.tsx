import { Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import { updateAccountOwner } from 'state/currentAccount/actions'

type Props = {
    agentId: number
    isModalOpen: boolean
    setModalOpen: (arg1: boolean) => void
    name: string
}

export const OwnershipModal = ({
    agentId,
    name,
    isModalOpen,
    setModalOpen,
}: Props) => {
    const dispatch = useAppDispatch()
    return (
        <Modal
            isOpen={isModalOpen}
            onClose={() => setModalOpen(false)}
            isClosable={false}
            size="small"
        >
            <ModalHeader title={`Set ${name} as owner`} />
            <ModalBody>
                Assigning ownership automatically upgrades user’s role to Admin.
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" onClick={() => setModalOpen(false)}>
                    Cancel
                </Button>
                <Button
                    type="button"
                    intent="primary"
                    onClick={() => {
                        void dispatch(updateAccountOwner(agentId))
                        setModalOpen(false)
                    }}
                >
                    Set As Owner
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}
