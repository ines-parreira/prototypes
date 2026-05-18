import { useCallback } from 'react'

import { useShallow } from 'zustand/react/shallow'

import { toast } from '@gorgias/axiom'

import {
    getPlainTextLength,
    textLimit,
} from 'pages/aiAgent/components/GuidanceEditor/guidanceTextContent.utils'
import type { BaseAutoSaveParams } from 'pages/aiAgent/components/KnowledgeEditor/shared/use-editor-auto-save'
import { useEditorAutoSave } from 'pages/aiAgent/components/KnowledgeEditor/shared/use-editor-auto-save'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import type { GuidanceArticle } from 'pages/aiAgent/types'
import { mapGuidanceFormFieldsToGuidanceArticle } from 'pages/aiAgent/utils/guidance.utils'

import {
    useGuidanceStore,
    useGuidanceStoreApi,
} from './KnowledgeEditorGuidanceContext'
import { fromArticleTranslation, fromArticleTranslationResponse } from './utils'

type GuidanceExtra = {
    visibility: boolean
}

const DEFAULT_AUTOSAVE_DELAY_MS = 1000

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

    const { createGuidanceArticle, updateGuidanceArticle } =
        useGuidanceArticleMutation({
            guidanceHelpCenterId: guidanceHelpCenter.id ?? 0,
        })

    const getCurrentState = useCallback(() => {
        const state = store.getState().state
        return {
            mode: state.mode,
            title: state.title,
            content: state.content,
            savedSnapshot: state.savedSnapshot,
            articleId: state.guidance?.id,
            extra: { visibility: state.visibility } as GuidanceExtra,
        }
    }, [store])

    const isHelpCenterReady = useCallback(
        () => !!guidanceHelpCenter.id && !!guidanceHelpCenter.default_locale,
        [guidanceHelpCenter.id, guidanceHelpCenter.default_locale],
    )

    const performSave = useCallback(
        async (params: BaseAutoSaveParams<GuidanceExtra>) => {
            if (params.mode === 'create') {
                const response = await createGuidanceArticle(
                    mapGuidanceFormFieldsToGuidanceArticle(
                        {
                            name: params.title,
                            content: params.content,
                            isVisible: params.extra.visibility,
                        },
                        guidanceHelpCenter.default_locale,
                        guidanceTemplate
                            ? `template_guidance_${guidanceTemplate.id}`
                            : undefined,
                        false, // isCurrent
                    ),
                )

                if (!response) return null
                const createdGuidance = fromArticleTranslation(response)
                return {
                    entity: createdGuidance,
                    shouldSwitchToEditMode: true,
                }
            }

            if (!params.articleId) return null

            const response = await updateGuidanceArticle(
                mapGuidanceFormFieldsToGuidanceArticle(
                    {
                        name: params.title,
                        content: params.content,
                        isVisible: params.extra.visibility,
                    },
                    guidanceHelpCenter.default_locale,
                    undefined,
                    false,
                ),
                {
                    articleId: params.articleId,
                    locale: guidanceHelpCenter.default_locale,
                },
            )

            if (!response) return null
            return {
                entity: fromArticleTranslationResponse(response, {
                    id: params.articleId,
                }),
                shouldSwitchToEditMode: false,
            }
        },
        [
            guidanceHelpCenter.default_locale,
            guidanceTemplate,
            createGuidanceArticle,
            updateGuidanceArticle,
        ],
    )

    return useEditorAutoSave<GuidanceExtra, GuidanceArticle>({
        debounceDelay: DEFAULT_AUTOSAVE_DELAY_MS,
        getCurrentState,
        isHelpCenterReady,
        validateContent: (content) => getPlainTextLength(content) <= textLimit,
        performSave,
        dispatch: {
            setTitle: (value) =>
                dispatch({ type: 'SET_TITLE', payload: value }),
            setContent: (value) =>
                dispatch({ type: 'SET_CONTENT', payload: value }),
            setAutoSaving: (value) =>
                dispatch({ type: 'SET_AUTO_SAVING', payload: value }),
            markAsSaved: (snapshot, guidance) => {
                dispatch({
                    type: 'MARK_AS_SAVED',
                    payload: {
                        title: snapshot.title,
                        content: snapshot.content,
                        guidance,
                    },
                })
            },
            setMode: (mode) => dispatch({ type: 'SET_MODE', payload: mode }),
            setAutoSaveError: (value) =>
                dispatch({ type: 'SET_AUTO_SAVE_ERROR', payload: value }),
        },
        onCreated: (guidance) =>
            onCreateFn?.(guidance, shouldAddToMissingKnowledge),
        onUpdated: () => onUpdateFn?.(),
        onError: (mode) =>
            toast.error(
                mode === 'create'
                    ? 'An error occurred while creating guidance.'
                    : 'An error occurred while saving guidance.',
            ),
    })
}
