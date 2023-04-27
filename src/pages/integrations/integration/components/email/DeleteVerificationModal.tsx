import React, {ReactNode} from 'react'
import {ModalHeader} from 'reactstrap'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import Button from 'pages/common/components/button/Button'

type Props = {
    isOpen: boolean
    children: ReactNode
    setIsOpen: (value: boolean) => void
    onConfirm: () => void
    title?: string
}

export default function DeleteVerificationModal({
    isOpen,
    children,
    setIsOpen,
    onConfirm,
    title = 'Delete verification?',
}: Props) {
    const handleDeleteClick = () => {
        onConfirm?.()
        setIsOpen(false)
    }
    return (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <ModalHeader>{title}</ModalHeader>
            <ModalBody>{children}</ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" onClick={() => setIsOpen(false)}>
                    Close
                </Button>
                <Button onClick={handleDeleteClick} intent="destructive">
                    Delete
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}
