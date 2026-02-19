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

const COMMIT_MESSAGE_CHARACTER_LIMIT = 280

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

    const handleCommitMessageChange = (value: string) => {
        setCommitMessage(value.slice(0, COMMIT_MESSAGE_CHARACTER_LIMIT))
    }

    const handlePublish = () => {
        onPublish(commitMessage.trim()).then(() => setCommitMessage(''))
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
                <Box width="100%">
                    <TextAreaField
                        label="Change summary (optional)"
                        placeholder="Updated return window from 15 to 30 days"
                        value={commitMessage}
                        onChange={handleCommitMessageChange}
                        onKeyDown={handleKeyDown}
                        caption={`Briefly describe what changed in this version. ${commitMessage.length}/${COMMIT_MESSAGE_CHARACTER_LIMIT}`}
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
