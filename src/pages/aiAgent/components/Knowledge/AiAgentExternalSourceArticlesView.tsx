import { useEffect, useMemo, useState } from 'react'

import { useLocation } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
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
import { ARTICLE_INGESTION_LOGS_STATUS } from 'pages/aiAgent/constants'
import { useGetIngestedFileArticles } from 'pages/aiAgent/hooks/useGetIngestedFileArticles'
import { useGetIngestedUrlArticles } from 'pages/aiAgent/hooks/useGetIngestedUrlArticles'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { usePublicResourceMutation } from 'pages/aiAgent/hooks/usePublicResourcesMutation'
import { usePublicResourcesPooling } from 'pages/aiAgent/hooks/usePublicResourcesPooling'
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

// Update type definition for location state
type LocationState = {
    selectedResource?: {
        id: number
        filename?: string
        url?: string
        uploaded_datetime?: string
        google_storage_url?: string
        createdDatetime?: string
        latestSync?: string
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
    const ingestedFile = location.state?.selectedResource ?? null

    const fileUrl = ingestedFile?.filename ?? ingestedFile?.url ?? null
    const createdDatetime =
        ingestedFile?.latestSync ?? ingestedFile?.createdDatetime ?? undefined

    const [articleId, setArticleId] = useState<number | null>(null)
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
        articleIngestionLogs?.find((a) => a.id === ingestedFile?.id)?.status ??
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

    const handleOnClose = () => {
        setArticleId(null)
        setSyncTriggered(false)
    }

    const handleOnSelect = (id: number) => {
        setArticleId(id)
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
