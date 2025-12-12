import { useCallback, useRef } from 'react'

import { useDebouncedCallback } from '@repo/hooks'

import { useNotify } from 'hooks/useNotify'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { mapGuidanceFormFieldsToGuidanceArticle } from 'pages/aiAgent/utils/guidance.utils'

import { useGuidanceContext } from './KnowledgeEditorGuidanceContext'
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
    const { state, dispatch, config } = useGuidanceContext()

    const { guidanceTemplate, onCreateFn, onUpdateFn, guidanceHelpCenter } =
        config

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

            if (
                title === savedSnapshot.title &&
                content === savedSnapshot.content
            ) {
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
                        const savedValues = pendingSaveRef.current
                        dispatch({
                            type: 'MARK_AS_SAVED',
                            payload: {
                                title: savedValues.title,
                                content: savedValues.content,
                                guidance: fromArticleTranslation(response),
                            },
                        })
                        dispatch({ type: 'SET_MODE', payload: 'edit' })
                        onCreateFn?.()
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
            if (field === 'title') {
                dispatch({ type: 'SET_TITLE', payload: value })
            } else {
                dispatch({ type: 'SET_CONTENT', payload: value })
            }

            if (state.guidanceMode === 'read') return

            const newTitle = field === 'title' ? value : state.title
            const newContent = field === 'content' ? value : state.content

            const isValid = newTitle.trim() !== '' && newContent.trim() !== ''
            if (!isValid) {
                return
            }

            triggerAutoSave({
                title: newTitle,
                content: newContent,
                visibility: state.visibility,
                mode: state.guidanceMode,
                articleId: state.guidance?.id,
                savedSnapshot: state.savedSnapshot,
            })
        },
        [
            dispatch,
            triggerAutoSave,
            state.guidanceMode,
            state.title,
            state.content,
            state.visibility,
            state.guidance?.id,
            state.savedSnapshot,
        ],
    )

    return { onChangeField }
}
