import React, {useState} from 'react'

import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

type Props = {
    isOpen: boolean
    errorMessage: string
    onClose: () => void
}

export default function GeneralErrorPopupModal({
    isOpen,
    errorMessage,
    onClose,
}: Props) {
    const [, setIsOpen] = useState(true)

    const handleOnClose = () => {
        onClose()
        setIsOpen(false)
    }

    return (
        <Modal isOpen={isOpen} onClose={handleOnClose} size="small">
            <ModalHeader title="Error" />
            <ModalBody>{errorMessage}</ModalBody>
            <ModalActionsFooter>
                <Button onClick={handleOnClose}>Got it</Button>
            </ModalActionsFooter>
        </Modal>
    )
}
