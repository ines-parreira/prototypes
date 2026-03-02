import type { GetArticleVersionStatus } from '@gorgias/help-center-types'

import { KnowledgeEditor } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditor'
import type { InitialArticleModeValue } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context'

type FaqEditorWrapperProps = {
    faqHelpCenterId: number
    isOpen: boolean
    currentArticleId?: number
    faqArticleMode: 'new' | 'existing'
    initialArticleMode: InitialArticleModeValue
    shopName?: string
    onClose: () => void
    onCreate: (createdArticle?: { id: number }) => void
    onUpdate: () => void
    onDelete: () => void
    onClickPrevious?: () => void
    onClickNext?: () => void
    versionStatus?: GetArticleVersionStatus
}

export const FaqEditorWrapper = ({
    faqHelpCenterId,
    isOpen,
    currentArticleId,
    faqArticleMode,
    initialArticleMode,
    shopName,
    onClose,
    onCreate,
    onUpdate,
    onDelete,
    onClickPrevious,
    onClickNext,
    versionStatus,
}: FaqEditorWrapperProps) => {
    return (
        <KnowledgeEditor
            variant="article"
            isOpen={isOpen}
            helpCenterId={faqHelpCenterId}
            shopName={shopName}
            onClickPrevious={onClickPrevious}
            onClickNext={onClickNext}
            onClose={onClose}
            article={
                faqArticleMode === 'new'
                    ? {
                          type: 'new',
                          onCreated: onCreate,
                          onUpdated: onUpdate,
                          onDeleted: onDelete,
                      }
                    : {
                          type: 'existing',
                          articleId: currentArticleId!,
                          initialArticleMode,
                          onUpdated: onUpdate,
                          onDeleted: onDelete,
                          versionStatus,
                      }
            }
        />
    )
}
