import React from 'react'

import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

type Props = {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

const SendCampaignConfirmation = ({ isOpen, onClose, onConfirm }: Props) => {
    return (
        <Modal size="sm" isOpen={isOpen} isDismissable={false}>
            <OverlayHeader title="Send Campaign?" />
            <OverlayContent>
                <Box gap="xs">
                    <Text>You’re about to send this campaign.</Text>
                </Box>
            </OverlayContent>
            <OverlayFooter>
                <Box gap="xs">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        intent="regular"
                    >
                        Send
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}

export default SendCampaignConfirmation
