import { Box, Button, Heading, Modal, Text } from '@gorgias/axiom'

import type { GroupedKnowledgeItem } from '../../types'

type DeleteConfirmationModalProps = {
    isOpen: boolean
    selectedItems: GroupedKnowledgeItem[]
    onConfirm: () => void
    onCancel: () => void
}

export const DeleteConfirmationModal = ({
    isOpen,
    selectedItems,
    onConfirm,
    onCancel,
}: DeleteConfirmationModalProps) => {
    const itemCount = selectedItems.length

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onCancel}
            size="sm"
            aria-label="Delete confirmation"
        >
            <Box flexDirection="column" gap="md">
                <Heading slot="title">
                    Delete {itemCount} {itemCount === 1 ? 'item' : 'items'}?
                </Heading>
                <Box flexDirection="column" gap="sm">
                    <Text>
                        Once deleted, this content can&apos;t be restored.
                    </Text>
                    <Text>
                        Help Center articles will be deleted from both knowledge
                        and your Help Center settings.
                    </Text>
                </Box>
                <Box justifyContent="flex-end" gap="sm">
                    <Button variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        intent="destructive"
                        onClick={onConfirm}
                    >
                        Delete {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}
