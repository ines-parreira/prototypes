import {
    baseEditorReducer,
    clearHistoricalVersionUpdates,
    computeTemplateChanges,
    viewHistoricalVersionUpdates,
} from 'common/knowledge-editor/state'
import { VisibilityStatusEnum } from 'models/helpCenter/types'

import type { GuidanceReducerAction, GuidanceState } from './types'
import { createInitialState } from './types'

export function guidanceReducer(
    state: GuidanceState,
    action: GuidanceReducerAction,
): GuidanceState {
    switch (action.type) {
        case 'SET_TITLE':
            return {
                ...state,
                title: action.payload,
                hasTemplateChanges: computeTemplateChanges(
                    state,
                    'title',
                    action.payload,
                ),
            }

        case 'SET_CONTENT':
            return {
                ...state,
                content: action.payload,
                hasTemplateChanges: computeTemplateChanges(
                    state,
                    'content',
                    action.payload,
                ),
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

            // Don't update title/content - preserve user's current edits.
            // Only update savedSnapshot to track what was successfully saved.
            return {
                ...state,
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
                mode: newVersionStatus === 'current' ? 'read' : state.mode,
                hasAutoSavedInSession: false,
                historicalVersion: null,
            }
        }

        case 'SWITCH_GUIDANCE':
            return createInitialState(
                undefined,
                action.payload.article,
                action.payload.mode,
            )

        case 'VIEW_HISTORICAL_VERSION': {
            const updates = viewHistoricalVersionUpdates(action.payload)
            return {
                ...state,
                ...updates,
                historicalVersion: {
                    ...updates.historicalVersion,
                    intents: action.payload.intents,
                },
                mode: 'read',
            }
        }

        case 'CLEAR_HISTORICAL_VERSION':
            return {
                ...state,
                ...clearHistoricalVersionUpdates(
                    state.guidance?.title ?? '',
                    state.guidance?.content ?? '',
                ),
                mode: 'read',
            }

        case 'SET_COMPARISON_VERSION':
            return {
                ...state,
                comparisonVersion: {
                    title: action.payload.title,
                    content: action.payload.content,
                    intents: action.payload.intents,
                },
            }

        default:
            return baseEditorReducer(state, action)
    }
}
