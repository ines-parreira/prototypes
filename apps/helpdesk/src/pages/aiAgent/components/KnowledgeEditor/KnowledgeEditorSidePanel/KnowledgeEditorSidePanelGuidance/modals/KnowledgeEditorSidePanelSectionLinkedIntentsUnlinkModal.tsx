import { useShallow } from 'zustand/react/shallow'

import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import { useGuidanceStore } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context'

import { usePersistLinkedIntents } from '../hooks/usePersistLinkedIntents'

type Props = {
    intentId: string | null
    onClose: () => void
}

export const KnowledgeEditorSidePanelSectionLinkedIntentsUnlinkModal = ({
    intentId,
    onClose,
}: Props) => {
    const { persistLinkedIntents, isUpdating: isUnlinking } =
        usePersistLinkedIntents()

    const guidanceIntentIds = useGuidanceStore(
        useShallow((storeState) => storeState.state.guidance?.intents ?? []),
    )

    const isOpen = intentId !== null

    const handleModalOpenChange = (nextIsOpen: boolean) => {
        if (!nextIsOpen && !isUnlinking) {
            onClose()
        }
    }

    const handleConfirmUnlink = () => {
        if (!intentId) return

        void persistLinkedIntents(
            guidanceIntentIds.filter((id) => id !== intentId),
            () => onClose(),
        )
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={handleModalOpenChange}
            size="sm"
            aria-label="Unlink intents from this guidance"
        >
            <OverlayHeader title="Unlink intents from this guidance?" />
            <OverlayContent>
                <Box paddingBottom="md">
                    <Text>
                        AI Agent won&apos;t prioritize this guidance when
                        responding to the linked intents.
                    </Text>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    <Button
                        variant="tertiary"
                        onClick={onClose}
                        isDisabled={isUnlinking}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        intent="destructive"
                        onClick={handleConfirmUnlink}
                        isLoading={isUnlinking}
                        isDisabled={isUnlinking}
                    >
                        Unlink
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
