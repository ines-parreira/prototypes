import { useMemo } from 'react'

import type { GetArticleVersionStatus } from '@gorgias/help-center-types'

import {
    useGetHelpCenter,
    useGetHelpCenterCategoryTree,
} from 'models/helpCenter/queries'
import type {
    CategoryWithLocalTranslation,
    Locale,
} from 'models/helpCenter/types'
import { KnowledgeEditor } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditor'
import type { InitialArticleModeValue } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context'
import CurrentHelpCenterContext from 'pages/settings/helpCenter/contexts/CurrentHelpCenterContext'
import { SupportedLocalesProvider } from 'pages/settings/helpCenter/providers/SupportedLocales'

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
    const { data: faqHelpCenter } = useGetHelpCenter(
        faqHelpCenterId,
        {},
        { enabled: !!faqHelpCenterId },
    )

    const { data: faqCategoryTree } = useGetHelpCenterCategoryTree(
        faqHelpCenter?.id || 0,
        0,
        {
            locale:
                (faqHelpCenter?.default_locale as Locale['code']) || 'en-US',
            order_by: 'position',
            order_dir: 'asc',
        },
        { enabled: !!faqHelpCenter?.id },
    )

    const faqCategories = useMemo(() => {
        if (!faqCategoryTree?.children) return []
        return faqCategoryTree.children.map(
            (cat: CategoryWithLocalTranslation) => ({
                ...cat,
                children:
                    cat.children?.map(
                        (child: CategoryWithLocalTranslation) => child.id,
                    ) || [],
                articleCount: 0,
            }),
        )
    }, [faqCategoryTree])

    const faqLocales: Locale[] = useMemo(() => {
        if (!faqHelpCenter) return []
        return [
            {
                code: faqHelpCenter.default_locale as Locale['code'],
                name: faqHelpCenter.default_locale,
            },
        ]
    }, [faqHelpCenter])

    if (!isOpen || !faqHelpCenter) {
        return null
    }

    return (
        <SupportedLocalesProvider>
            <CurrentHelpCenterContext.Provider value={faqHelpCenter}>
                <KnowledgeEditor
                    variant="article"
                    helpCenter={faqHelpCenter}
                    locales={faqLocales}
                    categories={faqCategories}
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
            </CurrentHelpCenterContext.Provider>
        </SupportedLocalesProvider>
    )
}
