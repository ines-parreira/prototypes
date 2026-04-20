import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import { formatIntentName } from 'pages/aiAgent/skills/utils'

import { useSkillDeleteModal } from './useSkillDeleteModal'

export const SkillDeleteModal = () => {
    const { isOpen, isDeleting, hasBothVersions, intents, onClose, onDelete } =
        useSkillDeleteModal()

    const formattedIntents = intents.map(formatIntentName)
    const hasIntents = formattedIntents.length > 0

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="sm">
            <OverlayHeader title="Delete skill?" />
            <OverlayContent>
                <Box paddingBottom="md">
                    <Text size="md">
                        {hasIntents ? (
                            <>
                                This can&apos;t be undone.{' '}
                                {formattedIntents.map((name, index) => (
                                    <span key={name}>
                                        {index > 0 && ', '}
                                        <Text
                                            as="span"
                                            size="md"
                                            variant="bold"
                                        >
                                            {name}
                                        </Text>
                                    </span>
                                ))}{' '}
                                intents will be unlinked, and AI Agent will use
                                your knowledge to handle those conversations
                                instead.
                            </>
                        ) : (
                            <>
                                This can&apos;t be undone.
                                {hasBothVersions &&
                                    ' Both the draft and the published version will be permanently deleted.'}
                            </>
                        )}
                    </Text>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    <Button
                        variant="tertiary"
                        onClick={onClose}
                        isDisabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        intent="destructive"
                        onClick={onDelete}
                        isLoading={isDeleting}
                    >
                        Delete
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
