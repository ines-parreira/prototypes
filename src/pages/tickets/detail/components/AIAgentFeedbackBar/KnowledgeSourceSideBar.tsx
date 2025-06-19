import { useMemo } from 'react'

import { useGetMultipleHelpCenterArticleLists } from 'models/helpCenter/queries'
import { useMultipleGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'
import { Drawer } from 'pages/common/components/Drawer'
import { KnowledgeSourceSideBarMode } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/context'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import KnowledgeSourcePreview from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourcePreview'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSideBar.less'

import { AiAgentKnowledgeResourceTypeEnum } from './types'

type KnowledgeSourceSideBarProps = {
    isLoading?: boolean
    articles: NonNullable<
        ReturnType<typeof useGetMultipleHelpCenterArticleLists>['articles']
    >
    guidanceArticles: NonNullable<
        ReturnType<typeof useMultipleGuidanceArticles>['guidanceArticles']
    >
}

const KnowledgeSourceSideBar = ({
    isLoading = false,
    articles,
    guidanceArticles,
}: KnowledgeSourceSideBarProps) => {
    const { selectedResource, mode, closeModal } = useKnowledgeSourceSideBar()

    const isPreviewMode =
        mode === KnowledgeSourceSideBarMode.PREVIEW && !!selectedResource

    const resourceUpdatedAt = useMemo(() => {
        const selectedResourceIdAsNumber = Number(selectedResource?.id)

        const article = articles.find(
            (article) => article.id === selectedResourceIdAsNumber,
        )
        const guidance = guidanceArticles.find(
            (guidance) => guidance.id === selectedResourceIdAsNumber,
        )

        return selectedResource?.type ===
            AiAgentKnowledgeResourceTypeEnum.GUIDANCE
            ? guidance?.lastUpdated
            : article?.updated_datetime
    }, [
        articles,
        guidanceArticles,
        selectedResource?.id,
        selectedResource?.type,
    ])

    return (
        <Drawer
            fullscreen={false}
            isLoading={isLoading}
            aria-label={'resource'}
            open={!!mode}
            portalRootId="app-root"
            onBackdropClick={closeModal}
            rootClassName={css.root}
        >
            {isPreviewMode && (
                <KnowledgeSourcePreview
                    {...selectedResource}
                    lastUpdatedAt={resourceUpdatedAt}
                    onClose={closeModal}
                />
            )}
        </Drawer>
    )
}

export default KnowledgeSourceSideBar
