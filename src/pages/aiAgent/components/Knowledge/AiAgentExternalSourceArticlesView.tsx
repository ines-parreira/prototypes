import { useEffect, useMemo, useState } from 'react'

import { useLocation, useParams } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    useGetArticleIngestionLogs,
    useGetFileIngestion,
} from 'models/helpCenter/queries'
import { HelpCenter } from 'models/helpCenter/types'
import AiAgentScrapedDomainContentLayout from 'pages/aiAgent/AiAgentScrapedDomainContent/AiAgentScrapedDomainContentLayout'
import {
    HeaderType,
    IngestedResourceStatus,
    PAGE_NAME,
    VisibilityStatus,
} from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import ScrapedDomainContentView from 'pages/aiAgent/AiAgentScrapedDomainContent/ScrapedDomainContentView'
import { BaseArticle } from 'pages/aiAgent/AiAgentScrapedDomainContent/types'
import AiAgentSelectedArticleContentWrapper from 'pages/aiAgent/components/Knowledge/AiAgentSelectedArticleContentWrapper'
import {
    convertArticleIngestionStatus,
    mapArticleIngestionLogsToSourceItem,
} from 'pages/aiAgent/components/PublicSourcesSection/utils'
import { ARTICLE_INGESTION_LOGS_STATUS } from 'pages/aiAgent/constants'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { useGetIngestedFileArticles } from 'pages/aiAgent/hooks/useGetIngestedFileArticles'
import { useGetIngestedUrlArticles } from 'pages/aiAgent/hooks/useGetIngestedUrlArticles'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { usePublicResourceMutation } from 'pages/aiAgent/hooks/usePublicResourcesMutation'
import { usePublicResourcesPooling } from 'pages/aiAgent/hooks/usePublicResourcesPooling'
import history from 'pages/history'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useIngestionDomainBannerDismissed } from '../../AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed'

// Normalize API response immediately
function normalizeArticles(
    apiResponse: BaseArticle[] | null | undefined,
): BaseArticle[] {
    return (apiResponse || []).map((article) => ({
        ...article,
        status:
            article.visibilityStatus === VisibilityStatus.PUBLIC
                ? IngestedResourceStatus.Enabled
                : IngestedResourceStatus.Disabled,
    }))
}

// Types for different resource sources
type UrlResource = {
    id: number
    url: string | null
    createdDatetime: string
    latestSync?: string | null
    status: string
    articleIds?: number[] | null
}

type FileResource = {
    id: number
    filename: string
    createdDatetime: string
    latestSync?: string | null
    status: string
    articleIds?: number[] | null
}

type ResourceData = UrlResource | FileResource

// Update type definition for location state to handle both URL and file resources
type LocationState = {
    selectedResource?: {
        id: number
        filename?: string // For files
        url?: string // For URLs
        uploaded_datetime?: string
        google_storage_url?: string
        createdDatetime?: string
        latestSync?: string
        status?: string
        articleIds?: number[]
    }
}

