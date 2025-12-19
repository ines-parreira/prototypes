import { LegacyButton as Button } from '@gorgias/axiom'

import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import PromptModal, {
    PromptModalContext,
} from 'pages/common/components/PromptModal'

import css from './DiscardNewChatPrompt.less'

type Props = {
    when: boolean
}

const DiscardNewChatPrompt: React.FC<Props> = ({ when }) => (
    <PromptModal when={when}>
        <PromptModalContext.Consumer>
            {({ hideModal, redirectToOriginalLocation }) => (
                <>
                    <ModalHeader title="Discard new chat?" />
                    <ModalBody className={css.body}>
                        You will lose all information entered for this chat.
                    </ModalBody>
                    <ModalFooter className={css.footer}>
                        <Button
                            intent="secondary"
                            onClick={hideModal}
                            className="mr-2"
                        >
                            Keep it
                        </Button>
                        <Button
                            intent="destructive"
                            onClick={redirectToOriginalLocation}
                        >
                            Discard Chat
                        </Button>
                    </ModalFooter>
                </>
            )}
        </PromptModalContext.Consumer>
    </PromptModal>
)

export default DiscardNewChatPrompt
