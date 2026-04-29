import { useCallback, useState } from 'react'

import { Box, Button, Modal, OverlayHeader, Text, toast } from '@gorgias/axiom'

import type { IngestionLog } from 'pages/aiAgent/AiAgentScrapedDomainContent/types'
import { usePublicResourceMutation } from 'pages/aiAgent/hooks/usePublicResourcesMutation'
import { OPEN_DELETE_URL_MODAL } from 'pages/aiAgent/KnowledgeHub/constants'
import { useListenToDocumentEvent } from 'pages/aiAgent/KnowledgeHub/EmptyState/utils'
import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'

type Props = {
    helpCenterId: number
    urlIngestionLogs?: IngestionLog[]
    onRefetch: () => void
    onFolderChange: (folder: GroupedKnowledgeItem | null) => void
    onRemoveFolderParam: () => void
}

export const DeleteUrlModal = ({
    helpCenterId,
    urlIngestionLogs,
    onRefetch,
    onFolderChange,
    onRemoveFolderParam,
}: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedFolder, setSelectedFolder] =
        useState<GroupedKnowledgeItem | null>(null)

    const { deletePublicResource } = usePublicResourceMutation({
        helpCenterId,
    })

    const openModal = useCallback((event?: Event) => {
        const data = (event as CustomEvent)?.detail
        setIsOpen(true)
        if (data) {
            setSelectedFolder(data)
        }
    }, [])

    useListenToDocumentEvent(OPEN_DELETE_URL_MODAL, openModal)

    const handleCancel = useCallback(() => {
        setIsOpen(false)
        setSelectedFolder(null)
    }, [])

    const handleConfirm = useCallback(async () => {
        if (!selectedFolder) {
            return
        }

        // Find the ingestion log that matches the selected URL
        const ingestionLog = urlIngestionLogs?.find(
            (log) => log.url === selectedFolder.source,
        )

        if (!ingestionLog) {
            toast.error('Could not find URL to delete')
            return
        }

        try {
            await deletePublicResource(ingestionLog.id)
            setIsOpen(false)
            setSelectedFolder(null)
            onRemoveFolderParam()
            onFolderChange(null)
            onRefetch()

            toast.success('URL successfully deleted')
        } catch {
            toast.error(
                'Error during URL deletion. Try one more time or contact support',
            )
        }
    }, [
        selectedFolder,
        urlIngestionLogs,
        deletePublicResource,
        onFolderChange,
        onRefetch,
        onRemoveFolderParam,
    ])

    return (
        <Modal isOpen={isOpen} onOpenChange={handleCancel} size="sm">
            <Box flexDirection="column">
                <OverlayHeader title="Delete URL?" />
                <Box flexDirection="column" gap="sm">
                    <Text>Once deleted, this content can’t be restored.</Text>
                    <Text>
                        All snippets generated from this URL will be deleted.
                    </Text>
                </Box>
                <Box justifyContent="flex-end" gap="sm" marginTop="md">
                    <Button variant="tertiary" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        intent="destructive"
                        onClick={handleConfirm}
                    >
                        Delete URL
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}
