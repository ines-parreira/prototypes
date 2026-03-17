import { VisibilityStatusEnum } from 'models/helpCenter/types'

import type { GuidanceReducerAction, GuidanceState } from './types'
import { createInitialState } from './types'

export function guidanceReducer(
    state: GuidanceState,
    action: GuidanceReducerAction,
): GuidanceState {
    switch (action.type) {
        case 'SET_MODE':
            return {
                ...state,
                guidanceMode: action.payload,
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

        case 'SET_TITLE':
            return {
                ...state,
                title: action.payload,
                hasTemplateChanges: state.isFromTemplate
                    ? action.payload !== state.savedSnapshot.title ||
                      state.hasTemplateChanges
                    : state.hasTemplateChanges,
            }

        case 'SET_CONTENT':
            return {
                ...state,
                content: action.payload,
                hasTemplateChanges: state.isFromTemplate
                    ? action.payload !== state.savedSnapshot.content ||
                      state.hasTemplateChanges
                    : state.hasTemplateChanges,
            }

        case 'SET_VISIBILITY':
            return {
                ...state,
                visibility: action.payload,
                guidance: state.guidance
                    ? {
                          ...state.guidance,
                          visibility: action.payload
                              ? VisibilityStatusEnum.PUBLIC
                              : VisibilityStatusEnum.UNLISTED,
                      }
                    : undefined,
            }

        case 'RESET_FORM':
            return {
                ...state,
                title: action.payload.title,
                content: action.payload.content,
                visibility: action.payload.visibility,
                savedSnapshot: {
                    title: action.payload.title,
                    content: action.payload.content,
                },
                isAutoSaving: false,
            }

        case 'MARK_AS_SAVED': {
            const newGuidance = action.payload?.guidance ?? state.guidance

            return {
                ...state,
                // Don't update title/content - preserve user's current edits.
                // Only update savedSnapshot to track what was successfully saved.
                savedSnapshot: {
                    title: action.payload?.title ?? state.savedSnapshot.title,
                    content:
                        action.payload?.content ?? state.savedSnapshot.content,
                },
                isAutoSaving: false,
                hasAutoSavedInSession: true,
                autoSaveError: false,
                guidance: newGuidance,
            }
        }

        case 'SET_AUTO_SAVING': {
            const nextIsAutoSaving = action.payload
            const nextAutoSaveError = action.payload
                ? false
                : state.autoSaveError

            if (
                state.isAutoSaving === nextIsAutoSaving &&
                state.autoSaveError === nextAutoSaveError
            ) {
                return state
            }

            return {
                ...state,
                isAutoSaving: nextIsAutoSaving,
                autoSaveError: nextAutoSaveError,
            }
        }

        case 'SET_AUTO_SAVE_ERROR':
            return { ...state, autoSaveError: action.payload }

        case 'SET_VERSION_STATUS':
            return { ...state, versionStatus: action.payload }

        case 'SWITCH_VERSION': {
            const newVersionStatus =
                state.versionStatus === 'latest_draft'
                    ? 'current'
                    : 'latest_draft'

            return {
                ...state,
                versionStatus: newVersionStatus,
                guidance: action.payload,
                savedSnapshot: {
                    title: action.payload.title,
                    content: action.payload.content,
                },
                title: action.payload.title,
                content: action.payload.content,
                guidanceMode:
                    newVersionStatus === 'current'
                        ? 'read'
                        : state.guidanceMode,
                hasAutoSavedInSession: false,
                historicalVersion: null,
            }
        }

        case 'SET_MODAL':
            return {
                ...state,
                activeModal: action.payload,
            }

        case 'CLOSE_MODAL':
            return {
                ...state,
                activeModal: null,
            }

        case 'SET_UPDATING':
            if (state.isUpdating === action.payload) {
                return state
            }

            return { ...state, isUpdating: action.payload }

        case 'SWITCH_GUIDANCE':
            return createInitialState(
                undefined,
                action.payload.article,
                action.payload.mode,
            )

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
                    intents: action.payload.intents,
                    publishedDatetime: action.payload.published_datetime,
                    publisherUserId: action.payload.publisher_user_id,
                    commitMessage: action.payload.commit_message,
                    impactDateRange: action.payload.impactDateRange,
                },
                title: versionTitle,
                content: versionContent,
                guidanceMode: 'read',
            }
        }

        case 'CLEAR_HISTORICAL_VERSION': {
            const originalTitle = state.guidance?.title ?? ''
            const originalContent = state.guidance?.content ?? ''
            return {
                ...state,
                historicalVersion: null,
                comparisonVersion: null,
                title: originalTitle,
                content: originalContent,
                guidanceMode: 'read',
            }
        }

        case 'SET_COMPARISON_VERSION': {
            return {
                ...state,
                comparisonVersion: {
                    title: action.payload.title,
                    content: action.payload.content,
                    intents: action.payload.intents,
                },
            }
        }

        default:
            return state
    }
}
