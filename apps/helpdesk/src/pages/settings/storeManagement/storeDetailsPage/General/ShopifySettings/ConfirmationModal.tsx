import type { ReactNode } from 'react'
import React from 'react'

import { ModalHeader } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'

import css from './ConfirmationModal.less'

type ConfirmationModalProps = {
    isOpen: boolean
    setIsOpen: (value: boolean) => void
    onConfirm?: () => void
    onCancel?: () => void
    isLoading?: boolean
    title: string
    children: ReactNode
    confirmButtonText: string
    confirmButtonIntent?: 'primary' | 'secondary' | 'destructive'
}

export default function ConfirmationModal({
    isOpen,
    setIsOpen,
    onConfirm,
    onCancel,
    isLoading,
    title,
    children,
    confirmButtonText,
}: ConfirmationModalProps) {
    const handleConfirmClick = () => {
        onConfirm?.()
        setIsOpen(false)
    }

    const handleCancelClick = () => {
        setIsOpen(false)
        onCancel?.()
    }

    return (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <ModalHeader>{title}</ModalHeader>
            <ModalBody>{children}</ModalBody>
            <ModalFooter className={css.footerActions}>
                <Button
                    fillStyle="ghost"
                    intent="secondary"
                    onClick={handleCancelClick}
                >
                    Close
                </Button>
                <Button
                    onClick={handleConfirmClick}
                    isLoading={isLoading}
                    intent="destructive"
                >
                    {confirmButtonText}
                </Button>
            </ModalFooter>
        </Modal>
    )
}
