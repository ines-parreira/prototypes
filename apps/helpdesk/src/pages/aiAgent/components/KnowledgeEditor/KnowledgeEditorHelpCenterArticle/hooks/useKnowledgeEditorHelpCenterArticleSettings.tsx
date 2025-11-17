import { useCallback, useEffect, useMemo, useState } from 'react'

import { useDebouncedEffect } from '@repo/hooks'

import { useNotify } from 'hooks/useNotify'
import type {
    ArticleWithLocalTranslation,
    Category,
    HelpCenter,
    Locale,
    LocaleCode,
    UpdateArticleTranslationDto,
    VisibilityStatus,
} from 'models/helpCenter/types'
import { getCategoryOptions } from 'pages/settings/helpCenter/components/articles/ArticleCategorySelect/hooks/useCategoriesOptions'
import type {
    ActionType as LocaleActionType,
    OptionItem as LocaleOption,
} from 'pages/settings/helpCenter/components/articles/ArticleLanguageSelect/ArticleLanguageSelect'
import { isOneOfParentsUnlisted } from 'pages/settings/helpCenter/components/HelpCenterCategoryEdit/utils'
import { getLocaleSelectOptions } from 'pages/settings/helpCenter/utils/localeSelectOptions'
import { AutoSaveState } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'

import type { Props as HelpCenterArticleSettingsProps } from '../../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelHelpCenterArticle/KnowledgeEditorSidePanelSectionHelpCenterArticleSettings'

export type Changes = Pick<
    UpdateArticleTranslationDto,
    'category_id' | 'visibility_status' | 'slug' | 'excerpt' | 'seo_meta'
>

type Props = {
    helpCenter: HelpCenter
    article?: ArticleWithLocalTranslation
    supportedLocales: Locale[]
    articleLocales: LocaleCode[]
    currentLocale: LocaleCode
    onChangeLocale: (locale: LocaleCode) => void
    categories: Category[]
    behavior:
        | {
              type: 'autosave'
              updateArticle: (
                  payload: UpdateArticleTranslationDto,
              ) => Promise<void>
          }
        | {
              type: 'controlled'
              onChanges: (changes: Changes) => void
          }
    onLocaleActionClick: (
        action: LocaleActionType,
        currentOption: LocaleOption,
    ) => void
}

export const getCategoryTitlesById = (categories: Category[]) => {
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
        (option) => {
            let isComplete = false
            let canBeDeleted = true

            isComplete = articleLocales.includes(option.value)
            canBeDeleted = articleLocales.length > 1

            return {
                ...option,
                isComplete,
                canBeDeleted,
            }
        },
    )

