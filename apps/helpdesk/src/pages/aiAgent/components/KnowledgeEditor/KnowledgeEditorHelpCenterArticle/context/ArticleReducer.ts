import type { ArticleReducerAction, ArticleState } from './types'

export function articleReducer(
    state: ArticleState,
    action: ArticleReducerAction,
): ArticleState {
    switch (action.type) {
        // Mode & UI actions
        case 'SET_MODE':
            return {
                ...state,
                articleMode: action.payload,
                hasAutoSavedInSession:
                    action.payload === 'read' || action.payload === 'diff'
                        ? false
                        : state.hasAutoSavedInSession,
                comparisonVersion:
                    action.payload === 'diff' ? state.comparisonVersion : null,
            }

        case 'SET_FULLSCREEN':
            return { ...state, isFullscreen: action.payload }

        case 'TOGGLE_FULLSCREEN':
            return { ...state, isFullscreen: !state.isFullscreen }

        case 'SET_DETAILS_VIEW':
            return { ...state, isDetailsView: action.payload }

        case 'TOGGLE_DETAILS_VIEW':
            return { ...state, isDetailsView: !state.isDetailsView }

        // Form data actions
        case 'SET_TITLE':
            return { ...state, title: action.payload }

        case 'SET_CONTENT':
            return { ...state, content: action.payload }

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
                articleMode:
                    translationMode === 'new' ? 'edit' : state.articleMode,
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
        case 'SET_VERSION_STATUS':
            return { ...state, versionStatus: action.payload }

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
                articleMode:
                    versionStatus === 'current' ? 'read' : state.articleMode,
                hasAutoSavedInSession: false,
            }
        }

        // Modal actions
        case 'SET_MODAL':
            return { ...state, activeModal: action.payload }

        case 'CLOSE_MODAL':
            return { ...state, activeModal: null }

        // Loading actions
        case 'SET_UPDATING':
            return { ...state, isUpdating: action.payload }

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
        case 'VIEW_HISTORICAL_VERSION': {
            const versionTitle = action.payload.title ?? ''
            const versionContent = action.payload.content ?? ''
            return {
                ...state,
                historicalVersion: {
                    versionId: action.payload.id,
                    version: action.payload.version,
                    title: versionTitle,
                    content: versionContent,
                    publishedDatetime: action.payload.published_datetime,
                    publisherUserId: action.payload.publisher_user_id,
                    commitMessage: action.payload.commit_message,
                    impactDateRange: action.payload.impactDateRange,
                },
                title: versionTitle,
                content: versionContent,
                articleMode: 'read',
            }
        }

        case 'CLEAR_HISTORICAL_VERSION': {
            const originalTitle = state.article?.translation.title ?? ''
            const originalContent = state.article?.translation.content ?? ''
            return {
                ...state,
                historicalVersion: null,
                comparisonVersion: null,
                title: originalTitle,
                content: originalContent,
                articleMode: 'read',
            }
        }

        case 'SET_COMPARISON_VERSION': {
            return {
                ...state,
                comparisonVersion: {
                    title: action.payload.title,
                    content: action.payload.content,
                },
            }
        }

        default:
            return state
    }
}
