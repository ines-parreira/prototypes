import { useCallback, useRef } from 'react'

import { useDebouncedCallback } from '@repo/hooks'
import { useShallow } from 'zustand/react/shallow'

import { useNotify } from 'hooks/useNotify'
import {
    getPlainTextLength,
    textLimit,
} from 'pages/aiAgent/components/GuidanceEditor/guidanceTextContent.utils'
import { areTrimmedStringsEqual } from 'pages/aiAgent/components/KnowledgeEditor/shared/utils'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { mapGuidanceFormFieldsToGuidanceArticle } from 'pages/aiAgent/utils/guidance.utils'

import {
    useGuidanceStore,
    useGuidanceStoreApi,
} from './KnowledgeEditorGuidanceContext'
import type { GuidanceState } from './types'
import { fromArticleTranslation, fromArticleTranslationResponse } from './utils'

const DEFAULT_AUTOSAVE_DELAY_MS = 1000

type AutoSaveParams = {
    title: string
    content: string
    visibility: boolean
    mode: 'edit' | 'create'
    articleId: number | undefined
    savedSnapshot: GuidanceState['savedSnapshot']
}

export const useGuidanceAutoSave = () => {
    const store = useGuidanceStoreApi()
    const dispatch = useGuidanceStore((storeState) => storeState.dispatch)
    const {
        guidanceTemplate,
        onCreateFn,
        onUpdateFn,
        guidanceHelpCenter,
        shouldAddToMissingKnowledge,
    } = useGuidanceStore(
        useShallow((storeState) => ({
            guidanceTemplate: storeState.config.guidanceTemplate,
            onCreateFn: storeState.config.onCreateFn,
            onUpdateFn: storeState.config.onUpdateFn,
            guidanceHelpCenter: storeState.config.guidanceHelpCenter,
            shouldAddToMissingKnowledge: storeState.shouldAddToMissingKnowledge,
        })),
    )

    const { error: notifyError } = useNotify()

    const { createGuidanceArticle, updateGuidanceArticle } =
        useGuidanceArticleMutation({
            guidanceHelpCenterId: guidanceHelpCenter.id ?? 0,
        })

    const pendingSaveRef = useRef<{
        title: string
        content: string
    } | null>(null)

    const performAutoSave = useCallback(
        async ({
            title,
            content,
            visibility,
            mode,
            articleId,
            savedSnapshot,
        }: AutoSaveParams) => {
            if (!guidanceHelpCenter.id || !guidanceHelpCenter.default_locale) {
                dispatch({ type: 'SET_AUTO_SAVING', payload: false })
                return
            }

            const titleMatchesSnapshot = areTrimmedStringsEqual(
                title,
                savedSnapshot.title,
            )
            const contentMatchesSnapshot = content === savedSnapshot.content

            if (titleMatchesSnapshot && contentMatchesSnapshot) {
                dispatch({ type: 'SET_AUTO_SAVING', payload: false })
                return
            }
            pendingSaveRef.current = { title, content }

            try {
                if (mode === 'create') {
                    const response = await createGuidanceArticle(
                        mapGuidanceFormFieldsToGuidanceArticle(
                            {
                                name: title,
                                content,
                                isVisible: visibility,
                            },
                            guidanceHelpCenter.default_locale,
                            guidanceTemplate
                                ? `template_guidance_${guidanceTemplate.id}`
                                : undefined,
                            false, // isCurrent
                        ),
                    )

                    if (response && pendingSaveRef.current) {
                        const createdGuidance = fromArticleTranslation(response)
                        const savedValues = pendingSaveRef.current
                        dispatch({
                            type: 'MARK_AS_SAVED',
                            payload: {
                                title: savedValues.title,
                                content: savedValues.content,
                                guidance: createdGuidance,
                            },
                        })
                        dispatch({ type: 'SET_MODE', payload: 'edit' })
                        onCreateFn?.(
                            createdGuidance,
                            shouldAddToMissingKnowledge,
                        )
                    }
                } else {
                    if (!articleId) {
                        dispatch({ type: 'SET_AUTO_SAVING', payload: false })
                        return
                    }

                    const response = await updateGuidanceArticle(
                        mapGuidanceFormFieldsToGuidanceArticle(
                            {
                                name: title,
                                content,
                                isVisible: visibility,
                            },
                            guidanceHelpCenter.default_locale,
                            undefined,
                            false,
                        ),
                        {
                            articleId,
                            locale: guidanceHelpCenter.default_locale,
                        },
                    )

                    if (response && pendingSaveRef.current) {
                        const savedValues = pendingSaveRef.current
                        dispatch({
                            type: 'MARK_AS_SAVED',
                            payload: {
                                title: savedValues.title,
                                content: savedValues.content,
                                guidance: fromArticleTranslationResponse(
                                    response,
                                    {
                                        id: articleId,
                                    },
                                ),
                            },
                        })
                        onUpdateFn?.()
                    }
                }
            } catch {
                notifyError(
                    mode === 'create'
                        ? 'An error occurred while creating guidance.'
                        : 'An error occurred while saving guidance.',
                )
                dispatch({ type: 'SET_AUTO_SAVE_ERROR', payload: true })
            } finally {
                pendingSaveRef.current = null
                dispatch({ type: 'SET_AUTO_SAVING', payload: false })
            }
        },
        [
            guidanceHelpCenter.id,
            guidanceHelpCenter.default_locale,
            guidanceTemplate,
            createGuidanceArticle,
            updateGuidanceArticle,
            dispatch,
            onCreateFn,
            onUpdateFn,
            notifyError,
            shouldAddToMissingKnowledge,
        ],
    )

    const debouncedAutoSave = useDebouncedCallback(
        performAutoSave,
        DEFAULT_AUTOSAVE_DELAY_MS,
    )

    const triggerAutoSave = useCallback(
        (params: AutoSaveParams) => {
            dispatch({ type: 'SET_AUTO_SAVING', payload: true })
            debouncedAutoSave(params)
        },
        [dispatch, debouncedAutoSave],
    )

    const onChangeField = useCallback(
        (field: 'title' | 'content', value: string) => {
            const currentState = store.getState().state

            if (
                currentState.guidanceMode === 'read' ||
                currentState.guidanceMode === 'diff'
            )
                return

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
                dispatch({ type: 'SET_TITLE', payload: value })
            } else {
                dispatch({ type: 'SET_CONTENT', payload: value })
            }

            // If we're using "Untitled" as temporary title, also update the title state
            if (shouldUseUntitled) {
                dispatch({ type: 'SET_TITLE', payload: 'Untitled' })
            }

            const isValid = newTitle.trim() !== '' && newContent.trim() !== ''
            if (!isValid) {
                return
            }

            if (getPlainTextLength(newContent) > textLimit) {
                return
            }

            const titleMatches = areTrimmedStringsEqual(
                newTitle,
                currentState.savedSnapshot.title,
            )
            const contentMatches =
                newContent === currentState.savedSnapshot.content
            const hasChanges = !titleMatches || !contentMatches

            if (!hasChanges) {
                return
            }
            triggerAutoSave({
                title: newTitle,
                content: newContent,
                visibility: currentState.visibility,
                mode: currentState.guidanceMode,
                articleId: currentState.guidance?.id,
                savedSnapshot: currentState.savedSnapshot,
            })
        },
        [store, dispatch, triggerAutoSave],
    )

    return { onChangeField }
}
