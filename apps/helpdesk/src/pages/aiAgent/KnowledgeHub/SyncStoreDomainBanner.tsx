import { useCallback, useState } from 'react'

import { LegacyBanner } from '@gorgias/axiom'

import {
    IngestionLogStatus,
    PAGE_NAME,
} from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import { useIngestionDomainBannerDismissed } from 'pages/aiAgent/AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed'
import { FILE_UPLOAD_STARTED } from 'pages/aiAgent/KnowledgeHub/constants'
import { useListenToDocumentEvent } from 'pages/aiAgent/KnowledgeHub/EmptyState/utils'

import css from './SyncStoreDomainBanner.less'

type Props = {
    syncStatus: string | null | undefined
    shopName: string
    type?: 'domain' | 'url' | 'file'
    completedCount?: number
    totalCount?: number
}

export const SyncStoreDomainBanner = ({
    syncStatus,
    shopName,
    type,
    completedCount,
    totalCount,
}: Props) => {
    const [optimisticCount, setOptimisticCount] = useState<number | null>(null)

    const pageName =
        type === 'url'
            ? PAGE_NAME.URL
            : type === 'file'
              ? PAGE_NAME.FILE
              : PAGE_NAME.SOURCE
    const contentType =
        type === 'url' ? 'URL' : type === 'file' ? 'document' : 'store website'
    const { isDismissed, dismissBanner } = useIngestionDomainBannerDismissed({
        shopName,
        pageName,
    })

    const handleFileUploadStarted = useCallback(
        (event?: Event) => {
            if (type !== 'file') return
            const data = (event as CustomEvent)?.detail
            if (data?.fileCount) {
                setOptimisticCount(data.fileCount)
            }
        },
        [type],
    )

    useListenToDocumentEvent(FILE_UPLOAD_STARTED, handleFileUploadStarted)

    if (isDismissed) {
        return null
    }

    switch (syncStatus) {
        case IngestionLogStatus.Pending: {
            const count = type === 'url' ? totalCount : optimisticCount

            const showProgress =
                !!count && completedCount !== undefined && count > 1

            let progressText: string
            if (showProgress) {
                const actionVerb = type === 'file' ? 'Uploading' : 'Syncing'

                if (completedCount === 0) {
                    progressText = `${actionVerb} ${count} ${contentType}s...`
                } else {
                    progressText = `${actionVerb} ${completedCount} out of ${count} ${contentType}s`
                }
            } else {
                progressText = `Your ${contentType} is syncing. You will be notified once complete.`
            }

            return (
                <LegacyBanner
                    variant="inline"
                    icon
                    type="loading"
                    fillStyle="fill"
                    onClose={dismissBanner}
                    className={css.banner}
                >
                    {progressText}
                </LegacyBanner>
            )
        }

        case IngestionLogStatus.Successful: {
            const isMultiUrl = type === 'url' && totalCount && totalCount > 1
            const isMultiFile =
                type === 'file' && optimisticCount && optimisticCount > 1
            const isMultipleUrls = isMultiUrl || isMultiFile
            const successMessage = isMultipleUrls
                ? `Your ${contentType}s have been synced successfully and are in use by AI Agent. Review generated content for accuracy.`
                : `Your ${contentType} has been synced successfully and is in use by AI Agent.${type === 'domain' ? ' Review generated content for accuracy.' : ''}`

            return (
                <LegacyBanner
                    variant="inline"
                    icon
                    type="success"
                    fillStyle="fill"
                    onClose={dismissBanner}
                    className={css.banner}
                >
                    {successMessage}
                </LegacyBanner>
            )
        }

        case IngestionLogStatus.Failed:
            return (
                <LegacyBanner
                    variant="inline"
                    icon
                    type="error"
                    fillStyle="fill"
                    onClose={dismissBanner}
                    className={css.banner}
                >
                    We couldn’t sync your {contentType}. Please try again or
                    contact support if the issue persists.
                </LegacyBanner>
            )

        default:
            return null
    }
}
