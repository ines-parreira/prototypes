import React, { ComponentProps } from 'react'

import { ModalHeader } from 'reactstrap'

import { Button } from '@gorgias/axiom'

import { SenderInformation } from 'models/singleSenderVerification/types'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'

import VerificationForm, {
    FORM_ID,
} from '../EmailOutboundVerification/VerificationForm/VerificationForm'

type Props = Pick<
    ComponentProps<typeof VerificationForm>,
    'initialValues' | 'onSubmit'
> & {
    isOpen: boolean
    setIsOpen: (value: boolean) => void
    onConfirm: (values: SenderInformation) => void
    onClose?: () => void
    isLoading?: boolean
}

export default function SingleSenderVerificationFormModal({
    isOpen,
    setIsOpen,
    onConfirm,
    onClose,
    initialValues,
    isLoading,
}: Props) {
    const handleClose = () => {
        onClose?.()
        setIsOpen(false)
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            {/* keep condition to prevent form from being rendered
             *  and submitted multiple times */}
            {isOpen && (
                <>
                    <ModalHeader>Submit mailing address</ModalHeader>
                    <ModalBody>
                        <VerificationForm
                            initialValues={initialValues}
                            onSubmit={onConfirm}
                        />
                    </ModalBody>
                    <ModalActionsFooter>
                        <Button intent="secondary" onClick={handleClose}>
                            Close
                        </Button>
                        <Button
                            type="submit"
                            form={FORM_ID}
                            isLoading={isLoading}
                        >
                            Submit
                        </Button>
                    </ModalActionsFooter>
                </>
            )}
        </Modal>
    )
}
