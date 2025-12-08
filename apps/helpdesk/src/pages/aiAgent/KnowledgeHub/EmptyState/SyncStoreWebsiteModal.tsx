import { useCallback, useState } from 'react'

import { useId } from '@repo/hooks'
import { useParams } from 'react-router-dom'

import {
    Box,
    Button,
    Heading,
    Modal,
    Text,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import { PAGE_NAME } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import { useIngestionDomainBannerDismissed } from 'pages/aiAgent/AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed'
import { useSyncStoreDomain } from 'pages/aiAgent/hooks/useSyncStoreDomain'
import {
    OPEN_SYNC_WEBSITE_MODAL,
    SYNC_WEBSITE_ERROR,
} from 'pages/aiAgent/KnowledgeHub/constants'
import {
    dispatchDocumentEvent,
    useListenToDocumentEvent,
} from 'pages/aiAgent/KnowledgeHub/EmptyState/utils'
import { useGetLastWebsiteSync } from 'pages/aiAgent/KnowledgeHub/hooks/useGetLastWebsiteSync'

type Props = {
    hasWebsiteSync?: boolean
    helpCenterId: number
}

export const SyncStoreWebsiteModal = ({
    hasWebsiteSync = false,
    helpCenterId,
}: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const id = useId()
    const syncButtonId = `sync-modal-button-${id}`

    const { shopName } = useParams<{
        shopName: string
    }>()

    const {
        handleTriggerSync,
        handleOnSync,
        handleOnCancel,
        storeDomainIngestionLog,
    } = useSyncStoreDomain({
        helpCenterId,
        shopName,
        onStatusChange: () => {},
    })

    const { isSyncLessThan24h, nextSyncDate } = useGetLastWebsiteSync(
        storeDomainIngestionLog,
    )
    const { dismissBanner, resetBanner } = useIngestionDomainBannerDismissed({
        shopName,
        pageName: PAGE_NAME.SOURCE,
    })

    const closeModal = useCallback(() => {
        handleOnCancel()
        setIsOpen(false)
    }, [handleOnCancel])

    const openModal = useCallback(() => {
        setIsOpen(true)
        if (hasWebsiteSync) {
            handleTriggerSync()
        }
    }, [hasWebsiteSync, handleTriggerSync])

    useListenToDocumentEvent(OPEN_SYNC_WEBSITE_MODAL, openModal)

    const handleSync = useCallback(async () => {
        try {
            await handleOnSync()
            resetBanner()
            closeModal()
        } catch (error) {
            console.error('Failed to sync store website:', error)
            dismissBanner()
            dispatchDocumentEvent(SYNC_WEBSITE_ERROR)
            closeModal()
        }
    }, [handleOnSync, resetBanner, dismissBanner, closeModal])

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={closeModal}
            size="sm"
            isDismissable
        >
            <Box flexDirection="column" gap="md">
                <Heading slot="title">Sync store website</Heading>
                <Box flexDirection="column" gap="sm">
                    <Text>
                        {hasWebsiteSync
                            ? 'Syncing will replace all existing questions and answers, reset any disabled questions and answers, and update all product information from your store website.'
                            : 'Sync your store website to allow AI Agent to use your site content and product information.'}
                    </Text>
                    {hasWebsiteSync && (
                        <Text>
                            This action cannot be undone. You will need to
                            review newly generated questions and answers after
                            syncing.
                        </Text>
                    )}
                </Box>
                <Box justifyContent="flex-end" gap="sm">
                    <Button variant="secondary" onClick={closeModal}>
                        Cancel
                    </Button>
                    <Button
                        id={syncButtonId}
                        variant="primary"
                        intent={hasWebsiteSync ? 'destructive' : 'regular'}
                        onClick={handleSync}
                        leadingSlot="arrows-reload-alt-1"
                        isDisabled={isSyncLessThan24h}
                    >
                        Sync
                    </Button>
                    {isSyncLessThan24h && (
                        <Tooltip target={syncButtonId}>
                            Your store website was synced less than 24h ago. You
                            can sync again on {nextSyncDate}.
                        </Tooltip>
                    )}
                </Box>
            </Box>
        </Modal>
    )
}
