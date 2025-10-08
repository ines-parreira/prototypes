import { Button, Heading, Icon, IconButton, Text } from '@gorgias/axiom'

import modalImage from 'assets/img/ai-agent/ai_agent_onboarding_thankyou.png'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'

import css from './PostOnboardingLiveModal.less'

type Props = {
    isOpen: boolean
    channel: 'email' | 'chat'
    handleOnClose: () => void
}

export const PostOnboardingLiveModal: React.FC<Props> = ({
    isOpen,
    channel,
    handleOnClose,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={handleOnClose}
            classNameDialog={css.modal}
            preventCloseClickOutside
        >
            <div className={css.modalImage}>
                <img src={modalImage} alt="AI Agent is live" />
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
                <Heading size="md">
                    {`AI Agent is now live on your ${channel}!`}
                </Heading>
                <Text size="md" variant="regular">
                    Your AI Agent will start to{' '}
                    <span className={css.highlight}>
                        automatically answer customer questions{' '}
                    </span>
                    on {`${channel}`}, freeing up your team to connect with
                    customers and resolve complex tasks. Return here to review
                    AI Agent&apos;s performance and find insights to improve
                    over time.
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
