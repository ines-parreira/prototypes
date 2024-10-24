import React from 'react'

import Button from 'pages/common/components/button/Button'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalFooter from 'pages/common/components/modal/ModalFooter'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import PromptModal, {
    PromptModalContext,
} from 'pages/common/components/PromptModal'

import css from './DiscardNewHelpCenterPrompt.less'

type Props = {
    when: boolean
}

const DiscardNewHelpCenterPrompt: React.FC<Props> = ({when}) => (
    <PromptModal when={when}>
        <PromptModalContext.Consumer>
            {({hideModal, redirectToOriginalLocation}) => (
                <>
                    <ModalHeader title="Discard new help center?" />
                    <ModalBody className={css.body}>
                        You will lose all information entered for this help
                        center.
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
                            Discard Help Center
                        </Button>
                    </ModalFooter>
                </>
            )}
        </PromptModalContext.Consumer>
    </PromptModal>
)

export default DiscardNewHelpCenterPrompt
