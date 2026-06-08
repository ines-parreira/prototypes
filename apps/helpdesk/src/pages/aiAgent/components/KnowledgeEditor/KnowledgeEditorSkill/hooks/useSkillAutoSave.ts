import { useCallback } from 'react'
import { Duration } from '@gorgias/toolkit'

import { useShallow } from 'zustand/react/shallow'

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
    fromArticleTranslation,
    fromArticleTranslationResponse,
} from '../../KnowledgeEditorGuidance/context/utils'
import {
    useSkillEditorStore,
    useSkillEditorStoreApi,
} from '../context/KnowledgeEditorSkillContext'
import { useSkillNotify } from './useSkillNotify'

type SkillExtra = {
    visibility: boolean
    intents: string[]
}

export const useSkillAutoSave = () => {
    const store = useSkillEditorStoreApi()
    const dispatch = useSkillEditorStore((storeState) => storeState.dispatch)
    const { skillTemplate, onCreateFn, onUpdateFn, helpCenter } =
        useSkillEditorStore(
            useShallow((storeState) => ({
                skillTemplate: storeState.config.skillTemplate,
                onCreateFn: storeState.config.onCreateFn,
                onUpdateFn: storeState.config.onUpdateFn,
                helpCenter: storeState.config.helpCenter,
            })),
        )

    const { error: notifyError } = useSkillNotify()

    const { createGuidanceArticle, updateGuidanceArticle } =
        useGuidanceArticleMutation({
            guidanceHelpCenterId: helpCenter.id ?? 0,
        })

    const getCurrentState = useCallback(() => {
        const state = store.getState().state
        return {
            mode: state.mode,
            title: state.title,
            content: state.content,
            savedSnapshot: state.savedSnapshot,
            articleId: state.skill?.id,
            extra: {
                visibility: state.visibility,
                intents: state.intents,
            } as SkillExtra,
        }
    }, [store])

    const isHelpCenterReady = useCallback(
        () => !!helpCenter.id && !!helpCenter.default_locale,
        [helpCenter.id, helpCenter.default_locale],
    )

    const performSave = useCallback(
        async (params: BaseAutoSaveParams<SkillExtra>) => {
            if (params.mode === 'create') {
                const response = await createGuidanceArticle(
                    mapGuidanceFormFieldsToGuidanceArticle(
                        {
                            name: params.title,
                            content: params.content,
                            isVisible: params.extra.visibility,
                        },
                        helpCenter.default_locale,
                        skillTemplate
                            ? `template_skill_${skillTemplate.id}`
                            : undefined,
                        false,
                    ),
                    {
                        origin: 'skill',
                        intents: params.extra.intents,
                    },
                )

                if (!response) return null
                const createdSkill = fromArticleTranslation(response)
                return {
                    entity: createdSkill,
                    shouldSwitchToEditMode: true,
                }
            }

            if (!params.articleId) return null

            const response = await updateGuidanceArticle(
                {
                    ...mapGuidanceFormFieldsToGuidanceArticle(
                        {
                            name: params.title,
                            content: params.content,
                            isVisible: params.extra.visibility,
                        },
                        helpCenter.default_locale,
                        undefined,
                        false,
                    ),
                    intents: params.extra.intents as GuidanceArticle['intents'],
                },
                {
                    articleId: params.articleId,
                    locale: helpCenter.default_locale,
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
            helpCenter.default_locale,
            skillTemplate,
            createGuidanceArticle,
            updateGuidanceArticle,
        ],
    )

    return useEditorAutoSave<SkillExtra, GuidanceArticle>({
        debounceDelay: Duration.seconds(1),
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
            markAsSaved: (snapshot, article) => {
                dispatch({
                    type: 'MARK_AS_SAVED',
                    payload: {
                        title: snapshot.title,
                        content: snapshot.content,
                        article,
                    },
                })
            },
            setMode: (mode) => dispatch({ type: 'SET_MODE', payload: mode }),
            setAutoSaveError: (value) =>
                dispatch({ type: 'SET_AUTO_SAVE_ERROR', payload: value }),
        },
        onCreated: (article) => onCreateFn?.(article),
        onUpdated: () => onUpdateFn?.(),
        onError: (mode) =>
            notifyError(
                mode === 'create'
                    ? 'An error occurred while creating the skill.'
                    : 'An error occurred while saving the skill.',
            ),
    })
}
