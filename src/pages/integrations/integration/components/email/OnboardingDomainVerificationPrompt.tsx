import React from 'react'

import warningIcon from 'assets/img/icons/warning.svg'
import Button from 'pages/common/components/button/Button'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import PromptModal, {
    PromptModalContext,
} from 'pages/common/components/PromptModal'

import css from './OnboardingDomainVerificationPrompt.less'

type Props = {
    when: boolean
}

export default function OnboardingDomainVerificationPrompt({when}: Props) {
    return (
        <PromptModal when={when}>
            <PromptModalContext.Consumer>
                {({hideModal, redirectToOriginalLocation}) => (
                    <>
                        <ModalHeader
                            title={
                                <div className={css.title}>
                                    <img
                                        src={warningIcon}
                                        className={css.warningIcon}
                                        alt="icon"
                                    />
                                    <div>Your email setup is incomplete!</div>
                                </div>
                            }
                        />
                        <ModalBody className={css.body}>
                            You must complete{' '}
                            <strong>Domain Verification</strong> in order to
                            send emails using Gorgias. Return to this setup
                            wizard to complete domain verification.
                        </ModalBody>
                        <ModalActionsFooter>
                            <Button
                                intent="secondary"
                                onClick={redirectToOriginalLocation}
                            >
                                Finish later
                            </Button>
                            <Button onClick={hideModal}>Verify domain</Button>
                        </ModalActionsFooter>
                    </>
                )}
            </PromptModalContext.Consumer>
        </PromptModal>
    )
}
