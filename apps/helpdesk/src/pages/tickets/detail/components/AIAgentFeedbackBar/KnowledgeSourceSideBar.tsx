import type { ComponentProps } from 'react'
import { useCallback, useMemo } from 'react'

import type { useGetMultipleHelpCenterArticleLists } from 'models/helpCenter/queries'
import { KnowledgeEditor } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditor'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { KnowledgeSourceSideBarMode } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/context'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'

import type { SuggestedResourceValue } from './types'
import { AiAgentKnowledgeResourceTypeEnum } from './types'

type KnowledgeSourceSideBarProps = {
    articles: NonNullable<
        ReturnType<typeof useGetMultipleHelpCenterArticleLists>['articles']
    >

    shopName: string
    shopType: string
    onSubmitNewMissingKnowledge: (resource: SuggestedResourceValue) => void
    onKnowledgeResourceEditClick: (
        resourceId: string,
        resourceType: AiAgentKnowledgeResourceTypeEnum,
        resourceSetId: string,
    ) => void
    onKnowledgeResourceSaved: (
        resourceId: string,
        resourceType: AiAgentKnowledgeResourceTypeEnum,
        resourceSetId: string,
        isNew: boolean,
    ) => void
}

type KnowledgeEditorProps = ComponentProps<typeof KnowledgeEditor>

const KnowledgeSourceSideBar = ({
    articles,
    shopName,
    shopType,
    onSubmitNewMissingKnowledge,
    onKnowledgeResourceEditClick,
    onKnowledgeResourceSaved,
}: KnowledgeSourceSideBarProps) => {
    const { selectedResource, mode, closeModal } = useKnowledgeSourceSideBar()
    const helpCenter = useCurrentHelpCenter()

    const handleEdit = useCallback(() => {
        if (!selectedResource) return
        onKnowledgeResourceEditClick(
            selectedResource.id,
            selectedResource.knowledgeResourceType,
            selectedResource.helpCenterId || '',
        )
    }, [selectedResource, onKnowledgeResourceEditClick])

    const isPreviewMode =
        mode === KnowledgeSourceSideBarMode.PREVIEW && !!selectedResource
    const isCreateMode = mode === KnowledgeSourceSideBarMode.CREATE

    const isGuidance =
        selectedResource?.knowledgeResourceType ===
        AiAgentKnowledgeResourceTypeEnum.GUIDANCE

    const selectedResourceIdAsNumber = useMemo(
        () => Number(selectedResource?.id),
        [selectedResource?.id],
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

    const editorProps = useMemo((): KnowledgeEditorProps | null => {
        if (isPreviewMode && isGuidance) {
            return {
                variant: 'guidance',
                shopName,
                shopType,
                guidanceArticleId: selectedResourceIdAsNumber,
                onClose: closeModal,
                guidanceMode: 'read',
                isOpen: true,
                onDelete: () => closeModal(),
                onUpdate: () => {
                    onKnowledgeResourceSaved(
                        selectedResource.id,
                        selectedResource.knowledgeResourceType,
                        selectedResource.helpCenterId || '',
                        false,
                    )
                },
                onEdit: handleEdit,
            }
        }

        if (isPreviewMode && !isGuidance && selectedArticle && helpCenter) {
            return {
                variant: 'article',
                helpCenterId: helpCenter.id,
                shopName,
                onClose: closeModal,
                article: {
                    type: 'existing',
                    initialArticleMode: 'read',
                    articleId: selectedResourceIdAsNumber,
                    onDeleted: () => closeModal(),
                    onUpdated: () => {
                        onKnowledgeResourceSaved(
                            selectedResource.id,
                            selectedResource.knowledgeResourceType,
                            selectedResource.helpCenterId || '',
                            false,
                        )
                    },
                    onEdit: handleEdit,
                },
            }
        }

        if (isCreateMode && isGuidance) {
            return {
                variant: 'guidance',
                shopName,
                shopType,
                onClose: closeModal,
                guidanceMode: 'create',
                isOpen: true,
                showMissingKnowledgeCheckbox: true,
                onCreate: (guidance, shouldAddToMissingKnowledge = true) => {
                    const resourceSetId =
                        selectedResource.helpCenterId ??
                        String(helpCenter?.id ?? '')

                    onKnowledgeResourceSaved(
                        String(guidance.id),
                        AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                        resourceSetId,
                        true,
                    )

                    if (!shouldAddToMissingKnowledge) {
                        return
                    }

                    onSubmitNewMissingKnowledge({
                        resourceId: String(guidance.id),
                        resourceType: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                        resourceSetId,
                        resourceLocale: guidance.locale,
                    })
                },
            }
        }

        if (isCreateMode && !isGuidance && helpCenter) {
            return {
                variant: 'article',
                helpCenterId: helpCenter.id,
                shopName,
                onClose: closeModal,
                showMissingKnowledgeCheckbox: true,
                article: {
                    type: 'new',
                    onCreated: (
                        article,
                        shouldAddToMissingKnowledge = true,
                    ) => {
                        onKnowledgeResourceSaved(
                            String(article.id),
                            AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                            String(helpCenter.id),
                            true,
                        )

                        if (!shouldAddToMissingKnowledge) {
                            return
                        }

                        onSubmitNewMissingKnowledge({
                            resourceId: String(article.id),
                            resourceType:
                                AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                            resourceSetId: String(article.help_center_id),
                            resourceLocale: article.translation.locale,
                        })
                    },
                },
            }
        }

        return null
    }, [
        isPreviewMode,
        isCreateMode,
        isGuidance,
        selectedResource,
        selectedArticle,
        selectedResourceIdAsNumber,
        helpCenter,
        shopName,
        shopType,
        closeModal,
        handleEdit,
        onSubmitNewMissingKnowledge,
        onKnowledgeResourceSaved,
    ])

    if (!editorProps) {
        return null
    }

    return <KnowledgeEditor {...editorProps} />
}

export default KnowledgeSourceSideBar
