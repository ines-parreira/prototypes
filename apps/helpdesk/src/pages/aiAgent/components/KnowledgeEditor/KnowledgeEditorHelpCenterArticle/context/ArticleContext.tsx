import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from 'react'

import {
    canEdit as baseCanEdit,
    hasDraft as baseHasDraft,
    hasPendingChanges as baseHasPendingChanges,
    isFormValid as baseIsFormValid,
} from 'common/knowledge-editor/utils'
import { usePlaygroundPanelInKnowledgeEditor } from 'pages/aiAgent/hooks/usePlaygroundPanelInKnowledgeEditor'

import { articleReducer } from './ArticleReducer'
import type { ArticleContextConfig, ArticleContextValue } from './types'
import { createInitialState } from './types'

const ArticleContext = createContext<ArticleContextValue | null>(null)

export const useArticleContext = (): ArticleContextValue => {
    const context = useContext(ArticleContext)
    if (!context) {
        throw new Error(
            'useArticleContext must be used within an ArticleContextProvider',
        )
    }
    return context
}

type ProviderProps = {
    config: ArticleContextConfig
    children: React.ReactNode
}

export const ArticleContextProvider = ({ config, children }: ProviderProps) => {
    const [state, dispatch] = useReducer(
        articleReducer,
        createInitialState(config),
    )
    const [shouldAddToMissingKnowledge, setShouldAddToMissingKnowledge] =
        useState(true)

    // Sync article data when it loads
    useEffect(() => {
        if (
            config.initialArticle &&
            config.initialArticle.id !== state.article?.id
        ) {
            dispatch({
                type: 'SWITCH_ARTICLE',
                payload: {
                    article: config.initialArticle,
                    locale: config.helpCenter.default_locale,
                    translationMode: 'existing',
                },
            })
        }
    }, [config.initialArticle, config.helpCenter.default_locale, state.article])

    const {
        isPlaygroundOpen,
        onTest,
        onClosePlayground,
        sidePanelWidth,
        shouldHideFullscreenButton,
    } = usePlaygroundPanelInKnowledgeEditor(state.isFullscreen)

    const hasPendingContentChanges = useMemo(
        () => baseHasPendingChanges(state),
        [state],
    )

    const isFormValid = useMemo(() => baseIsFormValid(state), [state])

    const hasDraft = useMemo(
        () =>
            baseHasDraft(
                state.article
                    ? {
                          draftVersionId:
                              state.article.translation.draft_version_id,
                          publishedVersionId:
                              state.article.translation.published_version_id,
                      }
                    : undefined,
            ),
        [state.article],
    )

    const canEdit = useMemo(
        () =>
            state.article
                ? baseCanEdit({
                      isCurrent: state.article.translation.is_current,
                      draftVersionId:
                          state.article.translation.draft_version_id,
                      publishedVersionId:
                          state.article.translation.published_version_id,
                  })
                : true,
        [state.article],
    )

    const value = useMemo<ArticleContextValue>(
        () => ({
            state,
            dispatch,
            config,
            hasPendingContentChanges,
            isFormValid,
            hasDraft,
            canEdit,
            playground: {
                isOpen: isPlaygroundOpen,
                onTest,
                onClose: onClosePlayground,
                sidePanelWidth,
                shouldHideFullscreenButton,
            },
            shouldAddToMissingKnowledge,
            setShouldAddToMissingKnowledge,
        }),
        [
            state,
            config,
            hasPendingContentChanges,
            isFormValid,
            hasDraft,
            canEdit,
            isPlaygroundOpen,
            onTest,
            onClosePlayground,
            sidePanelWidth,
            shouldHideFullscreenButton,
            shouldAddToMissingKnowledge,
        ],
    )

    return (
        <ArticleContext.Provider value={value}>
            {children}
        </ArticleContext.Provider>
    )
}
