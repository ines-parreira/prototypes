import type { EditorMode } from '../types/editor-mode'
import { areTrimmedStringsEqual } from './string-comparison'

type EditorStateForPendingChanges = {
    mode: EditorMode
    title: string
    content: string
    savedSnapshot: { title: string; content: string }
}

export const hasPendingChanges = (
    state: EditorStateForPendingChanges,
): boolean => {
    if (state.mode === 'read' || state.mode === 'diff') {
        return false
    }

    return (
        !areTrimmedStringsEqual(state.title, state.savedSnapshot.title) ||
        state.content !== state.savedSnapshot.content
    )
}

export const isFormValid = (
    state: { title: string; content: string },
    extraValidator?: (state: { title: string; content: string }) => boolean,
): boolean => {
    const baseValid = state.title.trim() !== '' && state.content.trim() !== ''
    if (!baseValid) return false
    return extraValidator ? extraValidator(state) : true
}

type DraftableEntity = {
    draftVersionId: number | null
    publishedVersionId: number | null
}

export const hasDraft = (
    entity: DraftableEntity | undefined | null,
): boolean => {
    if (!entity) return false
    return (
        !entity.publishedVersionId ||
        entity.draftVersionId !== entity.publishedVersionId
    )
}

type EditableEntity = DraftableEntity & {
    isCurrent?: boolean
}

export const canEdit = (entity: EditableEntity | undefined | null): boolean => {
    if (!entity) return false
    if (entity.isCurrent && hasDraft(entity)) return false
    return true
}
