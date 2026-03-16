import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import {
    Box,
    Button,
    Modal,
    OverlayHeader,
    Text,
    TextField,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { PAGE_NAME } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import { useIngestionDomainBannerDismissed } from 'pages/aiAgent/AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed'
import {
    getNextSyncDate,
    isSyncLessThan24Hours,
} from 'pages/aiAgent/AiAgentScrapedDomainContent/utils'
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
}

export const SyncUrlModal = ({ helpCenterId, existingUrls }: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [url, setUrl] = useState('')
    const [originalUrl, setOriginalUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<React.ReactNode>(null)

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

    const { syncUrl, validateUrl, urlIngestionLogs } = useSyncUrl({
        helpCenterId,
        existingUrls: filteredExistingUrls,
        helpCenterCustomDomains,
        shopName,
    })

    // Find the ingestion log for the specific URL being synced
    // This ensures we check the 24h constraint for THIS URL, not all URLs
    const urlToCheck = originalUrl || url
    const specificUrlIngestionLog = useMemo(() => {
        if (!urlToCheck || !urlIngestionLogs?.length) return undefined
        return urlIngestionLogs.find((log) => log.url === urlToCheck)
    }, [urlToCheck, urlIngestionLogs])

    const isSyncLessThan24h = isSyncLessThan24Hours(
        specificUrlIngestionLog?.latest_sync,
    )
    const nextSyncDate = getNextSyncDate(specificUrlIngestionLog?.latest_sync)
    const syncButtonId = 'sync-url-modal-button'

    const { resetBanner } = useIngestionDomainBannerDismissed({
        shopName,
        pageName: PAGE_NAME.URL,
    })

    const isResync = originalUrl !== null

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
        // Skip validation for re-sync since URL is already validated
        if (!isResync) {
            const validationError = validateUrl(url)
            if (validationError) {
                setError(validationError)
                return
            }
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
            const baseErrorMessage =
                err instanceof Error
                    ? err.message
                    : 'Failed to sync URL. Please try again.'
            const errorMessageWithUrl = `${baseErrorMessage}\nURL: ${url}`
            setError(baseErrorMessage)
            dispatch(
                notify({
                    message: errorMessageWithUrl,
                    status: NotificationStatus.Error,
                    showDismissButton: true,
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
        isResync,
    ])

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && !isLoading && !isResync) {
                void handleSync()
            }
        },
        [handleSync, isLoading, isResync],
    )

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={closeModal}
            size="sm"
            isDismissable
        >
            <OverlayHeader title={isResync ? 'Sync URL' : 'Add URL'} />
            <Box flexDirection="column" gap="md">
                {isResync ? (
                    <>
                        <Text color="content-error-default">
                            Syncing will replace all existing snippets and reset
                            any disabled snippets from this URL.
                        </Text>
                        <Text color="content-error-default">
                            This action cannot be undone. You will need to
                            review newly generated snippets after syncing.
                        </Text>
                    </>
                ) : (
                    <>
                        <Text>
                            Add a single-page URL to sync. Only content from the
                            individual page is used, subpages and media are
                            excluded.
                            <br />
                        </Text>
                        <Text>
                            URLs from your Gorgias Help Center are not
                            supported.
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
                    </>
                )}
            </Box>
            <Box justifyContent="flex-end" gap="sm" marginTop="md">
                <Button
                    variant="tertiary"
                    onClick={closeModal}
                    isDisabled={isLoading}
                >
                    Cancel
                </Button>
                <Button
                    id={syncButtonId}
                    intent={isResync ? 'destructive' : 'regular'}
                    onClick={handleSync}
                    isDisabled={
                        isLoading || !url || isSyncLessThan24h || !!error
                    }
                    leadingSlot="arrows-reload-alt-1"
                >
                    Sync
                </Button>
                {isSyncLessThan24h && (
                    <Tooltip target={syncButtonId}>
                        {`This URL was synced less than 24h ago. You can sync again on ${nextSyncDate}.`}
                    </Tooltip>
                )}
            </Box>
        </Modal>
    )
}

export const openSyncUrlModal = () => {
    dispatchDocumentEvent(OPEN_SYNC_URL_MODAL)
}
