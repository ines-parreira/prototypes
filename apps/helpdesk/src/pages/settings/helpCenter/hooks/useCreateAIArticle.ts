import { useCreateArticle } from 'models/helpCenter/queries'
import type {
    AIArticle,
    CustomerVisibility,
    LocaleCode,
} from 'models/helpCenter/types'

import type { ArticleOrigin } from '../types/articleOrigin.enum'
import { mapAILibraryArticleItemToArticle } from '../utils/helpCenter.utils'

export const useCreateAIArticle = (
    helpCenterId: number,
    locale: LocaleCode,
) => {
    const {
        mutateAsync: createArticleMutateAsync,
        isLoading: isCreateArticleLoading,
    } = useCreateArticle()

    type createArticleProps = {
        articleTemplate: AIArticle
        customerVisibility: CustomerVisibility
        categoryId: number | null
        publish: boolean
        origin?: ArticleOrigin
    }

    const createArticle = ({
        articleTemplate,
        customerVisibility,
        categoryId,
        publish,
        origin,
    }: createArticleProps) => {
        const payload = mapAILibraryArticleItemToArticle({
            article: articleTemplate,
            locale,
            customerVisibility,
            categoryId,
            publish,
            origin,
        })
        if (!payload)
            return Promise.reject(
                'No payload provided during article creation.',
            )

        return createArticleMutateAsync([
            undefined,
            { help_center_id: helpCenterId },
            payload,
        ])
    }

    return {
        createArticle,
        isCreateArticleLoading,
    }
}
