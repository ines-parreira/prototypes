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
    hasIncludedAudiences: boolean
}

const SendCampaignConfirmation = ({
    isOpen,
    onClose,
    onConfirm,
    hasIncludedAudiences,
}: Props) => {
    if (!hasIncludedAudiences) {
        return (
            <Modal size="sm" isOpen={isOpen} isDismissable={false}>
                <OverlayHeader title="Cannot Send Campaign" />
                <OverlayContent>
                    <Box gap="xs">
                        <Text>
                            This campaign has no audience attached. Add at least
                            one included audience before sending.
                        </Text>
                    </Box>
                </OverlayContent>
                <OverlayFooter>
                    <Box gap="xs">
                        <Button variant="secondary" onClick={onClose}>
                            Close
                        </Button>
                    </Box>
                </OverlayFooter>
            </Modal>
        )
    }

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