const AiAgentExternalSourceArticlesView = ({
    shopName,
    fileIngestionId,
    helpCenterId,
    helpCenter,
    fetchArticles,
    pageType,
    headerType,
}: {
    shopName: string
    fileIngestionId: string
    helpCenterId: number
    helpCenter: HelpCenter
    fetchArticles: (
        helpCenterId: number,
        ingestionId: string,
    ) =>
        | ReturnType<typeof useGetIngestedFileArticles>
        | ReturnType<typeof useGetIngestedUrlArticles>
    pageType: string
    headerType: HeaderType
    children?: React.ReactNode
}) => {
    const dispatch = useAppDispatch()
    const location = useLocation() as { state: LocationState }
    const { routes } = useAiAgentNavigation({ shopName })

    const ingestedFile = location.state?.selectedResource ?? null
    const snippetId = Number(fileIngestionId)

    // Fetch resource details when not available in location state (direct URL navigation)
    // Use different APIs based on whether this is a URL or file ingestion
    const { data: fetchedUrlIngestionLogs } = useGetArticleIngestionLogs(
        {
            help_center_id: helpCenterId,
            ids:
                !ingestedFile && headerType === HeaderType.URL
                    ? [snippetId]
                    : undefined,
        },
        {
            enabled: !ingestedFile && headerType === HeaderType.URL,
        },
    )

    const { data: fetchedFileIngestionLogs } = useGetFileIngestion(
        {
            help_center_id: helpCenterId,
            ids:
                !ingestedFile && headerType === HeaderType.ExternalDocument
                    ? [snippetId]
                    : undefined,
        },
        {
            enabled:
                !ingestedFile && headerType === HeaderType.ExternalDocument,
        },
    )

    // Convert the API response to a consistent format
    const fetchedResourceData = useMemo((): ResourceData | null => {
        if (headerType === HeaderType.URL && fetchedUrlIngestionLogs?.[0]) {
            // For URLs: use ArticleIngestionLogDto and map to SourceItem format
            const sourceItem = mapArticleIngestionLogsToSourceItem(
                fetchedUrlIngestionLogs[0],
            )
            return {
                id: sourceItem.id,
                url: sourceItem.url || null,
                createdDatetime: sourceItem.createdDatetime,
                latestSync: sourceItem.latestSync,
                status: sourceItem.status,
                articleIds: sourceItem.articleIds,
            } as UrlResource
        } else if (
            headerType === HeaderType.ExternalDocument &&
            fetchedFileIngestionLogs?.data?.[0]
        ) {
            // For files: use FileIngestionLogDto and create compatible object
            const fileLog = fetchedFileIngestionLogs.data[0]
            return {
                id: fileLog.id,
                filename: fileLog.filename,
                status: convertArticleIngestionStatus(fileLog.status),
                createdDatetime: fileLog.uploaded_datetime,
                latestSync: null, // Files don't have sync dates
                articleIds: fileLog.snippets_article_ids,
            } as FileResource
        }
        return null
    }, [headerType, fetchedUrlIngestionLogs, fetchedFileIngestionLogs])

    // Helper function to get the file URL or filename
    const getResourceDisplayName = (
        resource: ResourceData | LocationState['selectedResource'] | null,
    ): string | null => {
        if (!resource) return null

        // Handle fetched ResourceData
        if ('filename' in resource && resource.filename) {
            return resource.filename
        }
        if ('url' in resource && resource.url) {
            return resource.url
        }

        return null
    }

    // Use either location state data or fetched data
    const resourceData = ingestedFile || fetchedResourceData
    const fileUrl = getResourceDisplayName(resourceData)
    const createdDatetime =
        resourceData?.latestSync ?? resourceData?.createdDatetime ?? undefined

    const { articleId: defaultArticleId } = useParams<{
        articleId: string
    }>()
    const articleId = Number(defaultArticleId)
    const [syncTriggered, setSyncTriggered] = useState(false)
    const [isLocalSyncing, setIsLocalSyncing] = useState(false)

    const { data, isLoading, refetch } = fetchArticles(
        helpCenterId,
        fileIngestionId,
    )

    const { updateGuidanceArticle, isGuidanceArticleUpdating } =
        useGuidanceArticleMutation({
            guidanceHelpCenterId: helpCenter?.id,
        })

    const { addPublicResource } = usePublicResourceMutation({ helpCenterId })
    const { resetAllBanner } = useIngestionDomainBannerDismissed({
        shopName,
        pageName: PAGE_NAME.URL,
    })
    const { articleIngestionLogs } = usePublicResourcesPooling({
        helpCenterId,
        shopName,
        enabled: true,
    })

    const polledSyncStatus =
        articleIngestionLogs?.find((a) => a.id === resourceData?.id)?.status ??
        null

    const syncStatus =
        isLocalSyncing && !polledSyncStatus
            ? ARTICLE_INGESTION_LOGS_STATUS.PENDING
            : polledSyncStatus

    const articles: BaseArticle[] = useMemo(
        () => normalizeArticles(data as BaseArticle[]),
        [data],
    )

    const selectedArticle = useMemo(() => {
        return articles.find((article) => article.id === articleId) || null
    }, [articles, articleId])

    useEffect(() => {
        if (syncStatus === ARTICLE_INGESTION_LOGS_STATUS.SUCCESSFUL) {
            void refetch()
        }
    }, [syncStatus, refetch])

    useEffect(() => {
        if (polledSyncStatus && isLocalSyncing) {
            setIsLocalSyncing(false)
        }
    }, [polledSyncStatus, isLocalSyncing])

    const onChangeVisibility = async (
        articleId: number,
        visibility: {
            status: IngestedResourceStatus
        },
    ) => {
        try {
            await updateGuidanceArticle(
                {
                    visibility:
                        visibility.status === IngestedResourceStatus.Enabled
                            ? VisibilityStatus.PUBLIC
                            : VisibilityStatus.UNLISTED,
                },
                { articleId, locale: helpCenter.default_locale },
            )
            void refetch()
        } catch {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Error during article visibility change.',
                }),
            )
        }
    }

    const navigateToArticleDetail = (id: number) => {
        switch (headerType) {
            case HeaderType.URL:
                history.push(routes.urlArticlesDetail(snippetId, id))
                break
            case HeaderType.ExternalDocument:
                history.push(routes.fileArticlesDetail(snippetId, id))
                break
        }
    }

    const navigateToArticleList = () => {
        switch (headerType) {
            case HeaderType.URL:
                history.push(routes.urlArticles(snippetId))
                break
            case HeaderType.ExternalDocument:
                history.push(routes.fileArticles(snippetId))
                break
        }
    }

    const handleOnClose = () => {
        setSyncTriggered(false)
        navigateToArticleList()
    }

    const handleOnSelect = (id: number) => {
        navigateToArticleDetail(id)
    }

    const handleOnSync = async () => {
        if (fileUrl) {
            setIsLocalSyncing(true)
            try {
                await addPublicResource([fileUrl])
                resetAllBanner()
            } catch {
                setIsLocalSyncing(false)
            } finally {
                setSyncTriggered(false)
            }
        }
    }

    const handleTriggerSync = () => {
        setSyncTriggered(true)
    }

    const storeUrl = headerType === HeaderType.ExternalDocument ? null : fileUrl
    return (
        <AiAgentScrapedDomainContentLayout
            shopName={shopName}
            storeDomain={fileUrl}
            storeUrl={storeUrl}
            isFetchLoading={isLoading}
            syncTriggered={syncTriggered}
            syncStoreDomainStatus={syncStatus}
            title={
                headerType === HeaderType.ExternalDocument
                    ? 'Document'
                    : 'Single page URL'
            }
            pageType={headerType}
            latestSync={createdDatetime}
            handleTriggerSync={handleTriggerSync}
            handleOnCancel={handleOnClose}
            handleOnSync={
                headerType === HeaderType.ExternalDocument
                    ? undefined
                    : handleOnSync
            }
        >
            <ScrapedDomainContentView<BaseArticle>
                contents={articles}
                pageType={pageType}
                isLoading={isLoading}
                onSelect={handleOnSelect}
                searchValue=""
                onUpdateStatus={onChangeVisibility}
            />
            <AiAgentSelectedArticleContentWrapper
                isOpened={!!selectedArticle}
                handleOnClose={handleOnClose}
                article={selectedArticle}
                helpCenter={helpCenter}
                onUpdateStatus={onChangeVisibility}
                isUpdatingStatus={isGuidanceArticleUpdating}
            />
        </AiAgentScrapedDomainContentLayout>
    )
}

export default AiAgentExternalSourceArticlesView
