import { useCallback, useState } from 'react'

import { Box, Button, Heading, Modal, Text } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import type { IngestionLog } from 'pages/aiAgent/AiAgentScrapedDomainContent/types'
import { usePublicResourceMutation } from 'pages/aiAgent/hooks/usePublicResourcesMutation'
import { OPEN_DELETE_URL_MODAL } from 'pages/aiAgent/KnowledgeHub/constants'
import { useListenToDocumentEvent } from 'pages/aiAgent/KnowledgeHub/EmptyState/utils'
import type { GroupedKnowledgeItem } from 'pages/aiAgent/KnowledgeHub/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

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

    const dispatch = useAppDispatch()
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
            dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Could not find URL to delete',
                }),
            )
            return
        }

        try {
            await deletePublicResource(ingestionLog.id)
            setIsOpen(false)
            setSelectedFolder(null)
            onRemoveFolderParam()
            onFolderChange(null)
            onRefetch()

            dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'URL successfully deleted',
                }),
            )
        } catch {
            dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        'Error during URL deletion. Try one more time or contact support',
                }),
            )
        }
    }, [
        selectedFolder,
        urlIngestionLogs,
        deletePublicResource,
        dispatch,
        onFolderChange,
        onRefetch,
        onRemoveFolderParam,
    ])

    return (
        <Modal isOpen={isOpen} onOpenChange={handleCancel} size="sm">
            <Box flexDirection="column" gap="md">
                <Heading slot="title">Delete URL?</Heading>
                <Box flexDirection="column" gap="sm">
                    <Text>Once deleted, this content can’t be restored.</Text>
                    <Text>
                        All snippets generated from this URL will be deleted.
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
