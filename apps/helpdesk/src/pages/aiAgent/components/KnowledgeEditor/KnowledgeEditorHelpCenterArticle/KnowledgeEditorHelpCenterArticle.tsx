import { useCallback, useEffect, useRef } from 'react'

import cn from 'classnames'

import { Card } from '@gorgias/axiom'
import type { GetArticleVersionStatus } from '@gorgias/help-center-types'

import { useNotify } from 'hooks/useNotify'
import { isGorgiasApiError } from 'models/api/types'
import { useGetHelpCenterArticle } from 'models/helpCenter/queries'
import type { ArticleWithLocalTranslation } from 'models/helpCenter/types'
import CurrentHelpCenterContext from 'pages/settings/helpCenter/contexts/CurrentHelpCenterContext'
import { SupportedLocalesProvider } from 'pages/settings/helpCenter/providers/SupportedLocales'

import { PlaygroundPanel } from '../../PlaygroundPanel/PlaygroundPanel'
import { KnowledgeEditorLoadingShell } from '../KnowledgeEditorLoadingShell'
import type { KnowledgeEditorSharedPanelState } from '../sharedPanel.types'
import { ArticleEditorContent } from './ArticleEditorContent'
import type { ArticleContextConfig, ArticleModeType } from './context'
import { ArticleContextProvider, useArticleContext } from './context'
import { useFaqHelpCenterData } from './useFaqHelpCenterData'

import css from '../shared.less'

type Props = {
    helpCenterId: number
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
    const { article, onClose } = props
    const isExisting = article.type === 'existing'
    const articleId = isExisting ? article.articleId : 0
    const versionStatus: GetArticleVersionStatus = isExisting
        ? (article.versionStatus ?? 'latest_draft')
        : 'latest_draft'

    const {
        helpCenter,
        categories,
        locales,
        isLoading: isHelpCenterDataLoading,
    } = useFaqHelpCenterData(props.helpCenterId)

    const getArticle = useGetHelpCenterArticle(
        articleId,
        helpCenter?.id ?? 0,
        helpCenter?.default_locale ?? 'en-US',
        versionStatus,
        {
            enabled: isExisting && !!helpCenter && articleId > 0,
            throwOn404: true,
            refetchOnWindowFocus: false,
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
            onClose()
        }
    }, [getArticle.isError, isExisting, getArticle.error, notifyError, onClose])

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
        initialArticle: getArticle.data ?? undefined,
        versionStatus,
        template: article.type === 'new' ? article.template : undefined,
        initialMode,
        onClose,
        onClickPrevious: props.onClickPrevious,
        onClickNext: props.onClickNext,
        onCreatedFn: article.type === 'new' ? article.onCreated : undefined,
        onUpdatedFn: article.onUpdated,
        onDeletedFn: article.onDeleted,
    }

    return (
        <SupportedLocalesProvider>
            <CurrentHelpCenterContext.Provider value={helpCenter}>
                <ArticleContextProvider config={config}>
                    <ArticleEditorInner
                        isLoading={!!articleId && getArticle.isLoading}
                        onSharedPanelStateChange={
                            props.onSharedPanelStateChange
                        }
                    />
                </ArticleContextProvider>
            </CurrentHelpCenterContext.Provider>
        </SupportedLocalesProvider>
    )
}
