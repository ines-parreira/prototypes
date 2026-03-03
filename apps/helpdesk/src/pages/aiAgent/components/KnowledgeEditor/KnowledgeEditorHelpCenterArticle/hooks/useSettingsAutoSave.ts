import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useDebouncedEffect } from '@repo/hooks'

import useAppSelector from 'hooks/useAppSelector'
import { useNotify } from 'hooks/useNotify'
import { useUpdateArticleTranslation } from 'models/helpCenter/mutations'
import type {
    Locale,
    LocaleCode,
    UpdateArticleTranslationDto,
} from 'models/helpCenter/types'
import { getCategoryOptions } from 'pages/settings/helpCenter/components/articles/ArticleCategorySelect/hooks/useCategoriesOptions'
import type {
    ActionType as LocaleActionType,
    OptionItem as LocaleOption,
} from 'pages/settings/helpCenter/components/articles/ArticleLanguageSelect/ArticleLanguageSelect'
import { isOneOfParentsUnlisted } from 'pages/settings/helpCenter/components/HelpCenterCategoryEdit/utils'
import { getLocaleSelectOptions } from 'pages/settings/helpCenter/utils/localeSelectOptions'
import { AutoSaveState } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { getCategoriesById } from 'state/entities/helpCenter/categories'

import { useArticleContext } from '../context/ArticleContext'
import type { SettingsChanges } from '../context/types'

const DEFAULT_SETTINGS_AUTOSAVE_DELAY_MS = 1000

const getCategoryTitlesById = (
    categories: { id: number; translation?: { title?: string } | null }[],
) => {
    const titlesById: Record<string, string> = {}
    for (const category of categories) {
        if (category.translation?.title) {
            titlesById[category.id] = category.translation.title
        }
    }
    return titlesById
}

const getLocalesOptions = (
    supportedLocales: Locale[],
    helpCenterLocales: LocaleCode[],
    articleLocales: LocaleCode[],
) =>
    getLocaleSelectOptions(supportedLocales, helpCenterLocales).map(
        (option) => ({
            ...option,
            isComplete: articleLocales.includes(option.value),
            canBeDeleted: articleLocales.length > 1,
        }),
    )

const SAVED_STATE_DURATION_MS = 4000

