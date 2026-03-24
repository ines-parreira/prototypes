import { useEffect } from 'react'

import { reportError } from '@repo/logging'

import useAppDispatch from 'hooks/useAppDispatch'
import { useGetArticleTranslations } from 'models/helpCenter/queries'
import type { Article, LocaleCode } from 'models/helpCenter/types'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import {
    getNewArticleTranslation,
    isExistingArticle,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import type { Components } from 'rest_api/help_center_api/client.generated'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { changeViewLanguage } from 'state/ui/helpCenter'

export const useArticleTranslations = (
    selectedArticle: Components.Schemas.CreateArticleDto | Article | null,
    selectedCategoryId: number | null,
    selectedArticleLanguage: LocaleCode,
) => {
    const dispatch = useAppDispatch()
    const helpCenter = useCurrentHelpCenter()

    const shouldFetch = isExistingArticle(selectedArticle)

    const {
        data: selectedArticleTranslations,
        isLoading: isFetchingArticleTranslations,
        error,
    } = useGetArticleTranslations(
        helpCenter.id,
        shouldFetch ? selectedArticle.id : 0,
        { version_status: 'latest_draft' },
        {
            enabled: shouldFetch,
        },
    )

    const selectedTranslation =
        selectedArticleTranslations?.data?.find(
            ({ locale }) => locale === selectedArticleLanguage,
        ) || null

    useEffect(() => {
        if (selectedArticleTranslations) {
            const translation =
                selectedArticleTranslations.data.find(
                    ({ locale }) => locale === selectedArticleLanguage,
                ) ||
                selectedArticleTranslations.data.find(({ locale }) =>
                    helpCenter.supported_locales.includes(locale),
                )

            if (translation) {
                if (translation.locale !== selectedArticleLanguage) {
                    dispatch(changeViewLanguage(translation.locale))
                }
            }
        }
    }, [
        selectedArticleTranslations,
        selectedArticleLanguage,
        helpCenter.supported_locales,
        dispatch,
    ])

    useEffect(() => {
        if (error) {
            void dispatch(
                notify({
                    message: 'Failed to fetch article translations',
                    status: NotificationStatus.Error,
                }),
            )
            reportError(error as Error)
        }
    }, [error, dispatch])

    const getTranslationForLocale = (localeCode: LocaleCode) => {
        return (
            selectedArticleTranslations?.data?.find(
                ({ locale: translationLocale }) =>
                    translationLocale === localeCode,
            ) ?? getNewArticleTranslation(localeCode, selectedCategoryId)
        )
    }

    return {
        selectedTranslation,
        selectedArticleTranslations: selectedArticleTranslations?.data,
        getTranslationForLocale,
        isFetchingArticleTranslations:
            shouldFetch && isFetchingArticleTranslations,
    }
}
