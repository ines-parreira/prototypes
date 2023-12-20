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

export type GorgiasChatCreationWizardQuickResponseNotConfiguredModalHandle = {
    open: () => void
}

type Props = {
    onSave: () => void
}

const GorgiasChatCreationWizardQuickResponseNotConfiguredModal = (
    {onSave}: Props,
    ref: ForwardedRef<GorgiasChatCreationWizardQuickResponseNotConfiguredModalHandle>
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
            <ModalHeader title="Missing responses" />
            <ModalBody>
                You have Quick Responses without a response configured. A ticket
                will be created when customers interact with them.
                <br />
                <br />
                Are you sure you want to continue with installation?
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" onClick={() => setIsOpen(false)}>
                    Configure Response
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
    GorgiasChatCreationWizardQuickResponseNotConfiguredModalHandle,
    Props
>(GorgiasChatCreationWizardQuickResponseNotConfiguredModal)
