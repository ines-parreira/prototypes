import React, {ComponentProps} from 'react'
import {ModalHeader} from 'reactstrap'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import Button from 'pages/common/components/button/Button'
import VerificationForm, {
    FORM_ID,
} from '../EmailOutboundVerification/VerificationForm/VerificationForm'

type Props = Pick<
    ComponentProps<typeof VerificationForm>,
    'initialValues' | 'onSubmit'
> & {
    isOpen: boolean
    setIsOpen: (value: boolean) => void
    onConfirm: () => void
}

export default function SingleSenderVerificationFormModal({
    isOpen,
    setIsOpen,
    onConfirm,
    initialValues,
}: Props) {
    return (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
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
                        <Button
                            intent="secondary"
                            onClick={() => setIsOpen(false)}
                        >
                            Close
                        </Button>
                        <Button type="submit" form={FORM_ID}>
                            Submit
                        </Button>
                    </ModalActionsFooter>
                </>
            )}
        </Modal>
    )
}
