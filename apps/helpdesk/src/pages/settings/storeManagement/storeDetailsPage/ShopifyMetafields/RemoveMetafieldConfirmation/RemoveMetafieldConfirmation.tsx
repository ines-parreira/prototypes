import React from 'react'

import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
} from '@gorgias/axiom'

type Props = {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

const RemoveMetafieldConfirmation = ({ isOpen, onClose, onConfirm }: Props) => {
    const handleConfirm = () => {
        onConfirm()
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onClose()
                }
            }}
            size="sm"
            isDismissable
        >
            <OverlayHeader title="Remove metafield?" />

            <OverlayContent>
                <Box>
                    Once removed, the metafield data won&apos;t be available to
                    use in Gorgias, or to view in the customer profile. You can
                    add it back at any time.
                </Box>
            </OverlayContent>

            <OverlayFooter>
                <Button onClick={handleConfirm}>Remove</Button>
            </OverlayFooter>
        </Modal>
    )
}

export default RemoveMetafieldConfirmation
