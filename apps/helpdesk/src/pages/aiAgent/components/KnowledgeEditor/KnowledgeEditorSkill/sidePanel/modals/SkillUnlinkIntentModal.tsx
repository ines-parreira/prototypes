import { useShallow } from 'zustand/react/shallow'

import {
    Box,
    Button,
    Heading,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import { useSkillEditorStore } from '../../context/KnowledgeEditorSkillContext'
import { usePersistLinkedIntentsSkill } from '../hooks/usePersistLinkedIntentsSkill'

type Props = {
    intentId: string | null
    onClose: () => void
}

export const SkillUnlinkIntentModal = ({ intentId, onClose }: Props) => {
    const { unlinkIntent, isUpdating: isUnlinking } =
        usePersistLinkedIntentsSkill()

    const skillIntentIds = useSkillEditorStore(
        useShallow((storeState) => storeState.state.intents),
    )

    const isOpen = intentId !== null

    const handleModalOpenChange = (nextIsOpen: boolean) => {
        if (!nextIsOpen && !isUnlinking) {
            onClose()
        }
    }

    const handleConfirmUnlink = () => {
        if (!intentId) return

        void unlinkIntent(intentId, skillIntentIds, () => onClose())
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={handleModalOpenChange}
            size="sm"
            aria-label="Unlink intent"
        >
            <OverlayHeader
                title={<Heading size="lg">Unlink intent?</Heading>}
            />
            <OverlayContent>
                <Box paddingBottom="md" mb={10}>
                    <Text>
                        This intent will become unlinked. AI Agent won&apos;t
                        prioritize this skill for questions related to it.
                    </Text>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box flexDirection="row" justifyContent="flex-end" gap="sm">
                    <Button
                        variant="secondary"
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
