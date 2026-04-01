import type { BaseEditorState } from '../types/base-editor-state'
import type { BaseEditorAction } from '../types/editor-actions'
import { setModeEffects } from './base-editor-reducer-helpers'

export function baseEditorReducer<
    TState extends BaseEditorState<TState['activeModal']>,
>(state: TState, action: BaseEditorAction<TState['activeModal']>): TState {
    switch (action.type) {
        case 'SET_MODE':
            return {
                ...state,
                mode: action.payload,
                ...setModeEffects(state, action.payload),
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
            return { ...state, title: action.payload }

        case 'SET_CONTENT':
            return { ...state, content: action.payload }

        case 'SET_AUTO_SAVING':
            if (state.isAutoSaving === action.payload) {
                return state
            }
            return { ...state, isAutoSaving: action.payload }

        case 'SET_VERSION_STATUS':
            return { ...state, versionStatus: action.payload }

        case 'SET_MODAL':
            return { ...state, activeModal: action.payload }

        case 'CLOSE_MODAL':
            return { ...state, activeModal: null }

        case 'SET_UPDATING':
            if (state.isUpdating === action.payload) {
                return state
            }
            return { ...state, isUpdating: action.payload }

        case 'SET_COMPARISON_VERSION':
            return {
                ...state,
                comparisonVersion: {
                    title: action.payload.title,
                    content: action.payload.content,
                },
            }

        default:
            return state
    }
}
