import { useCreateArticleTranslation } from 'models/helpCenter/queries'
import type { HelpCenter, HelpCenterArticleItem } from 'models/helpCenter/types'

import { mapHelpCenterArticleItemToArticle } from '../utils/helpCenter.utils'

export const useCreateArticleTranslationUsingTemplate = (
    helpCenter: HelpCenter,
) => {
    const {
        mutateAsync: createArticleTranslationMutateAsync,
        isLoading: isCreateArticleTranslationLoading,
    } = useCreateArticleTranslation()

    const createArticleTranslation = (
        articleTemplate: HelpCenterArticleItem,
        shouldPublish = false,
    ) => {
        const payload = mapHelpCenterArticleItemToArticle({
            article: articleTemplate,
            locale: helpCenter.default_locale,
            shouldPublish,
        })
        if (!payload || !articleTemplate.id)
            return Promise.reject(
                'No payload provided during article creation.',
            )

        return createArticleTranslationMutateAsync([
            undefined,
            {
                help_center_id: helpCenter.id,
                article_id: articleTemplate.id,
            },
            { ...payload?.translation },
        ])
    }

    return {
        createArticleTranslation,
        isCreateArticleTranslationLoading,
    }
}
