import { useCallback, useState } from 'react'

import { Box, Button, Heading, Modal, Text } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { useFileIngestion } from 'pages/aiAgent/hooks/useFileIngestion'
import type { Components } from 'rest_api/help_center_api/client.generated'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { OPEN_DELETE_DOCUMENT_MODAL } from '../constants'
import type { GroupedKnowledgeItem } from '../types'
import { useListenToDocumentEvent } from './utils'

type Props = {
    helpCenterId: number
    fileIngestionLogs?: Components.Schemas.RetrieveFileIngestionLogDto[]
    onRefetch: () => void
    onFolderChange: (folder: GroupedKnowledgeItem | null) => void
}

export const DeleteDocumentModal = ({
    helpCenterId,
    fileIngestionLogs,
    onRefetch,
    onFolderChange,
}: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedFolder, setSelectedFolder] =
        useState<GroupedKnowledgeItem | null>(null)

    const dispatch = useAppDispatch()
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

        // Find the file ingestion log that matches the selected document
        const fileIngestionLog = fileIngestionLogs?.find(
            (log) => log.filename === selectedFolder.source,
        )

        if (!fileIngestionLog) {
            dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Could not find document to delete',
                }),
            )
            return
        }

        try {
            await deleteIngestedFile(fileIngestionLog.id)
            setIsOpen(false)
            setSelectedFolder(null)
            onFolderChange(null)
            onRefetch()

            dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Document successfully deleted',
                }),
            )
        } catch {
            dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'Error during document deletion. Try one more time or contact support',
                }),
            )
        }
    }, [
        selectedFolder,
        fileIngestionLogs,
        deleteIngestedFile,
        dispatch,
        onFolderChange,
        onRefetch,
    ])

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={handleCancel}
            size="sm"
            aria-label="Delete document"
        >
            <Box flexDirection="column" gap="md">
                <Heading slot="title">Delete document?</Heading>
                <Box flexDirection="column" gap="sm">
                    <Text>
                        Once deleted, this content can&apos;t be restored.
                    </Text>
                    <Text>
                        All snippets generated from this document will be
                        deleted.
                    </Text>
                </Box>
                <Box justifyContent="flex-end" gap="sm">
                    <Button variant="secondary" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        intent="destructive"
                        onClick={handleConfirm}
                    >
                        Delete
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}
