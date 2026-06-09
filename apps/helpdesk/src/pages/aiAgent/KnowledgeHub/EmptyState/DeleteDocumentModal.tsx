import { useCallback, useState } from 'react'

import { Box, Button, Modal, OverlayHeader, Text, toast } from '@gorgias/axiom'

import { useFileIngestion } from 'pages/aiAgent/hooks/useFileIngestion'
import type { Components } from 'rest_api/help_center_api/client.generated'

import { OPEN_DELETE_DOCUMENT_MODAL } from '../constants'
import type { GroupedKnowledgeItem } from '../types'
import { useListenToDocumentEvent } from './utils'

type Props = {
    helpCenterId: number
    fileIngestionLogs?: Components.Schemas.RetrieveFileIngestionLogDto[]
    onRefetch: () => void
    onFolderChange: (folder: GroupedKnowledgeItem | null) => void
    onRemoveFolderParam: () => void
}

export const DeleteDocumentModal = ({
    helpCenterId,
    fileIngestionLogs,
    onRefetch,
    onFolderChange,
    onRemoveFolderParam,
}: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedFolder, setSelectedFolder] =
        useState<GroupedKnowledgeItem | null>(null)

    const { deleteIngestedFile } = useFileIngestion({
        helpCenterId,
    })

    const openModal = useCallback((event?: Event) => {
        const data = (event as CustomEvent)?.detail
        setIsOpen(true)
        if (data) {
            setSelectedFolder(data)
        }
    }, [])

    useListenToDocumentEvent(OPEN_DELETE_DOCUMENT_MODAL, openModal)

    const handleCancel = useCallback(() => {
        setIsOpen(false)
        setSelectedFolder(null)
    }, [])

    const handleConfirm = useCallback(async () => {
        if (!selectedFolder) {
            return
        }

        // Find the file ingestion log that matches the selected document.
        // Prefer the ingestion id so same-named files target the right ingestion;
        // fall back to filename when the id isn't available.
        const fileIngestionLog = fileIngestionLogs?.find((log) =>
            selectedFolder.ingestionId !== undefined
                ? log.id === selectedFolder.ingestionId
                : log.filename === selectedFolder.source,
        )

        if (!fileIngestionLog) {
            toast.error('Could not find document to delete')
            return
        }

        try {
            await deleteIngestedFile(fileIngestionLog.id)
            setIsOpen(false)
            setSelectedFolder(null)
            onRemoveFolderParam()
            onFolderChange(null)
            onRefetch()

            toast.success('Document successfully deleted')
        } catch {
            toast.error(
                'Error during document deletion. Try one more time or contact support',
            )
        }
    }, [
        selectedFolder,
        fileIngestionLogs,
        deleteIngestedFile,
        onFolderChange,
        onRefetch,
        onRemoveFolderParam,
    ])

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={handleCancel}
            size="sm"
            aria-label="Delete document"
        >
            <Box flexDirection="column">
                <OverlayHeader title="Delete document?" />
                <Box flexDirection="column" gap="sm">
                    <Text>
                        Once deleted, this content can&apos;t be restored.
                    </Text>
                    <Text>
                        All snippets generated from this document will be
                        deleted.
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
                        Delete document
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}
