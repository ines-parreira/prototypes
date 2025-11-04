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

const RemoveCampaignConfirmation = ({ isOpen, onClose, onConfirm }: Props) => {
    return (
        <Modal size="sm" isOpen={isOpen} isDismissable={false}>
            <OverlayHeader title="Delete Campaign?" />
            <OverlayContent>
                <Box gap="xs">
                    <Text>
                        You’re about to delete this campaign. To create a new
                        one click Create Campaign and follow the steps again.
                    </Text>
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
                        intent="destructive"
                    >
                        Delete
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}

export default RemoveCampaignConfirmation
