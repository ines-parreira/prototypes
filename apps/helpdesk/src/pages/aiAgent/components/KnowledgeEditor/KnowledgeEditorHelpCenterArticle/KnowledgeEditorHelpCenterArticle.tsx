import { useCallback, useEffect, useMemo, useRef } from 'react'

import cn from 'classnames'

import { Card } from '@gorgias/axiom'
import type { GetArticleVersionStatus } from '@gorgias/help-center-types'

import { getLast28DaysDateRange } from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { useNotify } from 'hooks/useNotify'
import { isGorgiasApiError } from 'models/api/types'
import type { ArticleWithLocalTranslation } from 'models/helpCenter/types'
import CurrentHelpCenterContext from 'pages/settings/helpCenter/contexts/CurrentHelpCenterContext'
import { SupportedLocalesProvider } from 'pages/settings/helpCenter/providers/SupportedLocales'

import { PlaygroundPanel } from '../../PlaygroundPanel/PlaygroundPanel'
import { KnowledgeEditorLoadingShell } from '../KnowledgeEditorLoadingShell'
import type { KnowledgeEditorSharedPanelState } from '../sharedPanel.types'
import { ArticleEditorContent } from './ArticleEditorContent'
import type {
    ArticleContextConfig,
    ArticleModeType,
    HistoricalVersionState,
} from './context'
import { ArticleContextProvider, useArticleContext } from './context'
import { useKnowledgeEditorArticleData } from './useKnowledgeEditorArticleData'

import css from '../shared.less'

type Props = {
    isOpen?: boolean
    helpCenterId: number
    shopName?: string
    onClickPrevious?: () => void
    onClickNext?: () => void
    onClose: () => void
    showMissingKnowledgeCheckbox?: boolean
    article: (
        | {
              type: 'existing'
              initialArticleMode: 'read' | 'edit'
              articleId: number
              versionStatus?: GetArticleVersionStatus
              initialVersionId?: number
          }
        | {
              type: 'new'
              template?: {
                  title: string
                  content: string
                  key: string
              }
              onCreated: (
                  article: ArticleWithLocalTranslation,
                  shouldAddToMissingKnowledge?: boolean,
              ) => void
          }
    ) & {
        onUpdated?: () => void
        onDeleted?: () => void
        onEdit?: () => void
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
    const { article, isOpen = true, onClose } = props
    const isExisting = article.type === 'existing'
    const articleId = isExisting ? article.articleId : 0
    const versionStatus: GetArticleVersionStatus = isExisting
        ? (article.versionStatus ?? 'latest_draft')
        : 'latest_draft'

    const {
        helpCenter,
        categories,
        locales,
        isHelpCenterDataLoading,
        article: fetchedArticle,
        isArticleLoading,
        isArticleError,
        articleError,
        initialVersionData: rawInitialVersionData,
        isInitialVersionLoading,
    } = useKnowledgeEditorArticleData({
        helpCenterId: props.helpCenterId,
        articleId,
        versionStatus,
        initialVersionId: isExisting ? article.initialVersionId : undefined,
        isOpen,
        isExisting,
    })

    const computedInitialVersionData = useMemo<
        HistoricalVersionState | undefined
    >(() => {
        if (!rawInitialVersionData) return undefined
        return {
            versionId: rawInitialVersionData.id,
            version: rawInitialVersionData.version,
            title: rawInitialVersionData.title,
            content: rawInitialVersionData.content,
            publishedDatetime: rawInitialVersionData.published_datetime,
            publisherUserId: rawInitialVersionData.publisher_user_id,
            commitMessage: rawInitialVersionData.commit_message,
            impactDateRange: getLast28DaysDateRange(),
        }
    }, [rawInitialVersionData])

    const { error: notifyError } = useNotify()

    useEffect(() => {
        if (isOpen && isArticleError && isExisting && articleError) {
            const is404 =
                isGorgiasApiError(articleError) &&
                articleError.response.status === 404

            const message = is404
                ? 'This FAQ article is no longer available. It may have been deleted.'
                : 'Unable to load this FAQ article. Please try again or contact support.'

            notifyError(message)
            onClose()
        }
    }, [isOpen, isArticleError, isExisting, articleError, notifyError, onClose])

    if (isHelpCenterDataLoading) {
        return <KnowledgeEditorLoadingShell />
    }

    if (!helpCenter) {
        return null
    }

    const initialMode: ArticleModeType =
        article.type === 'new'
            ? 'create'
            : article.initialArticleMode === 'edit'
              ? 'edit'
              : 'read'

    const config: ArticleContextConfig = {
        helpCenter,
        supportedLocales: locales,
        categories,
        shopName: props.shopName,
        articleId: isExisting ? article.articleId : undefined,
        initialArticle: fetchedArticle ?? undefined,
        versionStatus,
        initialVersionId: isExisting ? article.initialVersionId : undefined,
        template: article.type === 'new' ? article.template : undefined,
        initialMode,
        onClose,
        onClickPrevious: props.onClickPrevious,
        onClickNext: props.onClickNext,
        onCreatedFn: article.type === 'new' ? article.onCreated : undefined,
        onUpdatedFn: article.onUpdated,
        onDeletedFn: article.onDeleted,
        onEditFn: article.onEdit,
        showMissingKnowledgeCheckbox: props.showMissingKnowledgeCheckbox,
        initialVersionData: computedInitialVersionData,
    }

    if (isInitialVersionLoading) {
        return <KnowledgeEditorLoadingShell />
    }

    return (
        <SupportedLocalesProvider>
            <CurrentHelpCenterContext.Provider value={helpCenter}>
                <ArticleContextProvider config={config}>
                    <ArticleEditorInner
                        isLoading={isExisting && isArticleLoading}
                        onSharedPanelStateChange={
                            props.onSharedPanelStateChange
                        }
                    />
                </ArticleContextProvider>
            </CurrentHelpCenterContext.Provider>
        </SupportedLocalesProvider>
    )
}
