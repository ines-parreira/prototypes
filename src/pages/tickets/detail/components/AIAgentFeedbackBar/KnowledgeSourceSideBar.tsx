import { useCallback, useEffect, useMemo } from 'react'

import { useGetMultipleHelpCenterArticleLists } from 'models/helpCenter/queries'
import { useMultipleGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'
import { Drawer } from 'pages/common/components/Drawer'
import { HelpCenterArticleModalView } from 'pages/settings/helpCenter/components/articles/HelpCenterEditArticleModalContent/types'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { useAbilityChecker } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { useEditionManager } from 'pages/settings/helpCenter/providers/EditionManagerContext'
import { KnowledgeSourceSideBarMode } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/context'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import KnowledgeSourcePreview from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourcePreview'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSideBar.less'
import { useUnsavedChangesModal } from 'pages/tickets/detail/components/AIAgentFeedbackBar/UnsavedChangesModalProvider'

import KnowledgeSourceArticleEditor from './KnowledgeSourceArticleEditor'
import { ManageGuidanceForm } from './ManageGuidanceForm'
import {
    AiAgentKnowledgeResourceTypeEnum,
    SuggestedResourceValue,
} from './types'

type KnowledgeSourceSideBarProps = {
    articles: NonNullable<
        ReturnType<typeof useGetMultipleHelpCenterArticleLists>['articles']
    >
    guidanceArticles: NonNullable<
        ReturnType<typeof useMultipleGuidanceArticles>['guidanceArticles']
    >

    shopName: string
    shopType: string
    onSubmitNewMissingKnowledge: (resource: SuggestedResourceValue) => void
    onKnowledgeResourceEditClick: (
        resourceId: string,
        resourceType: AiAgentKnowledgeResourceTypeEnum,
    ) => void
    onKnowledgeResourceSaved: (
        resourceId: string,
        resourceType: AiAgentKnowledgeResourceTypeEnum,
        isNew: boolean,
    ) => void
}

const KnowledgeSourceSideBar = ({
    articles,
    guidanceArticles,
    shopName,
    shopType,
    onSubmitNewMissingKnowledge,
    onKnowledgeResourceEditClick,
    onKnowledgeResourceSaved,
}: KnowledgeSourceSideBarProps) => {
    const { selectedResource, mode, closeModal, openEdit } =
        useKnowledgeSourceSideBar()
    const { getHasUnsavedChanges, openUnsavedChangesModal } =
        useUnsavedChangesModal()
    const helpCenter = useCurrentHelpCenter()
    const { setEditModal } = useEditionManager()
    const { isPassingRulesCheck } = useAbilityChecker()

    const canUpdateArticle = isPassingRulesCheck(({ can }) =>
        can('update', 'ArticleEntity'),
    )

    const isPreviewMode =
        mode === KnowledgeSourceSideBarMode.PREVIEW && !!selectedResource
    const isEditMode =
        mode === KnowledgeSourceSideBarMode.EDIT && !!selectedResource
    const isCreateMode = mode === KnowledgeSourceSideBarMode.CREATE

    const isGuidance =
        selectedResource?.knowledgeResourceType ===
        AiAgentKnowledgeResourceTypeEnum.GUIDANCE

    const selectedResourceIdAsNumber = useMemo(
        () => Number(selectedResource?.id),
        [selectedResource?.id],
    )

    const shouldDisplayArticleEditor =
        (isEditMode || isCreateMode) &&
        canUpdateArticle &&
        selectedResource?.knowledgeResourceType ===
            AiAgentKnowledgeResourceTypeEnum.ARTICLE

    const selectedGuidance = useMemo(
        () =>
            guidanceArticles.find(
                (guidance) => guidance.id === selectedResourceIdAsNumber,
            ),
        [guidanceArticles, selectedResourceIdAsNumber],
    )

    const selectedArticle = useMemo(() => {
        const articleIndex = articles.findIndex(
            (article) => article.id === selectedResourceIdAsNumber,
        )
        if (articleIndex === -1) {
            return null
        }

        return {
            ...articles[articleIndex],
            position: Math.max(articleIndex, 0),
        }
    }, [articles, selectedResourceIdAsNumber])

    const resourceUpdatedAt = useMemo(() => {
        return (
            selectedGuidance?.lastUpdated || selectedArticle?.updated_datetime
        )
    }, [selectedGuidance?.lastUpdated, selectedArticle?.updated_datetime])

    useEffect(() => {
        if (!!mode && shouldDisplayArticleEditor) {
            setEditModal({
                isOpened: true,
                view: HelpCenterArticleModalView.BASIC,
            })
        }
    }, [mode, setEditModal, shouldDisplayArticleEditor])

    const onClose = useCallback(() => {
        closeModal()
        setEditModal({
            isOpened: false,
            view: null,
        })
    }, [setEditModal, closeModal])

    const onEditClick = useCallback(() => {
        if (!selectedResource) {
            return
        }

        onKnowledgeResourceEditClick(
            selectedResource.id,
            selectedResource.knowledgeResourceType,
        )
        openEdit(selectedResource)
    }, [onKnowledgeResourceEditClick, openEdit, selectedResource])

    return (
        <>
            {!shouldDisplayArticleEditor && (
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
                            onEdit={onEditClick}
                            shopName={shopName}
                            shopType={shopType}
                        />
                    )}

                    {(isEditMode || isCreateMode) && isGuidance && (
                        <ManageGuidanceForm
                            shopName={shopName}
                            shopType={shopType}
                            url={selectedResource.url}
                            guidance={selectedGuidance}
                            helpCenter={helpCenter}
                            onSubmitNewMissingKnowledge={
                                onSubmitNewMissingKnowledge
                            }
                            onSaveClick={onKnowledgeResourceSaved}
                        />
                    )}
                </Drawer>
            )}

            {shouldDisplayArticleEditor && (
                <KnowledgeSourceArticleEditor
                    article={selectedArticle}
                    isCreateMode={isCreateMode}
                    onClose={onClose}
                    onSubmitNewMissingKnowledge={onSubmitNewMissingKnowledge}
                    onSaveClick={onKnowledgeResourceSaved}
                />
            )}
        </>
    )
}

export default KnowledgeSourceSideBar
