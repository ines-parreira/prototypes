import { useUpdateArticleTranslation } from 'models/helpCenter/queries'
import { HelpCenter, HelpCenterArticleItem } from 'models/helpCenter/types'

import { slugify } from '../utils/helpCenter.utils'

export const useUpdateArticleTranslationUsingTemplate = (
    helpCenter: HelpCenter,
) => {
    const {
        mutateAsync: updateArticleTranslationMutateAsync,
        isLoading: isUpdateArticleTranslationLoading,
    } = useUpdateArticleTranslation()

    const updateArticleTranslation = (
        article: HelpCenterArticleItem,
        shouldPublish = false,
    ) => {
        if (!article.id)
            return Promise.reject('No article provided during article update.')

        return updateArticleTranslationMutateAsync([
            undefined,
            {
                help_center_id: helpCenter.id,
                article_id: article.id,
                locale: helpCenter.default_locale,
            },
            {
                title: article.title,
                content: article.content,
                slug: slugify(article.title!),
                is_current: shouldPublish,
            },
        ])
    }

    return {
        updateArticleTranslation,
        isUpdateArticleTranslationLoading,
    }
}
