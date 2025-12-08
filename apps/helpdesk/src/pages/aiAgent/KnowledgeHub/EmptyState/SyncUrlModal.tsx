import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { Box, Button, Heading, Modal, Text, TextField } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { PAGE_NAME } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import { useIngestionDomainBannerDismissed } from 'pages/aiAgent/AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed'
import { useSyncUrl } from 'pages/aiAgent/hooks/useSyncUrl'
import { OPEN_SYNC_URL_MODAL } from 'pages/aiAgent/KnowledgeHub/constants'
import {
    dispatchDocumentEvent,
    useListenToDocumentEvent,
} from 'pages/aiAgent/KnowledgeHub/EmptyState/utils'
import useHelpCenterCustomDomainHostnames from 'pages/settings/helpCenter/hooks/useHelpCenterCustomDomainHostnames'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

type Props = {
    helpCenterId: number
    existingUrls: string[]
    storeUrl: string | null
}

export const SyncUrlModal = ({
    helpCenterId,
    existingUrls,
    storeUrl,
}: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [url, setUrl] = useState('')
    const [originalUrl, setOriginalUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const { shopName } = useParams<{
        shopName: string
    }>()

    const { customDomainHostnames: helpCenterCustomDomains } =
        useHelpCenterCustomDomainHostnames(helpCenterId)

    // Filter out the original URL from existingUrls to allow re-syncing
    const filteredExistingUrls = useMemo(() => {
        if (!originalUrl) return existingUrls
        return existingUrls.filter((existingUrl) => existingUrl !== originalUrl)
    }, [existingUrls, originalUrl])

    const { syncUrl, validateUrl } = useSyncUrl({
        helpCenterId,
        existingUrls: filteredExistingUrls,
        helpCenterCustomDomains,
        storeUrl,
    })

    const { resetBanner } = useIngestionDomainBannerDismissed({
        shopName,
        pageName: PAGE_NAME.URL,
    })

    const closeModal = useCallback(() => {
        setIsOpen(false)
        setUrl('')
        setOriginalUrl(null)
        setError(null)
    }, [])

    const openModal = useCallback((event?: Event) => {
        const data = (event as CustomEvent)?.detail
        setIsOpen(true)
        // If data contains a source URL, populate the field and track as original
        if (data?.source) {
            setUrl(data.source)
            setOriginalUrl(data.source)
        } else {
            setUrl('')
            setOriginalUrl(null)
        }
        setError(null)
    }, [])

    useListenToDocumentEvent(OPEN_SYNC_URL_MODAL, openModal)

    const handleUrlChange = useCallback(
        (value: string) => {
            setUrl(value)
            // Clear error when user starts typing
            if (error) {
                setError(null)
            }
        },
        [error],
    )

    // Debounced validation - validate after user stops typing
    const debounceTimerRef = useRef<NodeJS.Timeout>()

    useEffect(() => {
        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        // Don't validate empty input
        if (!url) {
            setError(null)
            return
        }

        // Validate after 500ms of no typing
        debounceTimerRef.current = setTimeout(() => {
            const validationError = validateUrl(url)
            setError(validationError)
        }, 500)

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [url, validateUrl])

    const handleSync = useCallback(async () => {
        const validationError = validateUrl(url)
        if (validationError) {
            setError(validationError)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            await syncUrl(url)
            resetBanner()

            // Invalidate queries to immediately show loading banner
            await queryClient.invalidateQueries({
                queryKey: ['url-ingestion-logs', helpCenterId],
            })
            await queryClient.invalidateQueries({
                queryKey: ['url-sync-status', helpCenterId],
            })

            // Close modal - banner will show sync status
            closeModal()
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Failed to sync URL. Please try again.'
            setError(errorMessage)
            dispatch(
                notify({
                    message: errorMessage,
                    status: NotificationStatus.Error,
                }),
            )
        } finally {
            setIsLoading(false)
        }
    }, [
        url,
        validateUrl,
        syncUrl,
        resetBanner,
        dispatch,
        closeModal,
        queryClient,
        helpCenterId,
    ])

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && !isLoading) {
                void handleSync()
            }
        },
        [handleSync, isLoading],
    )

    return (
        <Modal isOpen={isOpen} onOpenChange={closeModal} size="lg">
            <Heading slot="title">Sync URL</Heading>
            <Box flexDirection="column" gap="md">
                <Text>
                    Add a link to a public page AI Agent can learn from like
                    blog posts or external documentation.
                </Text>
                <TextField
                    label="URL"
                    value={url}
                    onChange={handleUrlChange}
                    onKeyDown={handleKeyDown}
                    placeholder="https://www.example.com/return-policy"
                    isDisabled={isLoading}
                    error={error || undefined}
                    autoFocus
                />
                <Text size="sm" color="secondary">
                    Gorgias Help Center and store website links are not
                    supported
                </Text>
            </Box>
            <Box justifyContent="flex-end" gap="sm">
                <Button
                    variant="secondary"
                    onClick={closeModal}
                    isDisabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSync}
                    isDisabled={isLoading || !url}
                    leadingSlot="arrows-reload-alt-1"
                >
                    Sync
                </Button>
            </Box>
        </Modal>
    )
}

export const openSyncUrlModal = () => {
    dispatchDocumentEvent(OPEN_SYNC_URL_MODAL)
}
