import type { EditorMode } from '../types/editor-mode'
import type {
    HistoricalVersionState,
    VersionPayload,
} from '../types/historical-version'

type BaseEditorStateSlice = {
    hasAutoSavedInSession: boolean
    comparisonVersion: { title: string; content: string } | null
}

export function setModeEffects(
    state: BaseEditorStateSlice,
    newMode: EditorMode,
): Pick<BaseEditorStateSlice, 'hasAutoSavedInSession' | 'comparisonVersion'> {
    return {
        hasAutoSavedInSession:
            newMode === 'read' || newMode === 'diff'
                ? false
                : state.hasAutoSavedInSession,
        comparisonVersion: newMode === 'diff' ? state.comparisonVersion : null,
    }
}

export function viewHistoricalVersionUpdates(payload: VersionPayload): {
    historicalVersion: NonNullable<HistoricalVersionState>
    title: string
    content: string
} {
    const versionTitle = payload.title ?? ''
    const versionContent = payload.content ?? ''

    return {
        historicalVersion: {
            versionId: payload.id,
            version: payload.version,
            title: versionTitle,
            content: versionContent,
            publishedDatetime: payload.published_datetime,
            publisherUserId: payload.publisher_user_id,
            commitMessage: payload.commit_message,
            impactDateRange: payload.impactDateRange,
        },
        title: versionTitle,
        content: versionContent,
    }
}

type TemplateTrackingState = {
    isFromTemplate: boolean
    hasTemplateChanges: boolean
    savedSnapshot: { title: string; content: string }
}

export function computeTemplateChanges(
    state: TemplateTrackingState,
    field: 'title' | 'content',
    newValue: string,
): boolean {
    if (!state.isFromTemplate) return state.hasTemplateChanges

    const snapshotValue =
        field === 'title'
            ? state.savedSnapshot.title
            : state.savedSnapshot.content

    return newValue !== snapshotValue || state.hasTemplateChanges
}

export function clearHistoricalVersionUpdates(
    entityTitle: string,
    entityContent: string,
): {
    historicalVersion: null
    comparisonVersion: null
    title: string
    content: string
} {
    return {
        historicalVersion: null,
        comparisonVersion: null,
        title: entityTitle,
        content: entityContent,
    }
}
