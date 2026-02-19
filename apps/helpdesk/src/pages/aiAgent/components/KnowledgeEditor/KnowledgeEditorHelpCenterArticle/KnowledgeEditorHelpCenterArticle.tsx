import { useCallback, useEffect, useRef } from 'react'

import cn from 'classnames'

import { Card } from '@gorgias/axiom'
import type { GetArticleVersionStatus } from '@gorgias/help-center-types'

import { useNotify } from 'hooks/useNotify'
import { isGorgiasApiError } from 'models/api/types'
import { useGetHelpCenterArticle } from 'models/helpCenter/queries'
import type {
    ArticleWithLocalTranslation,
    Category,
    HelpCenter,
    Locale,
} from 'models/helpCenter/types'

import { PlaygroundPanel } from '../../PlaygroundPanel/PlaygroundPanel'
import { KnowledgeEditorLoadingShell } from '../KnowledgeEditorLoadingShell'
import type { KnowledgeEditorSharedPanelState } from '../sharedPanel.types'
import { ArticleEditorContent } from './ArticleEditorContent'
import type { ArticleContextConfig, ArticleModeType } from './context'
import { ArticleContextProvider, useArticleContext } from './context'

import css from '../shared.less'

type Props = {
    helpCenter: HelpCenter
    locales: Locale[]
    categories: Category[]
    shopName?: string
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
    onSharedPanelStateChange?: (state: KnowledgeEditorSharedPanelState) => void
}

const ArticleEditorInner = ({
    isLoading,
    onSharedPanelStateChange,
}: {
    isLoading: boolean
    onSharedPanelStateChange?: (state: KnowledgeEditorSharedPanelState) => void
}) => {
    const closeHandlerRef = useRef<(() => void) | null>(null)

    const { playground, config } = useArticleContext()
    const { onClose } = config

    const onRequestClose = useCallback(() => {
        if (closeHandlerRef.current) {
            closeHandlerRef.current()
            return
        }

        onClose()
    }, [onClose])

    useEffect(() => {
        if (!onSharedPanelStateChange) {
            return
        }

        onSharedPanelStateChange({
            width: playground.sidePanelWidth,
            onRequestClose,
        })
    }, [onSharedPanelStateChange, playground.sidePanelWidth, onRequestClose])

    if (isLoading) {
        return <KnowledgeEditorLoadingShell />
    }

    return (
        <div className={css.splitView}>
            <Card elevation="mid" className={css.editor} padding={0}>
                <ArticleEditorContent closeHandlerRef={closeHandlerRef} />
            </Card>
            <div
                className={cn(
                    css.playground,
                    playground.isOpen
                        ? css['playground-open']
                        : css['playground-closed'],
                )}
            >
                <PlaygroundPanel onClose={playground.onClose} />
            </div>
        </div>
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
            throwOn404: true,
        },
    )

    const { error: notifyError } = useNotify()

    useEffect(() => {
        // Only show error if editor is actually open and attempting to display content
        if (getArticle.isError && isExisting && getArticle.error) {
            // Check if it's a 404 error
            const is404 =
                isGorgiasApiError(getArticle.error) &&
                getArticle.error.response.status === 404

            const message = is404
                ? 'This FAQ article is no longer available. It may have been deleted.'
                : 'Unable to load this FAQ article. Please try again or contact support.'

            notifyError(message)
            props.onClose()
        }
    }, [getArticle.isError, isExisting, getArticle.error, notifyError, props])

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
        shopName: props.shopName,
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
            <ArticleEditorInner
                isLoading={!!articleId && getArticle.isLoading}
                onSharedPanelStateChange={props.onSharedPanelStateChange}
            />
        </ArticleContextProvider>
    )
}
