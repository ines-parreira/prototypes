import type { ReactNode } from 'react'

import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import css from 'pages/integrations/integration/components/email/CustomerOnboarding/OnboardingDomainVerificationPrompt.less'

type Props = {
    showModal: boolean
    title: string
    description: string
    onCloseCleanup?: () => void
    children?: ReactNode
}

export default function EmailGenericModal({
    showModal,
    title,
    description,
    onCloseCleanup = () => ({}),
    children,
}: Props) {
    return (
        <Modal isOpen={showModal} onClose={onCloseCleanup} isClosable={false}>
            <ModalHeader
                title={
                    <div className={css.title}>
                        <div>{title}</div>
                    </div>
                }
            />

            <ModalBody className={css.body}>{description}</ModalBody>
            <ModalActionsFooter>{children}</ModalActionsFooter>
        </Modal>
    )
}
