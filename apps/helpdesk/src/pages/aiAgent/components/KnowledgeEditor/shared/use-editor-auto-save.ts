import { useCallback, useRef } from 'react'

import { useDebouncedCallback } from '@repo/hooks'

import type { EditorMode } from 'common/knowledge-editor/types'
import { areTrimmedStringsEqual } from 'common/knowledge-editor/utils'

export type BaseAutoSaveParams<TExtra = unknown> = {
    title: string
    content: string
    mode: EditorMode
    articleId: number | undefined
    savedSnapshot: { title: string; content: string }
    extra: TExtra
}

export type SaveResult<TEntity = unknown> = {
    entity: TEntity
    shouldSwitchToEditMode: boolean
}

export type AutoSaveDispatch<TEntity = unknown> = {
    setTitle: (value: string) => void
    setContent: (value: string) => void
    setAutoSaving: (value: boolean) => void
    markAsSaved: (
        snapshot: { title: string; content: string },
        entity: TEntity,
    ) => void
    setMode?: (mode: EditorMode) => void
    setAutoSaveError?: (value: boolean) => void
}

export type UseEditorAutoSaveConfig<TExtra = unknown, TEntity = unknown> = {
    debounceDelay: number
    getCurrentState: () => {
        mode: EditorMode
        title: string
        content: string
        savedSnapshot: { title: string; content: string }
        articleId: number | undefined
        extra: TExtra
    }
    isHelpCenterReady: () => boolean
    validateContent?: (content: string) => boolean
    performSave: (
        params: BaseAutoSaveParams<TExtra>,
    ) => Promise<SaveResult<TEntity> | null>
    dispatch: AutoSaveDispatch<TEntity>
    onCreated?: (entity: TEntity) => void
    onUpdated?: () => void
    onError: (mode: EditorMode) => void
}

export function useEditorAutoSave<TExtra = unknown, TEntity = unknown>(
    config: UseEditorAutoSaveConfig<TExtra, TEntity>,
): { onChangeField: (field: 'title' | 'content', value: string) => void } {
    const {
        debounceDelay,
        getCurrentState,
        isHelpCenterReady,
        validateContent,
        performSave,
        dispatch,
        onCreated,
        onUpdated,
        onError,
    } = config

    const pendingSaveRef = useRef<{ title: string; content: string } | null>(
        null,
    )

    const performAutoSave = useCallback(
        async (params: BaseAutoSaveParams<TExtra>) => {
            if (!isHelpCenterReady()) {
                dispatch.setAutoSaving(false)
                return
            }

            const titleMatchesSnapshot = areTrimmedStringsEqual(
                params.title,
                params.savedSnapshot.title,
            )
            const contentMatchesSnapshot =
                params.content === params.savedSnapshot.content

            if (titleMatchesSnapshot && contentMatchesSnapshot) {
                dispatch.setAutoSaving(false)
                return
            }

            pendingSaveRef.current = {
                title: params.title,
                content: params.content,
            }

            try {
                const result = await performSave(params)

                if (result && pendingSaveRef.current) {
                    const savedValues = pendingSaveRef.current
                    dispatch.markAsSaved(
                        {
                            title: savedValues.title,
                            content: savedValues.content,
                        },
                        result.entity,
                    )

                    if (result.shouldSwitchToEditMode) {
                        dispatch.setMode?.('edit')
                        onCreated?.(result.entity)
                    } else {
                        onUpdated?.()
                    }
                }
            } catch {
                onError(params.mode)
                dispatch.setAutoSaveError?.(true)
            } finally {
                pendingSaveRef.current = null
                dispatch.setAutoSaving(false)
            }
        },
        [
            isHelpCenterReady,
            performSave,
            dispatch,
            onCreated,
            onUpdated,
            onError,
        ],
    )

    const debouncedAutoSave = useDebouncedCallback(
        performAutoSave,
        debounceDelay,
    )

    const triggerAutoSave = useCallback(
        (params: BaseAutoSaveParams<TExtra>) => {
            dispatch.setAutoSaving(true)
            debouncedAutoSave(params)
        },
        [dispatch, debouncedAutoSave],
    )

    const onChangeField = useCallback(
        (field: 'title' | 'content', value: string) => {
            const currentState = getCurrentState()

            if (currentState.mode === 'read' || currentState.mode === 'diff') {
                return
            }

            let newTitle = field === 'title' ? value : currentState.title
            const newContent =
                field === 'content' ? value : currentState.content

            // If content is present but title is empty, use "Untitled" as temporary title
            // Only do this when the content field is being changed, not the title field
            const shouldUseUntitled =
                field === 'content' &&
                newTitle.trim() === '' &&
                newContent.trim() !== ''
            if (shouldUseUntitled) {
                newTitle = 'Untitled'
            }

            // Dispatch the state updates
            if (field === 'title') {
                dispatch.setTitle(value)
            } else {
                dispatch.setContent(value)
            }

            // If we're using "Untitled" as temporary title, also update the title state
            if (shouldUseUntitled) {
                dispatch.setTitle('Untitled')
            }

            const isValid = newTitle.trim() !== '' && newContent.trim() !== ''
            if (!isValid) return

            if (validateContent && !validateContent(newContent)) return

            const titleMatches = areTrimmedStringsEqual(
                newTitle,
                currentState.savedSnapshot.title,
            )
            const contentMatches =
                newContent === currentState.savedSnapshot.content
            if (titleMatches && contentMatches) return

            triggerAutoSave({
                title: newTitle,
                content: newContent,
                mode: currentState.mode,
                articleId: currentState.articleId,
                savedSnapshot: currentState.savedSnapshot,
                extra: currentState.extra,
            })
        },
        [getCurrentState, dispatch, triggerAutoSave, validateContent],
    )

    return { onChangeField }
}
