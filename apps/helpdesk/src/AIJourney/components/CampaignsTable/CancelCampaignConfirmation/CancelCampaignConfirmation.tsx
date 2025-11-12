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

const CancelCampaignConfirmation = ({ isOpen, onClose, onConfirm }: Props) => {
    return (
        <Modal size="sm" isOpen={isOpen} isDismissable={false}>
            <OverlayHeader title="Cancel Campaign?" />
            <OverlayContent>
                <Box gap="xs">
                    <Text>You’re about to cancel this campaign.</Text>
                </Box>
            </OverlayContent>
            <OverlayFooter>
                <Box gap="xs">
                    <Button variant="secondary" onClick={onClose}>
                        Go back
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        intent="regular"
                    >
                        Cancel Campaign
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}

export default CancelCampaignConfirmation
