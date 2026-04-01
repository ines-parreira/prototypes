import type { GetArticleVersionStatus } from '@gorgias/help-center-types'

import type { EditorMode } from './editor-mode'
import type { HistoricalVersionState } from './historical-version'

export type BaseEditorState<TModal = string | null> = {
    mode: EditorMode
    isFullscreen: boolean
    isDetailsView: boolean
    title: string
    content: string
    savedSnapshot: { title: string; content: string }
    isAutoSaving: boolean
    hasAutoSavedInSession: boolean
    versionStatus: GetArticleVersionStatus
    historicalVersion: HistoricalVersionState
    comparisonVersion: { title: string; content: string } | null
    activeModal: TModal
    isUpdating: boolean
}
