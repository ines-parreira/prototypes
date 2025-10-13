import { ReactNode } from 'react'

import {
    LegacyButton as Button,
    Heading,
    Icon,
    LegacyIconButton as IconButton,
    Text,
} from '@gorgias/axiom'

import modalImage from 'assets/img/ai-agent/ai_agent_onboarding_thankyou.png'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'

import css from './SuccessModal.less'

type Props = {
    isOpen: boolean
    title: string
    description: string | ReactNode
    actionLabel: string
    handleOnClose: () => void
}

export const SuccessModal = ({
    isOpen,
    title,
    description,
    actionLabel,
    handleOnClose,
}: Props) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={handleOnClose}
            classNameDialog={css.modal}
            preventCloseClickOutside
        >
            <div className={css.modalImage}>
                <img
                    src={modalImage}
                    alt="Confirmation for successful action "
                />
                <IconButton
                    icon={<Icon name="close" />}
                    fillStyle="ghost"
                    intent="secondary"
                    size="medium"
                    onClick={handleOnClose}
                    className={css.closeButton}
                />
            </div>
            <ModalBody className={css.modalBody}>
                <Heading size="md">{title}</Heading>
                <Text size="md" variant="regular">
                    {description}
                </Text>
            </ModalBody>
            <ModalFooter className={css.modalFooter}>
                <Button
                    intent="primary"
                    fillStyle="fill"
                    onClick={handleOnClose}
                >
                    {actionLabel}
                </Button>
            </ModalFooter>
        </Modal>
    )
}
