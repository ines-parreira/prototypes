import { LegacyButton as Button, Heading, Icon, Text } from '@gorgias/axiom'

import modalImage from 'assets/img/ai-agent/ai_agent_onboarding_thankyou.png'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'

import css from './PostGoLiveModal.less'

type Props = {
    isOpen: boolean
    handleOnClose: () => void
}

export const PostGoLiveModal: React.FC<Props> = ({ isOpen, handleOnClose }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={handleOnClose}
            classNameDialog={css.modal}
            preventCloseClickOutside
        >
            <div className={css.modalImage}>
                <img src={modalImage} alt="Setup complete" />
                <div className={css.closeButtonWrapper}>
                    <Button
                        fillStyle="ghost"
                        intent="secondary"
                        size="medium"
                        onClick={handleOnClose}
                        className={css.closeButton}
                        aria-label="Close"
                    >
                        <Icon name="close" />
                    </Button>
                </div>
            </div>
            <ModalBody className={css.modalBody}>
                <Heading size="md">{`You\'re all done!`}</Heading>
                <Text size="md" variant="regular">
                    Great work completing all tasks.
                </Text>
            </ModalBody>
            <ModalFooter className={css.modalFooter}>
                <Button
                    intent="primary"
                    fillStyle="fill"
                    onClick={handleOnClose}
                >
                    Got it
                </Button>
            </ModalFooter>
        </Modal>
    )
}
