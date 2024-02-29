import {useEffect, useMemo, useState} from 'react'
import {
    AIArticle,
    AIArticleToggleOptionValue,
    AILibraryArticleItem,
} from 'models/helpCenter/types'
import {mapAILibraryArticlesData} from '../AIArticlesLibraryUtils'
import {MINIMUM_AI_ARTICLES} from '../../CategoriesView/components/ArticleTemplateCard/constants'

export const useHelpCenterAIArticlesLibrary = (
    fetchedArticles?: AIArticle[] | null
) => {
    const [articles, setArticles] = useState<AILibraryArticleItem[]>([])
    const [selectedArticle, setSelectedArticle] =
        useState<AILibraryArticleItem>()

    const latestBatchDate = useMemo(() => {
        const newestArticle = (fetchedArticles || []).sort(
            (a, b) =>
                new Date(b.generated_datetime || '').getTime() -
                new Date(a.generated_datetime || '').getTime()
        )?.[0]

        return newestArticle?.generated_datetime
    }, [fetchedArticles])

    const articlesNotReviewed = useMemo(() => {
        return fetchedArticles?.filter((article) => !article.review_action)
    }, [fetchedArticles])

    const newArticles = useMemo(
        () =>
            articlesNotReviewed?.filter(
                (article) => article.generated_datetime === latestBatchDate
            ) || [],
        [articlesNotReviewed, latestBatchDate]
    )

    const oldArticles = useMemo(
        () =>
            articlesNotReviewed?.filter(
                (article) => article.generated_datetime !== latestBatchDate
            ) || [],
        [articlesNotReviewed, latestBatchDate]
    )

    const [selectedArticleType, setSelectedArticleType] =
        useState<AIArticleToggleOptionValue>(AIArticleToggleOptionValue.New)

    useEffect(() => {
        const articleItems = mapAILibraryArticlesData(
            articlesNotReviewed || [],
            selectedArticleType,
            latestBatchDate
        )
        setArticles(articleItems)
        setSelectedArticle(articleItems?.[0])
    }, [articlesNotReviewed, selectedArticleType, latestBatchDate])

    return {
        articles,
        counters: {
            [AIArticleToggleOptionValue.New]: newArticles.length,
            [AIArticleToggleOptionValue.Old]: oldArticles.length,
            [AIArticleToggleOptionValue.All]:
                newArticles.length + oldArticles.length,
        },
        selectedArticleType,
        setSelectedArticleType,
        selectedArticle,
        setSelectedArticle,
        showLinkToArticleTemplates:
            (fetchedArticles?.length ?? 0) < MINIMUM_AI_ARTICLES,
    }
}
