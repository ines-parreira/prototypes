import {
    baseEditorReducer,
    clearHistoricalVersionUpdates,
    viewHistoricalVersionUpdates,
} from 'common/knowledge-editor/state'

import type { ArticleReducerAction, ArticleState } from './types'

export function articleReducer(
    state: ArticleState,
    action: ArticleReducerAction,
): ArticleState {
    switch (action.type) {
        // Form data actions
        case 'MARK_CONTENT_AS_SAVED': {
            const newTitle = action.payload?.title ?? state.title
            const newContent = action.payload?.content ?? state.content
            const newArticle = action.payload?.article ?? state.article

            return {
                ...state,
                savedSnapshot: {
                    title: newTitle,
                    content: newContent,
                },
                isAutoSaving: false,
                hasAutoSavedInSession: true,
                article: newArticle,
                translationMode: 'existing',
            }
        }

        case 'SET_AUTO_SAVING':
            return { ...state, isAutoSaving: action.payload }

        // Article reference actions
        case 'SET_ARTICLE':
            return { ...state, article: action.payload }

        case 'SET_TRANSLATION_MODE':
            return { ...state, translationMode: action.payload }

        case 'UPDATE_TRANSLATION': {
            if (!state.article) return state

            return {
                ...state,
                article: {
                    ...state.article,
                    translation: {
                        ...state.article.translation,
                        ...action.payload,
                    },
                },
            }
        }

        // Locale actions
        case 'SET_LOCALE':
            return {
                ...state,
                currentLocale: action.payload,
                pendingSettingsChanges: {},
            }

        case 'SWITCH_ARTICLE': {
            const { article, locale, translationMode } = action.payload
            const title = article?.translation.title ?? ''
            const content = article?.translation.content ?? ''

            return {
                ...state,
                article,
                currentLocale: locale,
                translationMode,
                title,
                content,
                savedSnapshot: { title, content },
                pendingSettingsChanges: {},
                mode: translationMode === 'new' ? 'edit' : state.mode,
            }
        }

        // Settings actions
        case 'SET_PENDING_SETTINGS':
            return {
                ...state,
                pendingSettingsChanges: {
                    ...state.pendingSettingsChanges,
                    ...action.payload,
                },
            }

        case 'CLEAR_PENDING_SETTINGS':
            return { ...state, pendingSettingsChanges: {} }

        // Version actions
        case 'SWITCH_VERSION': {
            const { article, versionStatus } = action.payload
            const title = article.translation.title
            const content = article.translation.content

            return {
                ...state,
                versionStatus,
                article,
                savedSnapshot: { title, content },
                title,
                content,
                mode: versionStatus === 'current' ? 'read' : state.mode,
                hasAutoSavedInSession: false,
            }
        }

        // Reset actions
        case 'RESET_TO_SERVER':
            return {
                ...state,
                title: action.payload.title,
                content: action.payload.content,
                savedSnapshot: {
                    title: action.payload.title,
                    content: action.payload.content,
                },
                isAutoSaving: false,
            }

        // Historical version actions
        case 'VIEW_HISTORICAL_VERSION':
            return {
                ...state,
                ...viewHistoricalVersionUpdates(action.payload),
                mode: 'read',
            }

        case 'CLEAR_HISTORICAL_VERSION':
            return {
                ...state,
                ...clearHistoricalVersionUpdates(
                    state.article?.translation.title ?? '',
                    state.article?.translation.content ?? '',
                ),
                mode: 'read',
            }

        // Base actions delegated (SET_MODE, SET_FULLSCREEN, TOGGLE_FULLSCREEN, etc.)
        default:
            return baseEditorReducer(state, action)
    }
}
