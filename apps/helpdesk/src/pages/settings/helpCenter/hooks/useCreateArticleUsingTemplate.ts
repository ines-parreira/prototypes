import { useCreateArticle } from 'models/helpCenter/queries'
import type { HelpCenter, HelpCenterArticleItem } from 'models/helpCenter/types'

import { mapHelpCenterArticleItemToArticle } from '../utils/helpCenter.utils'

export const useCreateArticleUsingTemplate = (helpCenter: HelpCenter) => {
    const {
        mutateAsync: createArticleMutateAsync,
        isLoading: isCreateArticleLoading,
    } = useCreateArticle()

    const createArticle = (
        articleTemplate: HelpCenterArticleItem,
        shouldPublish = false,
    ) => {
        const payload = mapHelpCenterArticleItemToArticle({
            article: articleTemplate,
            locale: helpCenter.default_locale,
            shouldPublish,
        })
        if (!payload)
            return Promise.reject(
                'No payload provided during article creation.',
            )

        return createArticleMutateAsync([
            undefined,
            { help_center_id: helpCenter.id },
            payload,
        ])
    }

    return {
        createArticle,
        isCreateArticleLoading,
    }
}
