import {useEffect, useMemo, useState} from 'react'
import {
    AIArticle,
    AIArticleToggleOptionValue,
    AILibraryArticleItem,
    ArticleTemplateReviewAction,
    Locale,
} from 'models/helpCenter/types'
import {useConditionalGetAIArticles} from 'pages/settings/helpCenter/hooks/useConditionalGetAIArticles'
import {useSelfServiceStoreIntegrationByShopName} from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import {mapAILibraryArticlesData} from '../AIArticlesLibraryUtils'
import {MINIMUM_AI_ARTICLES} from '../../CategoriesView/components/ArticleTemplateCard/constants'

export const useHelpCenterAIArticlesLibrary = (
    helpCenterId: number,
    locale: Locale['code'],
    helpCenterShopName: string | null
) => {
    const [articles, setArticles] = useState<AIArticle[] | null>(null)
    const [mappedArticleItems, setMappedArticleItems] = useState<
        AILibraryArticleItem[]
    >([])

    const storeIntegration = useSelfServiceStoreIntegrationByShopName(
        helpCenterShopName ?? ''
    )
    const {fetchedArticles: fetchedArticles, isLoading: isLoading} =
        useConditionalGetAIArticles(
            helpCenterId,
            Number(storeIntegration?.id),
            locale
        )
    const fetchedArticlesCount = fetchedArticles?.length ?? 0

    const [selectedArticle, setSelectedArticle] =
        useState<AILibraryArticleItem>()

    const latestBatchDate = useMemo(() => {
        const newestArticle = (articles || []).sort(
            (a, b) =>
                new Date(b.batch_datetime || '').getTime() -
                new Date(a.batch_datetime || '').getTime()
        )?.[0]

        return newestArticle?.batch_datetime
    }, [articles])

    const articlesNotReviewed = useMemo(() => {
        return articles?.filter((article) => !article.review_action)
    }, [articles])

    const newArticles = useMemo(
        () =>
            articlesNotReviewed?.filter(
                (article) => article.batch_datetime === latestBatchDate
            ) || [],
        [articlesNotReviewed, latestBatchDate]
    )

    const oldArticles = useMemo(
        () =>
            articlesNotReviewed?.filter(
                (article) => article.batch_datetime !== latestBatchDate
            ) || [],
        [articlesNotReviewed, latestBatchDate]
    )

    const [selectedArticleType, setSelectedArticleType] =
        useState<AIArticleToggleOptionValue>(AIArticleToggleOptionValue.New)

    useEffect(() => {
        setArticles(fetchedArticles || null)
    }, [fetchedArticles])

    useEffect(() => {
        const mappedArticleItems = mapAILibraryArticlesData(
            articlesNotReviewed || [],
            selectedArticleType,
            latestBatchDate
        )
        setMappedArticleItems(mappedArticleItems)
        setSelectedArticle(mappedArticleItems?.[0])
    }, [articlesNotReviewed, selectedArticleType, latestBatchDate])

    return {
        articles: mappedArticleItems,
        isLoading,
        counters: articles && {
            [AIArticleToggleOptionValue.New]: newArticles.length,
            [AIArticleToggleOptionValue.Old]: oldArticles.length,
            [AIArticleToggleOptionValue.All]:
                newArticles.length + oldArticles.length,
        },
        selectedArticleType,
        setSelectedArticleType,
        selectedArticle,
        setSelectedArticle,
        hasNewArticles:
            newArticles.length > 0 &&
            fetchedArticlesCount >= MINIMUM_AI_ARTICLES,
        showLinkToArticleTemplates: fetchedArticlesCount < MINIMUM_AI_ARTICLES,
        markArticleAsReviewed: (
            templateKey: string,
            reviewAction: ArticleTemplateReviewAction
        ) => {
            if (!articles) return

            const articleIndex = articles.findIndex(
                (item) => item.key === templateKey
            )

            const newArticles = [...articles]
            newArticles[articleIndex] = {
                ...newArticles[articleIndex],
                review_action: reviewAction,
            }

            setArticles(newArticles)
        },
    }
}
