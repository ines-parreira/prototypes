import React, {
    useImperativeHandle,
    useState,
    ForwardedRef,
    forwardRef,
} from 'react'

import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import Button from 'pages/common/components/button/Button'

export type GorgiasChatCreationWizardQuickResponseNotEnabledModalHandle = {
    open: () => void
}

type Props = {
    onSave: () => void
}

const GorgiasChatCreationWizardQuickResponseNotEnabledModal = (
    {onSave}: Props,
    ref: ForwardedRef<GorgiasChatCreationWizardQuickResponseNotEnabledModalHandle>
) => {
    const [isOpen, setIsOpen] = useState(false)

    useImperativeHandle(
        ref,
        () => ({
            open: () => setIsOpen(true),
        }),
        []
    )

    return (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <ModalHeader title="Responses not enabled" />
            <ModalBody>
                You have Quick Responses with a response configured but not
                enabled. Customers will not be able to interact with them.
                <br />
                <br />
                Are you sure you want to continue with installation?
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" onClick={() => setIsOpen(false)}>
                    Enable Quick Responses
                </Button>
                <Button
                    onClick={() => {
                        setIsOpen(false)
                        onSave()
                    }}
                >
                    Continue With Installation
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}

export default forwardRef<
    GorgiasChatCreationWizardQuickResponseNotEnabledModalHandle,
    Props
>(GorgiasChatCreationWizardQuickResponseNotEnabledModal)
