import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useState,
} from 'react'

import { areTrimmedStringsEqual } from 'pages/aiAgent/components/KnowledgeEditor/shared/utils'
import { usePlaygroundPanelInKnowledgeEditor } from 'pages/aiAgent/hooks/usePlaygroundPanelInKnowledgeEditor'

import { articleReducer } from './ArticleReducer'
import type { ArticleContextConfig, ArticleContextValue } from './types'
import { createInitialState } from './types'
import { computeCanEdit, computeHasDraft } from './utils'

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

    const hasPendingContentChanges = useMemo(() => {
        if (state.articleMode === 'read' || state.articleMode === 'diff')
            return false
        return (
            !areTrimmedStringsEqual(state.title, state.savedSnapshot.title) ||
            state.content !== state.savedSnapshot.content
        )
    }, [state.title, state.content, state.savedSnapshot, state.articleMode])

    const isFormValid = useMemo(
        () => state.title.trim() !== '' && state.content.trim() !== '',
        [state.title, state.content],
    )

    const hasDraft = useMemo(
        () => computeHasDraft(state.article),
        [state.article],
    )

    const canEdit = useMemo(
        () => computeCanEdit(state.article, hasDraft),
        [state.article, hasDraft],
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
