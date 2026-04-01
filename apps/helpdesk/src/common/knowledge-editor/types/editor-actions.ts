import type { GetArticleVersionStatus } from '@gorgias/help-center-types'

import type { EditorMode } from './editor-mode'

export type BaseEditorAction<TModal = string | null> =
    | { type: 'SET_MODE'; payload: EditorMode }
    | { type: 'SET_FULLSCREEN'; payload: boolean }
    | { type: 'TOGGLE_FULLSCREEN' }
    | { type: 'SET_DETAILS_VIEW'; payload: boolean }
    | { type: 'TOGGLE_DETAILS_VIEW' }
    | { type: 'SET_TITLE'; payload: string }
    | { type: 'SET_CONTENT'; payload: string }
    | { type: 'SET_AUTO_SAVING'; payload: boolean }
    | { type: 'SET_VERSION_STATUS'; payload: GetArticleVersionStatus }
    | { type: 'SET_MODAL'; payload: TModal }
    | { type: 'CLOSE_MODAL' }
    | { type: 'SET_UPDATING'; payload: boolean }
    | {
          type: 'SET_COMPARISON_VERSION'
          payload: { title: string; content: string }
      }
