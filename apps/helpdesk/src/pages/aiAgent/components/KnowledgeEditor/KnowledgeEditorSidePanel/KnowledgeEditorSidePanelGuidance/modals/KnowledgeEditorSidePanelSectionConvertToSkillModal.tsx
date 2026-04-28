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
    isLoading: boolean
    onClose: () => void
    onConvertToSkill: () => void
}

export const KnowledgeEditorSidePanelSectionConvertToSkillModal = ({
    isOpen,
    isLoading,
    onClose,
    onConvertToSkill,
}: Props) => {
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onClose}
            size="sm"
            aria-label="Convert to skill"
        >
            <OverlayHeader title="Convert guidance into a skill?" />
            <OverlayContent>
                <Box paddingBottom="md">
                    <Text>
                        Your guidance will become a skill. Once you link intents
                        to it, AI Agent will follow this skill&apos;s
                        instructions every time it detects a matching
                        conversation. This guidance will be removed from your
                        knowledge. This can&apos;t be undone.
                    </Text>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="sm" justifyContent="flex-end">
                    <Button
                        variant="tertiary"
                        onClick={onClose}
                        isDisabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConvertToSkill}
                        isLoading={isLoading}
                    >
                        Convert to skill
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
