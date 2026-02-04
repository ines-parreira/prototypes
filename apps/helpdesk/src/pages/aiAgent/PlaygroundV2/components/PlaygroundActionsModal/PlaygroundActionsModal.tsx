import type React from 'react'

import { useSessionStorage } from '@repo/hooks'

import {
    Box,
    Button,
    CheckBoxField,
    Heading,
    Modal,
    ModalSize,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import css from './PlaygroundActionsModal.less'

type PlaygroundActionsModalProps = {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

const PlaygroundActionsModal: React.FC<PlaygroundActionsModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
}) => {
    const [isConfirmed, setIsConfirmed] = useSessionStorage(
        'aiAgentPlaygroundActionsModalSelected',
        false,
    )

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onClose}
            size={ModalSize.Sm}
            aria-label="Enable Actions in test mode"
        >
            <OverlayHeader
                title={
                    <Heading size="xl">Enable Actions in test mode?</Heading>
                }
            />
            <OverlayContent>
                <div>
                    <Box flexDirection="column" className={css.modalContent}>
                        <Text>
                            When Actions are triggered in test mode, they use
                            live customer data. This means:
                        </Text>
                        <ul className={css.modalContentList}>
                            <li>Customer data may be updated or deleted</li>
                            <li>Real orders may be modified or cancelled</li>
                            <li>Changes cannot be undone</li>
                        </ul>
                    </Box>
                    <Box flexDirection="row" alignItems="flex-start">
                        <CheckBoxField
                            value={isConfirmed}
                            onChange={setIsConfirmed}
                            label="I understand that enabling Actions in test mode may cause irreversible changes to live customer data."
                        />
                    </Box>
                </div>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <div className={css.modalFooter}>
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        intent="destructive"
                        isDisabled={!isConfirmed}
                        onClick={onConfirm}
                    >
                        Enable Actions
                    </Button>
                </div>
            </OverlayFooter>
        </Modal>
    )
}

export default PlaygroundActionsModal
