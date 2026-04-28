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
            <OverlayHeader title="Send campaign now?" />
            <OverlayContent>
                <Box gap="xs">
                    <Text>
                        This campaign will be sent to your audience immediately.
                        Are you sure you want to proceed?
                    </Text>
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
                        Send now
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}

export default SendCampaignConfirmation
