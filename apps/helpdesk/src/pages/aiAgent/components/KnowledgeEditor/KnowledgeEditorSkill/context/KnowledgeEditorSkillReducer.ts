import {
    baseEditorReducer,
    clearHistoricalVersionUpdates,
    computeTemplateChanges,
    viewHistoricalVersionUpdates,
} from 'common/knowledge-editor/state'
import { VisibilityStatusEnum } from 'models/helpCenter/types'

import type { SkillReducerAction, SkillState } from './types'
import { createInitialState } from './types'

export function skillReducer(
    state: SkillState,
    action: SkillReducerAction,
): SkillState {
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
                skill: state.skill
                    ? {
                          ...state.skill,
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
            // Don't update title/content - preserve user's current edits.
            // Only update savedSnapshot to track what was successfully saved.
            const newArticle = action.payload?.article ?? state.skill

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
                skill: newArticle,
                intents: newArticle?.intents ?? state.intents,
                useSupportingContent:
                    newArticle?.useSupportingContent ??
                    state.useSupportingContent,
            }
        }

        case 'SET_INTENTS':
            return {
                ...state,
                intents: action.payload,
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

            const { draftVersionId, publishedVersionId } = action.payload
            const hasDraft =
                draftVersionId != null &&
                publishedVersionId != null &&
                draftVersionId !== publishedVersionId
            const isLatest = newVersionStatus === 'latest_draft' || !hasDraft

            return {
                ...state,
                versionStatus: newVersionStatus,
                skill: action.payload,
                intents: action.payload.intents ?? state.intents,
                useSupportingContent:
                    action.payload.useSupportingContent ??
                    state.useSupportingContent,
                savedSnapshot: {
                    title: action.payload.title,
                    content: action.payload.content,
                },
                title: action.payload.title,
                content: action.payload.content,
                mode: isLatest ? 'edit' : 'read',
                hasAutoSavedInSession: false,
                historicalVersion: null,
            }
        }

        case 'SWITCH_SKILL':
            return createInitialState(
                undefined,
                action.payload.article,
                action.payload.mode,
            )

        case 'SYNC_SKILL_METADATA':
            return {
                ...state,
                skill: action.payload,
                visibility:
                    action.payload.visibility === VisibilityStatusEnum.PUBLIC,
            }

        case 'VIEW_HISTORICAL_VERSION': {
            const updates = viewHistoricalVersionUpdates(action.payload)
            return {
                ...state,
                ...updates,
                historicalVersion: {
                    ...updates.historicalVersion,
                    intents: action.payload.intents,
                    useSupportingContent: action.payload.use_supporting_content,
                },
                mode: 'read',
            }
        }

        case 'CLEAR_HISTORICAL_VERSION':
            return {
                ...state,
                ...clearHistoricalVersionUpdates(
                    state.skill?.title ?? '',
                    state.skill?.content ?? '',
                ),
            }

        case 'SET_COMPARISON_VERSION':
            return {
                ...state,
                comparisonVersion: {
                    title: action.payload.title,
                    content: action.payload.content,
                    intents: action.payload.intents,
                    useSupportingContent: action.payload.useSupportingContent,
                },
            }

        default:
            return baseEditorReducer(state, action)
    }
}
