import React from 'react'

import {
    Button,
    ButtonIntent,
    ButtonSize,
    ButtonVariant,
    Modal,
    ModalSize,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import css from './DisconnectStoreModal.less'

type DisconnectStoreModalProps = {
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    onDisconnect: () => void | Promise<void>
    isDisconnectPending: boolean
    isOneClickInstallation: boolean
}

const DisconnectStoreModal = ({
    isOpen,
    onOpenChange,
    onDisconnect,
    isDisconnectPending,
    isOneClickInstallation,
}: DisconnectStoreModalProps) => {
    return (
        <Modal size={ModalSize.Md} isOpen={isOpen} onOpenChange={onOpenChange}>
            <OverlayHeader title="Disconnect store?" />
            <OverlayContent>
                <Text>
                    {isOneClickInstallation
                        ? 'Disconnecting this store will remove AI Agent features and uninstall the chat from your store, removing it from all pages.'
                        : 'Disconnecting this store will remove AI Agent features from your chat widget.'}
                </Text>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <div className={css.footer}>
                    <Button
                        intent={ButtonIntent.Regular}
                        size={ButtonSize.Md}
                        variant={ButtonVariant.Secondary}
                        isDisabled={isDisconnectPending}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        intent={ButtonIntent.Destructive}
                        size={ButtonSize.Md}
                        variant={ButtonVariant.Primary}
                        onClick={onDisconnect}
                        isLoading={isDisconnectPending}
                    >
                        Disconnect
                    </Button>
                </div>
            </OverlayFooter>
        </Modal>
    )
}

export default DisconnectStoreModal
