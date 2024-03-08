import {useCreateArticle} from 'models/helpCenter/queries'
import {AILibraryArticleItem, HelpCenter} from 'models/helpCenter/types'
import {mapAILibraryArticleItemToArticle} from '../utils/helpCenter.utils'

export const useCreateAIArticle = (helpCenter: HelpCenter) => {
    const {
        mutateAsync: createArticleMutateAsync,
        isLoading: isCreateArticleLoading,
    } = useCreateArticle()

    type createArticleProps = {
        articleTemplate: AILibraryArticleItem
        visibilityStatus: 'PUBLIC' | 'UNLISTED'
        categoryId: number | null
        publish: boolean
    }

    const createArticle = ({
        articleTemplate,
        visibilityStatus,
        categoryId,
        publish,
    }: createArticleProps) => {
        const payload = mapAILibraryArticleItemToArticle({
            article: articleTemplate,
            locale: helpCenter.default_locale,
            visibilityStatus,
            categoryId,
            publish,
        })
        if (!payload)
            return Promise.reject(
                'No payload provided during article creation.'
            )

        return createArticleMutateAsync([
            undefined,
            {help_center_id: helpCenter.id},
            payload,
        ])
    }

    return {
        createArticle,
        isCreateArticleLoading,
    }
}
