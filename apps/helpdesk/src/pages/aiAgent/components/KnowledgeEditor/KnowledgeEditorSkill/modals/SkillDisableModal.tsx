import {
    Box,
    Button,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import { useSkillDisableModal } from './useSkillDisableModal'

export const SkillDisableModal = () => {
    const { isOpen, isDisabling, onClose, onDisable } = useSkillDisableModal()

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="sm">
            <OverlayHeader title="Disable skill?" />
            <OverlayContent>
                <Box paddingBottom="md">
                    <Text size="md">
                        Disabling this skill means AI Agent will use your
                        knowledge to handle conversations for the linked intents
                        instead.
                    </Text>
                </Box>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Box gap="xs" justifyContent="flex-end" width="100%">
                    <Button
                        variant="tertiary"
                        onClick={onClose}
                        isDisabled={isDisabling}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        intent="destructive"
                        onClick={onDisable}
                        isLoading={isDisabling}
                    >
                        Disable
                    </Button>
                </Box>
            </OverlayFooter>
        </Modal>
    )
}
