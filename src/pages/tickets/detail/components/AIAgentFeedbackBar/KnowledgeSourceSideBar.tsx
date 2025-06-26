import { useMemo } from 'react'

import { useGetMultipleHelpCenterArticleLists } from 'models/helpCenter/queries'
import { useMultipleGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'
import { Drawer } from 'pages/common/components/Drawer'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { KnowledgeSourceSideBarMode } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/context'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import KnowledgeSourcePreview from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourcePreview'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSideBar.less'
import { useUnsavedChangesModal } from 'pages/tickets/detail/components/AIAgentFeedbackBar/UnsavedChangesModalProvider'

import { ManageGuidanceForm } from './ManageGuidanceForm'
import { AiAgentKnowledgeResourceTypeEnum } from './types'

type KnowledgeSourceSideBarProps = {
    articles: NonNullable<
        ReturnType<typeof useGetMultipleHelpCenterArticleLists>['articles']
    >
    guidanceArticles: NonNullable<
        ReturnType<typeof useMultipleGuidanceArticles>['guidanceArticles']
    >

    shopName: string
    shopType: string
}

const KnowledgeSourceSideBar = ({
    articles,
    guidanceArticles,
    shopName,
    shopType,
}: KnowledgeSourceSideBarProps) => {
    const { selectedResource, mode, closeModal, openEdit } =
        useKnowledgeSourceSideBar()

    const { getHasUnsavedChanges, openUnsavedChangesModal } =
        useUnsavedChangesModal()

    const helpCenter = useCurrentHelpCenter()

    const isPreviewMode =
        mode === KnowledgeSourceSideBarMode.PREVIEW && !!selectedResource
    const isManageMode =
        (mode === KnowledgeSourceSideBarMode.EDIT && !!selectedResource) ||
        mode === KnowledgeSourceSideBarMode.CREATE

    const isGuidance =
        selectedResource?.knowledgeResourceType ===
        AiAgentKnowledgeResourceTypeEnum.GUIDANCE

    const selectedResourceIdAsNumber = useMemo(
        () => Number(selectedResource?.id),
        [selectedResource?.id],
    )
    const selectedGuidance = useMemo(
        () =>
            guidanceArticles.find(
                (guidance) => guidance.id === selectedResourceIdAsNumber,
            ),
        [guidanceArticles, selectedResourceIdAsNumber],
    )

    const selectedArticle = useMemo(
        () =>
            articles.find(
                (article) => article.id === selectedResourceIdAsNumber,
            ),
        [articles, selectedResourceIdAsNumber],
    )

    const resourceUpdatedAt = useMemo(() => {
        return (
            selectedGuidance?.lastUpdated || selectedArticle?.updated_datetime
        )
    }, [selectedGuidance?.lastUpdated, selectedArticle?.updated_datetime])

    return (
        <Drawer
            fullscreen={false}
            isLoading={false}
            aria-label={'knowledge resource sidebar'}
            open={!!mode}
            portalRootId="app-root"
            onBackdropClick={() =>
                getHasUnsavedChanges()
                    ? openUnsavedChangesModal()
                    : closeModal()
            }
            rootClassName={css.root}
        >
            {isPreviewMode && (
                <KnowledgeSourcePreview
                    {...selectedResource}
                    lastUpdatedAt={resourceUpdatedAt}
                    onClose={closeModal}
                    onEdit={() => openEdit(selectedResource)}
                />
            )}

            {isManageMode && isGuidance && (
                <ManageGuidanceForm
                    shopName={shopName}
                    shopType={shopType}
                    url={selectedResource.url}
                    guidance={selectedGuidance}
                    helpCenter={helpCenter}
                />
            )}
        </Drawer>
    )
}

export default KnowledgeSourceSideBar
