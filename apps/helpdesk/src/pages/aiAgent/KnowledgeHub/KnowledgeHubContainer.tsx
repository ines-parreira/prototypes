import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useHistory, useParams } from 'react-router-dom'

import { Box, Modal, OverlayHeader } from '@gorgias/axiom'

import {
    getLast28DaysDateRange,
    useAllResourcesMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { DrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModal'
import useAppSelector from 'hooks/useAppSelector'
import { IngestionLogStatus } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import {
    getNextSyncDate,
    isSyncLessThan24Hours,
} from 'pages/aiAgent/AiAgentScrapedDomainContent/utils'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import {
    HELP_CENTER_SELECT_MODAL_OPEN,
    OPEN_CREATE_GUIDANCE_ARTICLE_MODAL,
    OPEN_PLAYGROUND_PANEL,
    OPEN_SYNC_URL_MODAL,
    OPEN_SYNC_WEBSITE_MODAL,
    OPEN_UPLOAD_DOCUMENT_MODAL,
    REFETCH_KNOWLEDGE_HUB_TABLE,
} from 'pages/aiAgent/KnowledgeHub/constants'
import { DocumentFilters } from 'pages/aiAgent/KnowledgeHub/DocumentFilters/DocumentFilters'
import {
    FaqEditorWrapper,
    GuidanceEditorWrapper,
} from 'pages/aiAgent/KnowledgeHub/EditorWrappers'
import { AddGuidanceTemplateModal } from 'pages/aiAgent/KnowledgeHub/EmptyState/AddGuidanceTemplateModal'
import { DeleteUrlModal } from 'pages/aiAgent/KnowledgeHub/EmptyState/DeleteUrlModal'
import { EmptyStates } from 'pages/aiAgent/KnowledgeHub/EmptyState/EmptyStates'
import { HelpCenterSelectModal } from 'pages/aiAgent/KnowledgeHub/EmptyState/HelpCenterSelectModal'
import { SyncStoreWebsiteModal } from 'pages/aiAgent/KnowledgeHub/EmptyState/SyncStoreWebsiteModal'
import { SyncUrlModal } from 'pages/aiAgent/KnowledgeHub/EmptyState/SyncUrlModal'
import {
    openDeleteDocumentModal,
    openDeleteUrlModal,
    openSyncStoreWebsiteModal,
    openUrlModal,
    useListenToDocumentEvent,
} from 'pages/aiAgent/KnowledgeHub/EmptyState/utils'
import { useGetLastWebsiteSync } from 'pages/aiAgent/KnowledgeHub/hooks/useGetLastWebsiteSync'
import { useKnowledgeHubFaqEditor } from 'pages/aiAgent/KnowledgeHub/hooks/useKnowledgeHubFaqEditor'
import { useKnowledgeHubGuidanceEditor } from 'pages/aiAgent/KnowledgeHub/hooks/useKnowledgeHubGuidanceEditor'
import { KnowledgeHubHeader } from 'pages/aiAgent/KnowledgeHub/KnowledgeHubHeader/KnowledgeHubHeader'
import { SyncStoreDomainBanner } from 'pages/aiAgent/KnowledgeHub/SyncStoreDomainBanner'
import { KnowledgeHubTable } from 'pages/aiAgent/KnowledgeHub/Table/KnowledgeHubTable'
import type {
    GroupedKnowledgeItem,
    KnowledgeMetrics,
} from 'pages/aiAgent/KnowledgeHub/types'
import {
    KnowledgeType,
    mapKnowledgeVisibilityToArticleVisibility,
} from 'pages/aiAgent/KnowledgeHub/types'
import { useKnowledgeHub } from 'pages/aiAgent/KnowledgeHub/useKnowledgeHub'
import type { GuidanceTemplate } from 'pages/aiAgent/types'
import { useStoreIntegrationByShopName } from 'pages/settings/helpCenter/hooks/useStoreIntegrationByShopName'
import { getTimezone } from 'state/currentUser/selectors'

import { usePlaygroundPanel } from '../hooks/usePlaygroundPanel'
import { SnippetEditorWrapper } from './EditorWrappers/SnippetEditorWrapper'
import { DeleteDocumentModal } from './EmptyState/DeleteDocumentModal'
import { UploadDocumentModal } from './EmptyState/UploadDocumentModal'
import { useKnowledgeHubSnippetEditor } from './hooks/useKnowledgeHubSnippetEditor'
import { useKnowledgeHubUrlParams } from './hooks/useKnowledgeHubUrlParams'

import css from './KnowledgeHubContainer.less'

export const KnowledgeHubContainer = () => {
    const { shopType, type, id } = useParams<{
        shopType: string
        type?: string
        id?: string
    }>()

    const history = useHistory()
    const [isAddKnowledgeModalOpen, setIsAddKnowledgeModalOpen] =
        useState(false)

    const {
        shopName,
        tableData,
        isInitialLoading,
        hasWebsiteSync,
        faqHelpCenterId,
        syncStatus,
        snippetHelpCenterId,
        guidanceHelpCenterId,
        refetchKnowledgeHubArticles,
        storeDomainIngestionLog,
        urlSyncStatus,
        syncingUrls,
        urlIngestionLogs,
        storeUrl,
        existingUrls,
        urlTotalCount,
        urlPendingCount,
        fileIngestionStatus,
        fileIngestionLogs,
        filePendingCount,
    } = useKnowledgeHub()

    const {
        selectedFilter,
        selectedFolder,
        setSelectedFolder,
        searchTerm,
        setSearchTerm,
        dateRange,
        setDateRange,
        inUseByAIFilter,
        setInUseByAIFilter,
        buildUrlWithParams,
        handleDocumentFilterChange,
        updateUrlWithFolderParam,
        removeFolderParamFromUrl,
        handleCloseEditorPath,
        clearSearchParams,
    } = useKnowledgeHubUrlParams(shopName, tableData)

    const { routes } = useAiAgentNavigation({ shopName })

    const guidanceArticles = useMemo(() => {
        return tableData
            .filter((item) => item.type === KnowledgeType.Guidance)
            .map((item) => ({
                id: Number(item.id),
                title: item.title,
                draftVersionId: item.draftVersionId,
                publishedVersionId: item.publishedVersionId,
                visibility: mapKnowledgeVisibilityToArticleVisibility(
                    item.inUseByAI,
                ),
            }))
    }, [tableData])

    const faqArticles = useMemo(() => {
        return tableData
            .filter((item) => item.type === KnowledgeType.FAQ)
            .map((item) => ({
                id: Number(item.id),
                title: item.title,
                draftVersionId: item.draftVersionId,
                publishedVersionId: item.publishedVersionId,
                visibility: mapKnowledgeVisibilityToArticleVisibility(
                    item.inUseByAI,
                ),
            }))
    }, [tableData])

    const snippetArticles = useMemo(() => {
        return tableData
            .filter(
                (item) =>
                    item.type === KnowledgeType.Document ||
                    item.type === KnowledgeType.URL ||
                    item.type === KnowledgeType.Domain,
            )
            .map((item) => ({
                id: Number(item.id),
                title: item.title,
                type: item.type,
                draftVersionId: item.draftVersionId,
                publishedVersionId: item.publishedVersionId,
                visibility: mapKnowledgeVisibilityToArticleVisibility(
                    item.inUseByAI,
                ),
            }))
    }, [tableData])

    const {
        openEditorForCreate: openGuidanceEditorForCreate,
        openEditorForEdit: openGuidanceEditorForEdit,
        knowledgeEditorProps,
    } = useKnowledgeHubGuidanceEditor({
        shopName,
        shopType: shopType || '',
        filteredGuidanceArticles: guidanceArticles,
    })

    const faqEditor = useKnowledgeHubFaqEditor({
        shopName,
        filteredFaqArticles: faqArticles,
    })

    const snippetEditor = useKnowledgeHubSnippetEditor({
        shopName,
        filteredSnippetArticles: snippetArticles,
        history,
        routes,
        buildUrlWithParams,
    })

    // Track previous URL params to detect back button navigation
    const prevTypeRef = useRef<string | undefined>(type)
    const prevIdRef = useRef<string | undefined>(id)
    const isUpdatingFolderRef = useRef(false)

    // Fetch all resources metrics
    const timezone = useAppSelector(getTimezone)
    const storeIntegration = useStoreIntegrationByShopName(shopName)
    const shopIntegrationId = storeIntegration?.id

    const metricsDateRange = useMemo(() => getLast28DaysDateRange(), [])

    const allResourcesMetrics = useAllResourcesMetrics({
        shopIntegrationId: shopIntegrationId || 0,
        timezone: timezone ?? 'UTC',
        enabled: !!shopIntegrationId,
        loadIntents: false,
        dateRange: metricsDateRange,
    })

    const isMetricsLoading = allResourcesMetrics.isLoading

    // Create metrics lookup map
    const metricsMap = useMemo(() => {
        if (!allResourcesMetrics.data) return new Map()

        const map = new Map<string, KnowledgeMetrics>()
        allResourcesMetrics.data.forEach((metric) => {
            // resourceSourceId maps to knowledge item.id
            map.set(String(metric.resourceSourceId), {
                tickets: metric.tickets,
                handoverTickets: metric.handoverTickets,
                csat: metric.csat,
                resourceSourceSetId: metric.resourceSourceSetId,
            })
        })
        return map
    }, [allResourcesMetrics.data])

    // Enrich table data with metrics
    const enrichedTableData = useMemo(() => {
        return tableData.map((item) => ({
            ...item,
            metrics: metricsMap.get(item.id),
        }))
    }, [tableData, metricsMap])

    useEffect(() => {
        const prevType = prevTypeRef.current
        const prevId = prevIdRef.current

        // Case 1: Opening an editor (type and id are present)
        if (type && id) {
            const articleId = Number(id)
            if (isNaN(articleId)) {
                return
            }

            switch (type) {
                case KnowledgeType.Guidance:
                    openGuidanceEditorForEdit(articleId)
                    break
                case KnowledgeType.FAQ:
                    faqEditor.openEditorForEdit(articleId)
                    break
                case KnowledgeType.Document:
                    snippetEditor?.openEditorForEdit(
                        articleId,
                        KnowledgeType.Document,
                    )
                    break
                case KnowledgeType.URL:
                    snippetEditor?.openEditorForEdit(
                        articleId,
                        KnowledgeType.URL,
                    )
                    break
                case KnowledgeType.Domain:
                    snippetEditor?.openEditorForEdit(
                        articleId,
                        KnowledgeType.Domain,
                    )
                    break
                default:
                    return
            }
        }
        // Case 2: Closing an editor (URL params cleared by back button)
        else if (prevType && prevId && (!type || !id)) {
            // Previous URL had params, current URL doesn't - close the editor
            switch (prevType) {
                case KnowledgeType.Guidance:
                    knowledgeEditorProps.onClose()
                    break
                case KnowledgeType.FAQ:
                    faqEditor.closeEditor()
                    break
                case KnowledgeType.Document:
                case KnowledgeType.URL:
                case KnowledgeType.Domain:
                    snippetEditor?.closeEditor()
                    break
            }
        }

        // Update refs for next render
        prevTypeRef.current = type
        prevIdRef.current = id
    }, [
        type,
        id,
        openGuidanceEditorForEdit,
        faqEditor,
        snippetEditor,
        knowledgeEditorProps,
    ])

    const handleOpenGuidanceEditor = useCallback(
        (articleId: number) => {
            // Save the current base path to return to after closing editor

            const basePath = routes.knowledgeArticle(
                KnowledgeType.Guidance,
                articleId,
            )
            const targetPath = buildUrlWithParams(basePath)
            if (
                history.location.pathname + history.location.search !==
                targetPath
            ) {
                history.push(targetPath)
            }
            openGuidanceEditorForEdit(articleId)
        },
        [history, routes, openGuidanceEditorForEdit, buildUrlWithParams],
    )

    const handleOpenFaqEditor = useCallback(
        (articleId: number) => {
            // Save the current base path to return to after closing editor
            const basePath = routes.knowledgeArticle(
                KnowledgeType.FAQ,
                articleId,
            )
            const targetPath = buildUrlWithParams(basePath)
            if (
                history.location.pathname + history.location.search !==
                targetPath
            ) {
                history.push(targetPath)
            }
            faqEditor.openEditorForEdit(articleId)
        },
        [history, routes, faqEditor, buildUrlWithParams],
    )

    const handleOpenSnippetEditor = useCallback(
        (articleId: number) => {
            // Save the current base path to return to after closing editor
            const articleType = snippetArticles.find(
                (article) => article.id === articleId,
            )?.type

            if (!articleType) {
                return
            }

            const basePath = routes.knowledgeArticle(articleType, articleId)
            const targetPath = buildUrlWithParams(basePath)
            if (
                history.location.pathname + history.location.search !==
                targetPath
            ) {
                history.push(targetPath)
            }
            snippetEditor?.openEditorForEdit(articleId, articleType)
        },
        [history, routes, snippetEditor, buildUrlWithParams, snippetArticles],
    )

    const { onClose: closeGuidanceEditor, onDelete: deleteGuidanceEditor } =
        knowledgeEditorProps
    const { closeEditor: closeFaqEditor, handleDelete: deleteFaq } = faqEditor
    const { closeEditor: closeSnippetEditor } = snippetEditor

    const handleCloseGuidanceEditor = useCallback(() => {
        handleCloseEditorPath()
        closeGuidanceEditor()
    }, [closeGuidanceEditor, handleCloseEditorPath])

    const handleCloseFaqEditor = useCallback(() => {
        handleCloseEditorPath()
        closeFaqEditor()
    }, [closeFaqEditor, handleCloseEditorPath])

    const handleDeleteFaqEditor = useCallback(() => {
        handleCloseEditorPath()
        deleteFaq()
    }, [deleteFaq, handleCloseEditorPath])

    const handleDeleteGuidanceEditor = useCallback(() => {
        handleCloseEditorPath()
        deleteGuidanceEditor()
    }, [deleteGuidanceEditor, handleCloseEditorPath])

    const snippetEditorClose = useCallback(() => {
        handleCloseEditorPath()
        closeSnippetEditor()
    }, [closeSnippetEditor, handleCloseEditorPath])

    const { openPlayground, isPlaygroundOpen } = usePlaygroundPanel()

    const { isSyncLessThan24h, nextSyncDate } = useGetLastWebsiteSync(
        storeDomainIngestionLog,
    )

    const handleRefetchTable = useCallback(() => {
        void refetchKnowledgeHubArticles()
    }, [refetchKnowledgeHubArticles])

    const handleCloseSyncModals = useCallback(() => {
        setIsAddKnowledgeModalOpen(false)
    }, [])

    const handleOpenPlayground = useCallback(() => {
        void openPlayground()
    }, [openPlayground])

    useListenToDocumentEvent(REFETCH_KNOWLEDGE_HUB_TABLE, handleRefetchTable)
    useListenToDocumentEvent(OPEN_SYNC_WEBSITE_MODAL, handleCloseSyncModals)
    useListenToDocumentEvent(OPEN_SYNC_URL_MODAL, handleCloseSyncModals)
    useListenToDocumentEvent(OPEN_UPLOAD_DOCUMENT_MODAL, handleCloseSyncModals)
    useListenToDocumentEvent(
        OPEN_CREATE_GUIDANCE_ARTICLE_MODAL,
        handleCloseSyncModals,
    )
    useListenToDocumentEvent(
        HELP_CENTER_SELECT_MODAL_OPEN,
        handleCloseSyncModals,
    )
    useListenToDocumentEvent(OPEN_PLAYGROUND_PANEL, handleOpenPlayground)

    const onClick = (data: GroupedKnowledgeItem) => {
        if (isUpdatingFolderRef.current) {
            return
        }

        isUpdatingFolderRef.current = true
        // Only update URL - let sync effect handle state to prevent duplicate history entries
        updateUrlWithFolderParam(data)

        isUpdatingFolderRef.current = false
    }

    const handleBack = () => {
        setSelectedFolder(null)

        removeFolderParamFromUrl()
    }

    const onAddKnowledgeClick = () => {
        setIsAddKnowledgeModalOpen(true)
    }

    const onKnowledgeModalOpenChange = (value: boolean) => {
        setIsAddKnowledgeModalOpen(value)
    }

    const onSync = () => {
        if (selectedFolder?.type === KnowledgeType.Domain) {
            openSyncStoreWebsiteModal()
        } else if (selectedFolder?.type === KnowledgeType.URL) {
            openUrlModal(selectedFolder)
        }
    }

    const onUrlDelete = () => {
        if (selectedFolder?.type === KnowledgeType.URL) {
            openDeleteUrlModal(selectedFolder)
        }

        if (selectedFolder?.type === KnowledgeType.Document) {
            openDeleteDocumentModal(selectedFolder)
        }
    }

    const isUrlFolderSyncing = useMemo(() => {
        if (!selectedFolder || selectedFolder.type !== KnowledgeType.URL) {
            return false
        }
        if (!selectedFolder.source) {
            return false
        }
        return syncingUrls.includes(selectedFolder.source)
    }, [selectedFolder, syncingUrls])

    const isUrlSyncLessThan24h = useMemo(() => {
        if (!selectedFolder || selectedFolder.type !== KnowledgeType.URL) {
            return false
        }
        if (!selectedFolder.source) {
            return false
        }

        const urlLog = urlIngestionLogs?.find(
            (log) => log.url === selectedFolder.source,
        )
        return isSyncLessThan24Hours(urlLog?.latest_sync)
    }, [selectedFolder, urlIngestionLogs])

    const nextUrlSyncDate = useMemo(() => {
        if (!selectedFolder || selectedFolder.type !== KnowledgeType.URL) {
            return null
        }
        if (!selectedFolder.source) {
            return null
        }

        const urlLog = urlIngestionLogs?.find(
            (log) => log.url === selectedFolder.source,
        )
        return getNextSyncDate(urlLog?.latest_sync)
    }, [selectedFolder, urlIngestionLogs])

    const isSyncButtonDisabled = useMemo(() => {
        if (selectedFolder?.type === KnowledgeType.Domain) {
            return isSyncLessThan24h
        }
        if (selectedFolder?.type === KnowledgeType.URL) {
            return isUrlFolderSyncing || isUrlSyncLessThan24h
        }
        return isSyncLessThan24h
    }, [
        selectedFolder,
        isSyncLessThan24h,
        isUrlFolderSyncing,
        isUrlSyncLessThan24h,
    ])

    const isDeleteButtonDisabled = useMemo(() => {
        if (selectedFolder?.type === KnowledgeType.URL) {
            return isUrlFolderSyncing
        }
        return false
    }, [selectedFolder, isUrlFolderSyncing])

    const syncTooltipMessage = useMemo(() => {
        if (
            selectedFolder?.type === KnowledgeType.Domain &&
            isSyncLessThan24h
        ) {
            return `Your store website was synced less than 24h ago. You can sync again on ${nextSyncDate}.`
        }
        if (selectedFolder?.type === KnowledgeType.URL) {
            if (isUrlFolderSyncing) {
                return 'This URL is currently syncing.'
            }
            if (isUrlSyncLessThan24h && nextUrlSyncDate) {
                return `This URL was synced less than 24h ago. You can sync again on ${nextUrlSyncDate}.`
            }
        }
        if (isSyncLessThan24h) {
            return `Your store website was synced less than 24h ago. You can sync again on ${nextSyncDate}.`
        }
        return undefined
    }, [
        selectedFolder,
        isSyncLessThan24h,
        nextSyncDate,
        isUrlFolderSyncing,
        isUrlSyncLessThan24h,
        nextUrlSyncDate,
    ])

    const handleTemplateSelect = useCallback(
        (template?: GuidanceTemplate) => {
            setIsAddKnowledgeModalOpen(false)
            openGuidanceEditorForCreate(template)
        },
        [openGuidanceEditorForCreate],
    )

    const handleFaqEditorOpen = useCallback(() => {
        setIsAddKnowledgeModalOpen(false)
        faqEditor.openEditorForCreate()
    }, [faqEditor])

    const failedUrls = useMemo(() => {
        if (!urlIngestionLogs) return []
        return urlIngestionLogs
            .filter((log) => log.status === IngestionLogStatus.Failed)
            .map((log) => log.url)
            .filter((url): url is string => !!url)
    }, [urlIngestionLogs])

    const successfulUrls = useMemo(() => {
        if (!urlIngestionLogs) return []
        return urlIngestionLogs
            .filter((log) => log.status === IngestionLogStatus.Successful)
            .map((log) => log.url)
            .filter((url): url is string => !!url)
    }, [urlIngestionLogs])

    return (
        <div className={css.container}>
            <KnowledgeHubHeader
                data={selectedFolder}
                onBack={handleBack}
                onAddKnowledge={onAddKnowledgeClick}
                onTest={handleOpenPlayground}
                onSync={onSync}
                onDelete={onUrlDelete}
                isSyncButtonDisabled={isSyncButtonDisabled}
                isDeleteButtonDisabled={isDeleteButtonDisabled}
                syncTooltipMessage={syncTooltipMessage}
                isPlaygroundOpen={isPlaygroundOpen}
            />
            <div className={css.scrollContainer}>
                <Box paddingLeft="lg" paddingRight="lg" flexDirection="column">
                    <SyncStoreDomainBanner
                        syncStatus={syncStatus}
                        shopName={shopName}
                        type="domain"
                    />
                    <SyncStoreDomainBanner
                        syncStatus={urlSyncStatus}
                        shopName={shopName}
                        type="url"
                        completedCount={urlPendingCount}
                        totalCount={urlTotalCount}
                        failedUrls={failedUrls}
                        successfulUrls={successfulUrls}
                    />
                    <SyncStoreDomainBanner
                        syncStatus={fileIngestionStatus}
                        shopName={shopName}
                        type="file"
                        completedCount={filePendingCount}
                    />

                    {!selectedFolder && (
                        <DocumentFilters
                            selectedFilter={selectedFilter}
                            onFilterChange={handleDocumentFilterChange}
                        />
                    )}
                </Box>
                <KnowledgeHubTable
                    data={enrichedTableData}
                    metricsDateRange={metricsDateRange}
                    isMetricsEnabled={true}
                    isMetricsLoading={isMetricsLoading}
                    isLoading={isInitialLoading || isUrlFolderSyncing}
                    onRowClick={onClick}
                    onGuidanceRowClick={handleOpenGuidanceEditor}
                    onFaqRowClick={handleOpenFaqEditor}
                    onFaqEditorOpen={handleFaqEditorOpen}
                    onSnippetRowClick={handleOpenSnippetEditor}
                    selectedFolder={selectedFolder}
                    selectedArticleType={type}
                    selectedArticleId={id}
                    selectedTypeFilter={selectedFilter}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    inUseByAIFilter={inUseByAIFilter}
                    onInUseByAIChange={setInUseByAIFilter}
                    faqHelpCenterId={faqHelpCenterId}
                    shopName={shopName}
                    shopType={shopType}
                    guidanceHelpCenterId={guidanceHelpCenterId}
                    snippetHelpCenterId={snippetHelpCenterId}
                    clearSearchParams={clearSearchParams}
                />
            </div>
            <Modal
                isOpen={isAddKnowledgeModalOpen}
                onOpenChange={onKnowledgeModalOpenChange}
            >
                <OverlayHeader title="Create content" />
                <EmptyStates
                    hasWebsiteSync={hasWebsiteSync}
                    titleAlignment="flex-start"
                    helpCenterId={faqHelpCenterId}
                    onFaqEditorOpen={handleFaqEditorOpen}
                    sectionsGap="xl"
                />
            </Modal>
            <AddGuidanceTemplateModal onTemplateSelect={handleTemplateSelect} />
            <HelpCenterSelectModal />
            <SyncStoreWebsiteModal
                hasWebsiteSync={hasWebsiteSync}
                helpCenterId={snippetHelpCenterId || 0}
            />
            <SyncUrlModal
                helpCenterId={snippetHelpCenterId || 0}
                existingUrls={existingUrls}
                storeUrl={storeUrl}
            />
            <DeleteUrlModal
                helpCenterId={snippetHelpCenterId || 0}
                urlIngestionLogs={urlIngestionLogs}
                onRefetch={refetchKnowledgeHubArticles}
                onFolderChange={setSelectedFolder}
                onRemoveFolderParam={removeFolderParamFromUrl}
            />
            <DeleteDocumentModal
                helpCenterId={snippetHelpCenterId || 0}
                fileIngestionLogs={fileIngestionLogs}
                onRefetch={refetchKnowledgeHubArticles}
                onFolderChange={setSelectedFolder}
                onRemoveFolderParam={removeFolderParamFromUrl}
            />
            <UploadDocumentModal
                helpCenterId={snippetHelpCenterId || 0}
                shopName={shopName}
                aria-label="Upload Document Modal"
            />
            <GuidanceEditorWrapper
                {...knowledgeEditorProps}
                onClose={handleCloseGuidanceEditor}
                onDelete={handleDeleteGuidanceEditor}
            />
            <FaqEditorWrapper
                faqHelpCenterId={faqHelpCenterId || 0}
                isOpen={faqEditor.isEditorOpen}
                currentArticleId={faqEditor.currentArticleId}
                faqArticleMode={faqEditor.faqArticleMode}
                initialArticleMode={faqEditor.initialArticleMode}
                shopName={shopName}
                onClose={handleCloseFaqEditor}
                onCreate={faqEditor.handleCreate}
                onUpdate={faqEditor.handleUpdate}
                onDelete={handleDeleteFaqEditor}
                versionStatus={faqEditor.versionStatus}
            />
            <SnippetEditorWrapper
                shopName={shopName}
                isOpen={snippetEditor.isEditorOpen}
                onClose={snippetEditorClose}
                onUpdate={snippetEditor.handleUpdate}
                currentArticleId={snippetEditor.currentArticleId}
                snippetType={snippetEditor.currentSnippetType}
                handleVisibilityUpdate={snippetEditor.handleVisibilityUpdate}
            />
            <DrillDownModal isLegacy={false} />
        </div>
    )
}
