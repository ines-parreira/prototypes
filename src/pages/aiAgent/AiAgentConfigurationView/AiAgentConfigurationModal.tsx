import React from 'react'

import Button from 'pages/common/components/button/Button'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import { assetsUrl } from 'utils'

import css from './AiAgentConfigurationModal.less'

type AiAgentConfigurationModalProps = {
    isOpen: boolean
    onClose: () => void
    onShowMe: () => void
}

export const AiAgentConfigurationModal: React.FC<
    AiAgentConfigurationModalProps
> = (props) => {
    const { isOpen, onClose, onShowMe } = props

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="medium">
            <ModalHeader title="" className={css.header} />
            <ModalBody className={css.body}>
                <div>
                    <div className="heading-page-semibold">
                        AI Agent is now live!
                    </div>
                    <div className="heading-page-semibold">
                        You can review tickets served by AI Agent in a dedicated
                        section under Tickets &#8594; Views
                    </div>
                </div>
                <img
                    alt="ai agent ticket view"
                    src={assetsUrl('/img/ai-agent/ai-agent-ticket-view.png')}
                    width={520}
                    height={284}
                />
                <Button onClick={onShowMe}>Show Me</Button>
            </ModalBody>
        </Modal>
    )
}
