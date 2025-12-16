import { useRef } from 'react'

import { LegacyLoadingSpinner, SidePanel } from '@gorgias/axiom'
import type { GetArticleVersionStatus } from '@gorgias/help-center-types'

import { useGetHelpCenterArticle } from 'models/helpCenter/queries'
import type {
    ArticleWithLocalTranslation,
    Category,
    HelpCenter,
    Locale,
} from 'models/helpCenter/types'

import { PlaygroundPanel } from '../../PlaygroundPanel/PlaygroundPanel'
import { ArticleEditorContent } from './ArticleEditorContent'
import type { ArticleContextConfig, ArticleModeType } from './context'
import { ArticleContextProvider, useArticleContext } from './context'

import css from '../shared.less'

type Props = {
    helpCenter: HelpCenter
    locales: Locale[]
    categories: Category[]
    onClickPrevious?: () => void
    onClickNext?: () => void
    onClose: () => void
    article: (
        | {
              type: 'existing'
              initialArticleMode: 'read' | 'edit'
              articleId: number
              versionStatus?: GetArticleVersionStatus
          }
        | {
              type: 'new'
              template?: {
                  title: string
                  content: string
                  key: string
              }
              onCreated: (article: ArticleWithLocalTranslation) => void
          }
    ) & {
        onUpdated?: () => void
        onDeleted?: () => void
    }
}

const ArticleEditorInner = () => {
    const closeHandlerRef = useRef<(() => void) | null>(null)

    const { playground, config } = useArticleContext()

    return (
        <SidePanel
            isOpen={true}
            onOpenChange={(open) => {
                if (!open) {
                    if (closeHandlerRef.current) {
                        closeHandlerRef.current()
                    } else {
                        config.onClose()
                    }
                }
            }}
            isDismissable
            withoutPadding
            width={playground.sidePanelWidth}
        >
            <div className={css.splitView}>
                <div className={css.editor}>
                    <ArticleEditorContent closeHandlerRef={closeHandlerRef} />
                </div>
                {playground.isOpen && (
                    <div className={css.playground}>
                        <PlaygroundPanel onClose={playground.onClose} />
                    </div>
                )}
            </div>
        </SidePanel>
    )
}

export const KnowledgeEditorHelpCenterArticle = (props: Props) => {
    const { article } = props
    const isExisting = article.type === 'existing'
    const articleId = isExisting ? article.articleId : 0

    const getArticle = useGetHelpCenterArticle(
        articleId,
        props.helpCenter.id,
        props.helpCenter.default_locale,
        'latest_draft',
        {
            enabled: isExisting,
            cacheTime: -1, // we don't clear the cache on mutations so we are forcing the query to go to the server instead.
        },
    )

    if (isExisting && (getArticle.isLoading || !getArticle.data)) {
        return (
            <SidePanel isOpen={true} onOpenChange={() => {}} withoutPadding>
                <div className={css.loader}>
                    <LegacyLoadingSpinner size="big" />
                </div>
            </SidePanel>
        )
    }

    const initialMode: ArticleModeType =
        article.type === 'new'
            ? 'create'
            : article.initialArticleMode === 'edit'
              ? 'edit'
              : 'read'

    const config: ArticleContextConfig = {
        helpCenter: props.helpCenter,
        supportedLocales: props.locales,
        categories: props.categories,
        articleId: isExisting ? article.articleId : undefined,
        initialArticle: getArticle.data ?? undefined,
        versionStatus: 'latest_draft',
        template: article.type === 'new' ? article.template : undefined,
        initialMode,
        onClose: props.onClose,
        onClickPrevious: props.onClickPrevious,
        onClickNext: props.onClickNext,
        onCreatedFn: article.type === 'new' ? article.onCreated : undefined,
        onUpdatedFn: article.onUpdated,
        onDeletedFn: article.onDeleted,
    }

    return (
        <ArticleContextProvider config={config}>
            <ArticleEditorInner />
        </ArticleContextProvider>
    )
}
