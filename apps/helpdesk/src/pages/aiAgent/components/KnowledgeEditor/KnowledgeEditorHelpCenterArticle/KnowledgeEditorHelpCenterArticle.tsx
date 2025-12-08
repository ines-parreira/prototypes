import { useCallback, useState } from 'react'

import { SidePanel } from '@gorgias/axiom'

import type {
    ArticleWithLocalTranslation,
    Category,
    HelpCenter,
    Locale,
} from 'models/helpCenter/types'
import { usePlaygroundPanelInKnowledgeEditor } from 'pages/aiAgent/hooks/usePlaygroundPanelInKnowledgeEditor'

import { PlaygroundPanel } from '../../PlaygroundPanel/PlaygroundPanel'
import type { InitialArticleMode } from './KnowledgeEditorHelpCenterExistingArticle'
import { KnowledgeEditorHelpCenterExistingArticle } from './KnowledgeEditorHelpCenterExistingArticle'
import { KnowledgeEditorHelpCenterNewArticle } from './KnowledgeEditorHelpCenterNewArticle'

import css from './KnowledgeEditorHelpCenterArticle.less'

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
              onUpdated?: () => void
              onDeleted?: () => void
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

    const { isPlaygroundOpen, onTest, onClosePlayground, sidePanelWidth } =
        usePlaygroundPanelInKnowledgeEditor(isFullscreen)

    return (
        <SidePanel
            isOpen={true}
            onOpenChange={(open) => {
                if (!open) {
                    props.onClose()
                }
            }}
            isDismissable
            withoutPadding
            width={sidePanelWidth}
        >
            <div className={css.splitView}>
                <div className={css.editor}>
                    {props.article.type === 'existing' ? (
                        <KnowledgeEditorHelpCenterExistingArticle
                            helpCenter={props.helpCenter}
                            supportedLocales={props.locales}
                            categories={props.categories}
                            onClickPrevious={props.onClickPrevious}
                            onClickNext={props.onClickNext}
                            onClose={props.onClose}
                            onUpdated={props.article.onUpdated}
                            onDeleted={props.article.onDeleted}
                            initialArticleMode={
                                props.article.initialArticleMode
                            }
                            articleId={props.article.articleId}
                            isFullscreen={isFullscreen}
                            onToggleFullscreen={onToggleFullscreen}
                            onTest={onTest}
                        />
                    ) : (
                        <KnowledgeEditorHelpCenterNewArticle
                            helpCenter={props.helpCenter}
                            supportedLocales={props.locales}
                            categories={props.categories}
                            onClickPrevious={props.onClickPrevious}
                            onClickNext={props.onClickNext}
                            onClose={props.onClose}
                            template={props.article.template}
                            onCreated={props.article.onCreated}
                            isFullscreen={isFullscreen}
                            onToggleFullscreen={onToggleFullscreen}
                            onTest={onTest}
                        />
                    )}
                </div>
                {isPlaygroundOpen && (
                    <div className={css.playground}>
                        <PlaygroundPanel onClose={onClosePlayground} />
                    </div>
                )}
            </div>
        </SidePanel>
    )
}