export const useKnowledgeEditorHelpCenterArticleSettings = ({
    helpCenter,
    article,
    currentLocale,
    supportedLocales,
    articleLocales,
    onChangeLocale,
    onLocaleActionClick,
    behavior,
    categories,
}: Props): Omit<HelpCenterArticleSettingsProps, 'sectionId'> => {
    const { error: notifyError } = useNotify()

    const categoryTitlesById = useMemo(
        () => getCategoryTitlesById(categories),
        [categories],
    )

    const isParentUnlisted = useMemo(
        () => isOneOfParentsUnlisted(categories, article?.category_id ?? null),
        [categories, article?.category_id],
    )

    const categoryOptions = useMemo(
        () => getCategoryOptions(categories, currentLocale),
        [categories, currentLocale],
    )

    const localeOptions = useMemo(
        () =>
            getLocalesOptions(
                supportedLocales,
                helpCenter.supported_locales,
                articleLocales,
            ),
        [supportedLocales, helpCenter.supported_locales, articleLocales],
    )

    const [pendingChanges, setPendingChanges] = useState<Changes>({})

    useEffect(() => setPendingChanges({}), [currentLocale])

    const onChangeCategory = useCallback((value: number | null) => {
        setPendingChanges((prev) => ({
            ...prev,
            category_id: value,
        }))
    }, [])

    const onChangeVisibility = useCallback((status: VisibilityStatus) => {
        setPendingChanges((prev) => ({
            ...prev,
            visibility_status: status,
        }))
    }, [])

    const onChangeSlug = useCallback((slug: string) => {
        setPendingChanges((prev) => ({
            ...prev,
            slug,
        }))
    }, [])

    const onChangeExcerpt = useCallback((excerpt: string) => {
        setPendingChanges((prev) => ({
            ...prev,
            excerpt,
        }))
    }, [])

    const onChangeMetaTitle = useCallback(
        (metaTitle: string) => {
            setPendingChanges((prev) => ({
                ...prev,
                seo_meta: {
                    description:
                        prev.seo_meta?.description ??
                        article?.translation.excerpt ??
                        '',
                    title: metaTitle,
                },
            }))
        },
        [article],
    )

    const onChangeMetaDescription = useCallback(
        (metaDescription: string) => {
            setPendingChanges((prev) => ({
                ...prev,
                seo_meta: {
                    description: metaDescription,
                    title:
                        prev.seo_meta?.title ??
                        article?.translation.title ??
                        '',
                },
            }))
        },
        [article],
    )

    const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>(
        AutoSaveState.INITIAL,
    )
    const [lastUpdated, setLastUpdated] = useState<Date | undefined>()

    const autoSave = useCallback(
        async (changes: Changes) => {
            if (
                behavior.type !== 'autosave' ||
                Object.keys(changes).length === 0
            ) {
                return
            }

            try {
                setAutoSaveState(AutoSaveState.SAVING)

                await behavior.updateArticle(changes)

                setAutoSaveState(AutoSaveState.SAVED)
                setLastUpdated(new Date())
            } catch {
                setAutoSaveState(AutoSaveState.INITIAL)
                notifyError('An error occurred while saving the settings.')
            } finally {
                setPendingChanges({})
            }
        },
        [behavior, notifyError],
    )

    useDebouncedEffect(
        () => {
            if (behavior.type === 'autosave') {
                autoSave(pendingChanges)
            } else {
                behavior.onChanges(pendingChanges)
            }
        },
        [pendingChanges],
        1000,
    )

    return useMemo(
        () => ({
            category: {
                categoryId:
                    pendingChanges.category_id !== undefined
                        ? pendingChanges.category_id
                        : (article?.translation.category_id ?? null),
                categoryTitlesById,
                categoryOptions,
                onChangeCategory,
            },
            language: {
                locale: currentLocale,
                localeOptions,
                onChangeLanguage: onChangeLocale,
                onActionClick: onLocaleActionClick,
            },
            visibility: {
                visibilityStatus:
                    pendingChanges.visibility_status ??
                    article?.translation.visibility_status ??
                    'PUBLIC',
                onChangeVisibility,
                isParentUnlisted,
            },
            slug: article
                ? {
                      slug: pendingChanges.slug ?? article.translation.slug,
                      onChangeSlug,
                      articleId: article.id,
                  }
                : undefined,
            excerpt: {
                excerpt:
                    pendingChanges.excerpt ??
                    article?.translation.excerpt ??
                    '',
                onChangeExcerpt,
            },
            metaTitle: {
                metaTitle:
                    pendingChanges.seo_meta?.title ??
                    article?.translation.seo_meta?.title ??
                    '',
                onChangeMetaTitle,
            },
            metaDescription: {
                metaDescription:
                    pendingChanges.seo_meta?.description ??
                    article?.translation.seo_meta?.description ??
                    '',
                onChangeMetaDescription,
            },
            autoSave:
                behavior.type !== 'autosave'
                    ? undefined
                    : {
                          state: autoSaveState,
                          updatedAt: lastUpdated,
                      },
            title: article?.translation.title ?? '',
        }),
        [
            categoryTitlesById,
            categoryOptions,
            onChangeCategory,
            localeOptions,
            onChangeLocale,
            onLocaleActionClick,
            onChangeVisibility,
            isParentUnlisted,
            onChangeSlug,
            onChangeExcerpt,
            onChangeMetaTitle,
            onChangeMetaDescription,
            autoSaveState,
            lastUpdated,
            article,
            pendingChanges,
            behavior.type,
            currentLocale,
        ],
    )
}
