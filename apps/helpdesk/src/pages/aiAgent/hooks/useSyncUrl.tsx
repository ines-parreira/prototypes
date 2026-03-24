import type React from 'react'
import { useCallback, useMemo } from 'react'

import { reportError } from '@repo/logging'
import { useQueryClient } from '@tanstack/react-query'

import { SentryTeam } from 'common/const/sentryTeamNames'
import {
    helpCenterKeys,
    useGetIngestionLogs,
    useStartIngestion,
} from 'models/helpCenter/queries'

import {
    IngestionLogStatus,
    POLLING_INTERVAL,
} from '../AiAgentScrapedDomainContent/constant'
import { getTheLatestIngestionLog } from '../AiAgentScrapedDomainContent/utils'
import { useAiAgentNavigation } from './useAiAgentNavigation'

const SOURCES_LIMIT = 10

export const isUrlValid = (url?: string) => {
    if (!url) return false

    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

export const isUrlRoot = (url: string) => {
    try {
        const urlObj = new URL(url)
        return (
            (urlObj.pathname === '/' || urlObj.pathname === '') &&
            !urlObj.search &&
            !urlObj.hash
        )
    } catch {
        return false
    }
}

export const isUrlFromGorgiasHelpCenter = (
    url: string,
    helpCenterCustomDomains: string[],
) => {
    try {
        const urlObj = new URL(url)
        const hostname = urlObj.hostname

        const isGorgiasDomain = hostname.endsWith('.gorgias.help')
        const isCustomDomain = helpCenterCustomDomains.includes(hostname)

        return isGorgiasDomain || isCustomDomain
    } catch {
        return false
    }
}

const DOCUMENT_EXTENSIONS = new Set([
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'txt',
    'csv',
])

export const isUrlWithDocumentExtension = (url: string): boolean => {
    try {
        const urlObj = new URL(url)
        const extension = urlObj.pathname.split('.').pop()?.toLowerCase()
        return extension !== undefined && DOCUMENT_EXTENSIONS.has(extension)
    } catch {
        return false
    }
}

export const hasAnchorTag = (url: string): boolean => {
    try {
        const urlObj = new URL(url)
        return urlObj.hash !== ''
    } catch {
        return false
    }
}

export const getUrlValidationError = (
    url: string,
    existingUrls: string[],
    helpCenterCustomDomains: string[],
    existingUrlLink?: string,
): React.ReactNode => {
    if (!url) {
        return 'URL is required'
    }

    const isValid = isUrlValid(url)
    if (!isValid) {
        return 'Invalid URL'
    }

    const isGorgiasHelpCenterUrl = isUrlFromGorgiasHelpCenter(
        url,
        helpCenterCustomDomains,
    )
    if (isGorgiasHelpCenterUrl) {
        return 'Help Center links are not supported. You can manage Help Center articles separately in Knowledge.'
    }

    const isRootUrl = isUrlRoot(url)
    if (isRootUrl) {
        return 'URL must include a subpage (ie. www.example.com/faqs)'
    }

    const isDuplicate = existingUrls.includes(url)
    if (isDuplicate && existingUrlLink) {
        return (
            <>
                This URL is already synced. To sync a new version, re-sync the{' '}
                <a
                    href={existingUrlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        textDecoration: 'underline',
                    }}
                >
                    existing URL
                </a>
                .
            </>
        )
    }

    if (existingUrls.length >= SOURCES_LIMIT) {
        return `Maximum ${SOURCES_LIMIT} URLs allowed`
    }

    const hasDocumentExtension = isUrlWithDocumentExtension(url)
    if (hasDocumentExtension) {
        return 'URL cannot be a document'
    }

    const urlHasAnchorTag = hasAnchorTag(url)
    if (urlHasAnchorTag) {
        return "URLs with # anchors aren't supported. We'll sync the full page content instead of just that section."
    }

    return null
}

type Props = {
    helpCenterId: number
    existingUrls: string[]
    helpCenterCustomDomains: string[]
    shopName: string
}

export const useSyncUrl = ({
    helpCenterId,
    existingUrls,
    helpCenterCustomDomains,
    shopName,
}: Props) => {
    const queryClient = useQueryClient()
    const { routes } = useAiAgentNavigation({ shopName })

    const onIngestionSuccess = useCallback(async () => {
        await queryClient.invalidateQueries({
            queryKey: helpCenterKeys.articleIngestionLogs(helpCenterId),
        })
        await queryClient.invalidateQueries({
            queryKey: helpCenterKeys.articleIngestionLogsListRoot(),
        })
    }, [queryClient, helpCenterId])

    const { mutateAsync: startIngestionAsync } = useStartIngestion({
        onSuccess: onIngestionSuccess,
    })

    const {
        data: ingestionLogs,
        error,
        isLoading: isGetIngestionLogsLoading,
    } = useGetIngestionLogs(
        {
            help_center_id: helpCenterId,
        },
        {
            queryKey: ['url-ingestion-logs', helpCenterId],
            refetchOnWindowFocus: false,
            refetchInterval: (data) => {
                const logs = data?.filter((log) => log.source === 'url')
                const latestLog = getTheLatestIngestionLog(logs)
                return latestLog?.status === IngestionLogStatus.Pending
                    ? POLLING_INTERVAL
                    : false
            },
        },
    )

    const urlIngestionLogs = useMemo(
        () => ingestionLogs?.filter((log) => log.source === 'url') ?? [],
        [ingestionLogs],
    )

    const latestUrlIngestionLog = useMemo(
        () => getTheLatestIngestionLog(urlIngestionLogs),
        [urlIngestionLogs],
    )

    const validateUrl = useCallback(
        (url: string) => {
            const encodedUrl = encodeURIComponent(url)
            const existingUrlLink = `${window.location.origin}${routes.knowledge}/sources?filter=url&folder=${encodedUrl}`

            return getUrlValidationError(
                url,
                existingUrls,
                helpCenterCustomDomains,
                existingUrlLink,
            )
        },
        [existingUrls, helpCenterCustomDomains, routes.knowledge],
    )

    const syncUrl = useCallback(
        async (url: string) => {
            const validationError = validateUrl(url)
            if (validationError) {
                throw new Error('Invalid URL')
            }

            try {
                await startIngestionAsync([
                    undefined,
                    { help_center_id: helpCenterId },
                    { url, type: 'url' },
                ])
            } catch (error) {
                reportError(error, {
                    tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                    extra: {
                        context: 'Error during URL sync',
                        url,
                    },
                })
                throw error
            }
        },
        [startIngestionAsync, validateUrl, helpCenterId],
    )

    return {
        syncUrl,
        validateUrl,
        latestUrlIngestionLog,
        urlIngestionLogs,
        isLoading: isGetIngestionLogsLoading,
        error,
    }
}
