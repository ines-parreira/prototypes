import type { ComponentProps, ReactNode } from 'react'
import { useState } from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'

type Props = {
    confirmationButtonIntent?: ComponentProps<typeof Button>['intent']
    confirmationContent: ReactNode
    confirmationTitle?: ReactNode
    onConfirm: () => void
    onCancel?: () => void
    confirmLabel?: ReactNode
    cancelLabel?: ReactNode
    showCancelButton?: boolean
    modalSize?: ComponentProps<typeof Modal>['size']
} & ComponentProps<typeof Button>

/**
 * @deprecated This component is deprecated and will be removed in future versions.
 * Please use `<Button />` + `<Modal />` from @gorgias/axiom instead.
 * @date 2026-03-11
 * @type ui-kit-migration
 */
export default function ConfirmButtonWithModal({
    children,
    confirmationContent,
    confirmationTitle = 'Are you sure?',
    confirmationButtonIntent = 'destructive',
    onConfirm,
    onCancel,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    showCancelButton = true,
    modalSize = 'medium',
    ...rest
}: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleDisplayConfirmation = () => {
        setIsModalOpen(true)
    }

    const handleConfirm = () => {
        onConfirm?.()
        setIsModalOpen(false)
    }

    const handleCancel = () => {
        onCancel?.()
        setIsModalOpen(false)
    }

    const handleClose = () => {
        setIsModalOpen(false)
    }

    return (
        <>
            <Button {...rest} onClick={handleDisplayConfirmation}>
                {children}
            </Button>

            <Modal isOpen={isModalOpen} onClose={handleClose} size={modalSize}>
                <ModalHeader title={confirmationTitle} />

                <ModalBody>{confirmationContent}</ModalBody>

                <ModalActionsFooter>
                    {showCancelButton && (
                        <Button intent="secondary" onClick={handleCancel}>
                            {cancelLabel}
                        </Button>
                    )}
                    <Button
                        intent={confirmationButtonIntent}
                        onClick={handleConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </ModalActionsFooter>
            </Modal>
        </>
    )
}
