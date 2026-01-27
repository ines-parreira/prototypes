import { useState } from 'react'

import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    TextAreaField,
} from '@gorgias/axiom'

type PublishConfirmationModalProps = {
    isOpen: boolean
    isPublishing: boolean
    onClose: () => void
    onPublish: (commitMessage: string) => Promise<void>
}

export const PublishConfirmationModal = ({
    isOpen,
    isPublishing,
    onClose,
    onPublish,
}: PublishConfirmationModalProps) => {
    const [commitMessage, setCommitMessage] = useState('')

    const handlePublish = () => {
        onPublish(commitMessage).then(() => setCommitMessage(''))
    }

    const handleClose = () => {
        setCommitMessage('')
        onClose()
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !isPublishing) {
            event.preventDefault()
            handlePublish()
        }
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={handleClose} size="sm">
            <OverlayHeader title="Publish changes" />
            <OverlayContent>
                <Box paddingBottom="md" width="100%">
                    <TextAreaField
                        label="Add a short description of your changes (optional)"
                        placeholder="e.g. Updated pricing information"
                        value={commitMessage}
                        onChange={setCommitMessage}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        rows={3}
                    />
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    <Button
                        variant="tertiary"
                        onClick={handleClose}
                        isDisabled={isPublishing}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handlePublish}
                        isLoading={isPublishing}
                    >
                        Publish
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
