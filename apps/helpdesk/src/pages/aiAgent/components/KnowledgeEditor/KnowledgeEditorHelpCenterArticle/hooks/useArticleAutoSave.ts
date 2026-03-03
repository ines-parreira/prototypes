import { useCallback, useRef } from 'react'

import { useDebouncedCallback } from '@repo/hooks'

import { useNotify } from 'hooks/useNotify'
import {
    useCreateArticle,
    useCreateArticleTranslation,
    useUpdateArticleTranslation,
} from 'models/helpCenter/mutations'
import { areTrimmedStringsEqual } from 'pages/aiAgent/components/KnowledgeEditor/shared/utils'
import { slugify } from 'pages/settings/helpCenter/utils/helpCenter.utils'

import { useArticleContext } from '../context/ArticleContext'
import type { ArticleState } from '../context/types'

const DEFAULT_AUTOSAVE_DELAY_MS = 2000

type AutoSaveParams = {
    title: string
    content: string
    mode: 'edit' | 'create'
    translationMode: 'existing' | 'new'
    articleId: number | undefined
    savedSnapshot: ArticleState['savedSnapshot']
}

export const useArticleAutoSave = () => {
    const {
        state,
        dispatch,
        config,
        shouldAddToMissingKnowledge = true,
    } = useArticleContext()

    const { helpCenter, template, onCreatedFn, onUpdatedFn } = config

    const { error: notifyError } = useNotify()

    const { mutateAsync: createArticleMutation } = useCreateArticle(
        helpCenter.id,
    )
    const { mutateAsync: createTranslationMutation } =
        useCreateArticleTranslation(helpCenter.id)
    const { mutateAsync: updateTranslationMutation } =
        useUpdateArticleTranslation(helpCenter.id)

    const pendingSaveRef = useRef<{
        title: string
        content: string
    } | null>(null)

    const performAutoSave = useCallback(
        async ({
            title,
            content,
            mode,
            translationMode,
            articleId,
            savedSnapshot,
        }: AutoSaveParams) => {
            if (!helpCenter.id || !helpCenter.default_locale) {
                dispatch({ type: 'SET_AUTO_SAVING', payload: false })
                return
            }

            if (
                areTrimmedStringsEqual(title, savedSnapshot.title) &&
                content === savedSnapshot.content
            ) {
                dispatch({ type: 'SET_AUTO_SAVING', payload: false })
                return
            }

            pendingSaveRef.current = { title, content }

            try {
                if (mode === 'create' && translationMode === 'new') {
                    const response = await createArticleMutation([
                        undefined,
                        { help_center_id: helpCenter.id },
                        {
                            translation: {
                                locale: state.currentLocale,
                                title,
                                content,
                                excerpt: '',
                                slug: slugify(title),
                                seo_meta: {
                                    title: null,
                                    description: null,
                                },
                                category_id: null,
                                is_current: false,
                                visibility_status: 'PUBLIC',
                                customer_visibility: 'PUBLIC',
                            },
                            template_key: template?.key,
                        },
                    ])

                    if (response?.data && pendingSaveRef.current) {
                        const savedValues = pendingSaveRef.current
                        dispatch({
                            type: 'MARK_CONTENT_AS_SAVED',
                            payload: {
                                title: savedValues.title,
                                content: savedValues.content,
                                article: response.data,
                            },
                        })
                        dispatch({ type: 'SET_MODE', payload: 'edit' })
                        onCreatedFn?.(
                            response.data,
                            shouldAddToMissingKnowledge,
                        )
                    }
                } else if (mode === 'edit' && translationMode === 'new') {
                    if (!articleId) {
                        dispatch({ type: 'SET_AUTO_SAVING', payload: false })
                        return
                    }

                    const response = await createTranslationMutation([
                        undefined,
                        {
                            help_center_id: helpCenter.id,
                            article_id: articleId,
                        },
                        {
                            locale: state.currentLocale,
                            title,
                            content,
                            excerpt: '',
                            slug: slugify(title),
                            seo_meta: {
                                title: null,
                                description: null,
                            },
                            category_id: null,
                            is_current: false,
                            visibility_status: 'PUBLIC',
                        },
                    ])

                    if (response?.data && pendingSaveRef.current) {
                        const savedValues = pendingSaveRef.current
                        const existingArticle = state.article
                        if (existingArticle) {
                            dispatch({
                                type: 'MARK_CONTENT_AS_SAVED',
                                payload: {
                                    title: savedValues.title,
                                    content: savedValues.content,
                                    article: {
                                        ...existingArticle,
                                        translation: response.data,
                                    },
                                },
                            })
                        }
                        onUpdatedFn?.()
                    }
                } else {
                    if (!articleId) {
                        dispatch({ type: 'SET_AUTO_SAVING', payload: false })
                        return
                    }

                    const response = await updateTranslationMutation([
                        undefined,
                        {
                            help_center_id: helpCenter.id,
                            article_id: articleId,
                            locale: state.currentLocale,
                        },
                        {
                            title,
                            content,
                            is_current: false,
                        },
                    ])

                    if (response?.data && pendingSaveRef.current) {
                        const savedValues = pendingSaveRef.current
                        const existingArticle = state.article
                        if (existingArticle) {
                            dispatch({
                                type: 'MARK_CONTENT_AS_SAVED',
                                payload: {
                                    title: savedValues.title,
                                    content: savedValues.content,
                                    article: {
                                        ...existingArticle,
                                        translation: {
                                            ...existingArticle.translation,
                                            ...response.data,
                                        },
                                    },
                                },
                            })
                        }
                        onUpdatedFn?.()
                    }
                }
            } catch {
                notifyError(
                    mode === 'create'
                        ? 'An error occurred while creating the article.'
                        : 'An error occurred while saving the article.',
                )
            } finally {
                pendingSaveRef.current = null
                dispatch({ type: 'SET_AUTO_SAVING', payload: false })
            }
        },
        [
            helpCenter.id,
            helpCenter.default_locale,
            state.currentLocale,
            state.article,
            template?.key,
            createArticleMutation,
            createTranslationMutation,
            updateTranslationMutation,
            dispatch,
            onCreatedFn,
            onUpdatedFn,
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
            if (state.articleMode === 'read' || state.articleMode === 'diff')
                return

            let newTitle = field === 'title' ? value : state.title
            const newContent = field === 'content' ? value : state.content

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
            const isSameContent =
                areTrimmedStringsEqual(newTitle, state.savedSnapshot.title) &&
                newContent === state.savedSnapshot.content
            if (!isValid || isSameContent) {
                return
            }

            triggerAutoSave({
                title: newTitle,
                content: newContent,
                mode: state.articleMode,
                translationMode: state.translationMode,
                articleId: state.article?.id,
                savedSnapshot: state.savedSnapshot,
            })
        },
        [
            dispatch,
            triggerAutoSave,
            state.articleMode,
            state.translationMode,
            state.title,
            state.content,
            state.article?.id,
            state.savedSnapshot,
        ],
    )

    return { onChangeField }
}
