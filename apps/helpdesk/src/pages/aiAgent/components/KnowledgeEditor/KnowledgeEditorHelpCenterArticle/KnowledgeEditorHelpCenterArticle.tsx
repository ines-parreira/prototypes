import { useCallback, useState } from 'react'

import { SidePanel } from '@gorgias/axiom'

import {
    ArticleWithLocalTranslation,
    Category,
    HelpCenter,
    Locale,
} from 'models/helpCenter/types'

import {
    InitialArticleMode,
    KnowledgeEditorHelpCenterExistingArticle,
} from './KnowledgeEditorHelpCenterExistingArticle'
import { KnowledgeEditorHelpCenterNewArticle } from './KnowledgeEditorHelpCenterNewArticle'

type Props = {
    helpCenter: HelpCenter
    locales: Locale[]
    categories: Category[]
    onClickPrevious: () => void
    onClickNext: () => void
    onClose: () => void
    article:
        | {
              type: 'existing'
              initialArticleMode: InitialArticleMode
              articleId: number
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
}

export const KnowledgeEditorHelpCenterArticle = (props: Props) => {
    const [isFullscreen, setIsFullscreen] = useState(false)

    const onToggleFullscreen = useCallback(() => {
        setIsFullscreen(!isFullscreen)
    }, [isFullscreen])

    return (
        <SidePanel
            isOpen={true}
            withoutPadding
            width={isFullscreen ? '100vw' : '66vw'}
        >
            {props.article.type === 'existing' ? (
                <KnowledgeEditorHelpCenterExistingArticle
                    helpCenter={props.helpCenter}
                    supportedLocales={props.locales}
                    categories={props.categories}
                    onClickPrevious={props.onClickPrevious}
                    onClickNext={props.onClickNext}
                    onClose={props.onClose}
                    initialArticleMode={props.article.initialArticleMode}
                    articleId={props.article.articleId}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={onToggleFullscreen}
                />
            ) : (
                <KnowledgeEditorHelpCenterNewArticle
                    helpCenter={props.helpCenter}
                    supportedLocales={props.locales}
                    categories={props.categories}
                    onClose={props.onClose}
                    template={props.article.template}
                    onCreated={props.article.onCreated}
                    isFullscreen={isFullscreen}
                    onToggleFullscreen={onToggleFullscreen}
                />
            )}
        </SidePanel>
    )
}
