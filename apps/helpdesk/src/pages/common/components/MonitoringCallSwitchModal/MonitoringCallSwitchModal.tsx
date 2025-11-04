import { Button } from '@gorgias/axiom'

import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import VoiceCallAgentLabel from 'pages/common/components/VoiceCallAgentLabel/VoiceCallAgentLabel'

import css from './MonitoringCallSwitchModal.less'

type Props = {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    newMonitoredAgentId: number | null
}

export default function MonitoringCallSwitchModal({
    isOpen,
    onClose,
    onConfirm,
    newMonitoredAgentId,
}: Props) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            isClosable={false}
            size="medium"
        >
            <ModalHeader title="Switch call?" />
            <ModalBody>
                You can only listen to one call at a time. Do you want to stop
                listening to the previous agent and start listening to{' '}
                {newMonitoredAgentId ? (
                    <VoiceCallAgentLabel
                        agentId={newMonitoredAgentId}
                        className={css.inlineAgent}
                    />
                ) : (
                    'this agent'
                )}{' '}
                instead?
            </ModalBody>
            <ModalActionsFooter>
                <Button variant="secondary" onClick={onClose}>
                    No, continue listening
                </Button>
                <Button onClick={onConfirm}>Yes, switch call</Button>
            </ModalActionsFooter>
        </Modal>
    )
}
