import React from 'react'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'

type Props = {
    actions: (onClose: () => void) => React.ReactNode
    children: (onClick: (ev: React.MouseEvent) => void) => React.ReactNode
    content: string | React.ReactNode
    title: string | React.ReactNode
}

export const ConfirmModalAction = ({
    actions,
    children,
    content,
    title,
}: Props) => {
    const [isOpen, setOpen] = React.useState(false)

    const handleOnClose = () => {
        setOpen(false)
    }

    const handleOnOpen = () => {
        setOpen(true)
    }

    return (
        <>
            {children(handleOnOpen)}
            <Modal isOpen={isOpen} onClose={handleOnClose} size="small">
                <ModalHeader title={title as string} />
                <ModalBody>{content}</ModalBody>
                <ModalActionsFooter>
                    {actions(handleOnClose)}
                </ModalActionsFooter>
            </Modal>
        </>
    )
}