export const useSettingsAutoSave = () => {
    const { state, dispatch, config, hasPendingContentChanges } =
        useArticleContext()
    const { helpCenter, supportedLocales, categories, onUpdatedFn } = config
    const categoriesById = useAppSelector(getCategoriesById)
    const { error: notifyError } = useNotify()
    const [isSettingsAutoSaving, setIsSettingsAutoSaving] = useState(false)
    const [showSavedState, setShowSavedState] = useState(false)
    const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        return () => {
            if (savedTimeoutRef.current) {
                clearTimeout(savedTimeoutRef.current)
            }
        }
    }, [])

    const { mutateAsync: updateTranslationMutation } =
        useUpdateArticleTranslation(helpCenter.id)

    const categoryTitlesById = useMemo(
        () => getCategoryTitlesById(categories),
        [categories],
    )

    const isParentUnlisted = useMemo(
        () =>
            isOneOfParentsUnlisted(
                categories,
                state.article?.translation.category_id ?? null,
            ),
        [categories, state.article?.translation.category_id],
    )

    const categoryOptions = useMemo(
        () =>
            getCategoryOptions(categories, state.currentLocale, categoriesById),
        [categories, state.currentLocale, categoriesById],
    )

    const localeOptions = useMemo(
        () =>
            getLocalesOptions(
                supportedLocales,
                helpCenter.supported_locales,
                state.article?.available_locales ?? [],
            ),
        [
            supportedLocales,
            helpCenter.supported_locales,
            state.article?.available_locales,
        ],
    )

    const onChangeCategory = useCallback(
        (value: number | null) => {
            setIsSettingsAutoSaving(true)
            dispatch({ type: 'SET_UPDATING', payload: true })
            dispatch({
                type: 'SET_PENDING_SETTINGS',
                payload: { category_id: value },
            })
        },
        [dispatch],
    )

    const onChangeVisibility = useCallback(
        (status: 'PUBLIC' | 'UNLISTED') => {
            setIsSettingsAutoSaving(true)
            dispatch({ type: 'SET_UPDATING', payload: true })
            dispatch({
                type: 'SET_PENDING_SETTINGS',
                payload: { customer_visibility: status },
            })
        },
        [dispatch],
    )

    const onChangeSlug = useCallback(
        (slug: string) => {
            setIsSettingsAutoSaving(true)
            dispatch({ type: 'SET_UPDATING', payload: true })
            dispatch({
                type: 'SET_PENDING_SETTINGS',
                payload: { slug },
            })
        },
        [dispatch],
    )

    const onChangeExcerpt = useCallback(
        (excerpt: string) => {
            setIsSettingsAutoSaving(true)
            dispatch({ type: 'SET_UPDATING', payload: true })
            dispatch({
                type: 'SET_PENDING_SETTINGS',
                payload: { excerpt },
            })
        },
        [dispatch],
    )

    const onChangeMetaTitle = useCallback(
        (metaTitle: string | null) => {
            setIsSettingsAutoSaving(true)
            dispatch({ type: 'SET_UPDATING', payload: true })
            dispatch({
                type: 'SET_PENDING_SETTINGS',
                payload: {
                    seo_meta: {
                        description:
                            state.pendingSettingsChanges.seo_meta
                                ?.description ??
                            state.article?.translation.seo_meta?.description ??
                            null,
                        title: metaTitle,
                    },
                },
            })
        },
        [
            dispatch,
            state.pendingSettingsChanges.seo_meta?.description,
            state.article?.translation.seo_meta?.description,
        ],
    )

    const onChangeMetaDescription = useCallback(
        (metaDescription: string | null) => {
            setIsSettingsAutoSaving(true)
            dispatch({ type: 'SET_UPDATING', payload: true })
            dispatch({
                type: 'SET_PENDING_SETTINGS',
                payload: {
                    seo_meta: {
                        description: metaDescription,
                        title:
                            state.pendingSettingsChanges.seo_meta?.title ??
                            state.article?.translation.seo_meta?.title ??
                            null,
                    },
                },
            })
        },
        [
            dispatch,
            state.pendingSettingsChanges.seo_meta?.title,
            state.article?.translation.seo_meta?.title,
        ],
    )

    const onLocaleActionClick = useCallback(
        (action: LocaleActionType, locale: LocaleOption) => {
            if (action === 'delete') {
                dispatch({
                    type: 'SET_MODAL',
                    payload: { type: 'delete-translation', locale },
                })
            } else if (action === 'view' || action === 'create') {
                if (hasPendingContentChanges) {
                    dispatch({ type: 'SET_MODAL', payload: 'unsaved' })
                }
            }
        },
        [hasPendingContentChanges, dispatch],
    )

    const performSettingsSave = useCallback(
        async (changes: SettingsChanges) => {
            if (
                state.translationMode !== 'existing' ||
                !state.article?.id ||
                Object.keys(changes).length === 0
            ) {
                return
            }

            try {
                const response = await updateTranslationMutation([
                    undefined,
                    {
                        help_center_id: helpCenter.id,
                        article_id: state.article.id,
                        locale: state.currentLocale,
                    },
                    {
                        ...changes,
                        is_current: false,
                    } as UpdateArticleTranslationDto,
                ])

                if (response?.data) {
                    dispatch({
                        type: 'UPDATE_TRANSLATION',
                        payload: response.data,
                    })
                    onUpdatedFn?.()

                    setShowSavedState(true)
                    if (savedTimeoutRef.current) {
                        clearTimeout(savedTimeoutRef.current)
                    }
                    savedTimeoutRef.current = setTimeout(() => {
                        setShowSavedState(false)
                    }, SAVED_STATE_DURATION_MS)
                }
            } catch {
                notifyError('An error occurred while saving the settings.')
            } finally {
                dispatch({ type: 'CLEAR_PENDING_SETTINGS' })
                dispatch({ type: 'SET_UPDATING', payload: false })
                setIsSettingsAutoSaving(false)
            }
        },
        [
            state.translationMode,
            state.article?.id,
            state.currentLocale,
            helpCenter.id,
            updateTranslationMutation,
            dispatch,
            onUpdatedFn,
            notifyError,
        ],
    )

    useDebouncedEffect(
        () => {
            if (state.translationMode === 'existing') {
                performSettingsSave(state.pendingSettingsChanges)
            }
        },
        [state.pendingSettingsChanges],
        DEFAULT_SETTINGS_AUTOSAVE_DELAY_MS,
    )

    const settingsProps = useMemo(
        () => ({
            category: {
                categoryId:
                    state.pendingSettingsChanges.category_id !== undefined
                        ? state.pendingSettingsChanges.category_id
                        : (state.article?.translation.category_id ?? null),
                categoryTitlesById,
                categoryOptions,
                onChangeCategory,
            },
            language: {
                locale: state.currentLocale,
                localeOptions,
                onChangeLanguage: (locale: LocaleCode) => {
                    const option = localeOptions.find(
                        (opt) => opt.value === locale,
                    )
                    if (option) {
                        onLocaleActionClick('view', option)
                    }
                },
                onActionClick: onLocaleActionClick,
            },
            visibility: {
                customerVisibility:
                    state.pendingSettingsChanges.customer_visibility ??
                    state.article?.translation.customer_visibility ??
                    'PUBLIC',
                onChangeVisibility,
                isParentUnlisted,
            },
            slug: state.article
                ? {
                      slug:
                          state.pendingSettingsChanges.slug ??
                          state.article.translation.slug,
                      onChangeSlug,
                      articleId: state.article.id,
                  }
                : undefined,
            excerpt: {
                excerpt:
                    state.pendingSettingsChanges.excerpt ??
                    state.article?.translation.excerpt ??
                    '',
                onChangeExcerpt,
            },
            metaTitle: {
                metaTitle:
                    state.pendingSettingsChanges.seo_meta?.title ??
                    state.article?.translation.seo_meta?.title ??
                    '',
                onChangeMetaTitle,
            },
            metaDescription: {
                metaDescription:
                    state.pendingSettingsChanges.seo_meta?.description ??
                    state.article?.translation.seo_meta?.description ??
                    '',
                onChangeMetaDescription,
            },
            title: state.title ?? '',
        }),
        [
            state.pendingSettingsChanges,
            state.article,
            state.title,
            state.currentLocale,
            categoryTitlesById,
            categoryOptions,
            localeOptions,
            isParentUnlisted,
            onChangeCategory,
            onChangeVisibility,
            onChangeSlug,
            onChangeExcerpt,
            onChangeMetaTitle,
            onChangeMetaDescription,
            onLocaleActionClick,
        ],
    )

    const isCreationMode = state.articleMode === 'create' && !state.article?.id

    const autoSave = useMemo(
        () => ({
            state: isSettingsAutoSaving
                ? AutoSaveState.SAVING
                : showSavedState
                  ? AutoSaveState.SAVED
                  : AutoSaveState.INITIAL,
            updatedAt: state.article?.translation.updated_datetime
                ? new Date(state.article.translation.updated_datetime)
                : undefined,
        }),
        [
            isSettingsAutoSaving,
            showSavedState,
            state.article?.translation.updated_datetime,
        ],
    )

    return {
        settingsProps,
        autoSave,
        isCreationMode,
    }
}
