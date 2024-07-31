import {useMemo} from 'react'
import {AIArticle, LocaleCode} from 'models/helpCenter/types'
import {sortAIArticlesByTicketsCount} from 'pages/settings/helpCenter/components/AIArticlesLibraryView/AIArticlesLibraryUtils'
import {useTopQuestionsArticles} from '../components/TopQuestions/useTopQuestionsArticles'

export enum AllRecommendationsStatus {
    All = 'all',
    ArticleCreated = 'article-created',
    NotCreated = 'not-created',
}

export const isAllRecommendationStatus = (
    status: unknown
): status is AllRecommendationsStatus =>
    status === AllRecommendationsStatus.All ||
    status === AllRecommendationsStatus.ArticleCreated ||
    status === AllRecommendationsStatus.NotCreated

export type AIArticleRecommendationItem = {
    title: string
    templateKey: string
    ticketsCount: number
    reviewAction?:
        | 'archive'
        | 'publish'
        | 'saveAsDraft'
        | 'dismissFromTopQuestions'
    createArticle: () => Promise<void>
}

const filterAIArticleStatusByReviewAction = (
    article: AIArticle,
    statusFilter: AllRecommendationsStatus
): boolean => {
    switch (statusFilter) {
        case AllRecommendationsStatus.All:
            return true
        case AllRecommendationsStatus.ArticleCreated:
            return (
                article.review_action === 'publish' ||
                article.review_action === 'saveAsDraft'
            )
        case AllRecommendationsStatus.NotCreated:
            return (
                article.review_action !== 'publish' &&
                article.review_action !== 'saveAsDraft'
            )
        default:
            return false
    }
}

type Props = {
    helpCenterId: number
    storeIntegrationId: number
    locale: LocaleCode
    statusFilter: AllRecommendationsStatus
    currentPage: number
    itemsPerPage: number
}

export const useAIArticleRecommendationItems = ({
    helpCenterId,
    storeIntegrationId,
    locale,
    statusFilter,
    currentPage,
    itemsPerPage,
}: Props) => {
    if (currentPage < 1) {
        throw new Error('Current page must be greater than or equal to 1')
    }

    const {
        articles: fetchedArticles,
        createArticle,
        isLoading,
    } = useTopQuestionsArticles(storeIntegrationId, helpCenterId, locale)

    const sortedFetchedArticles = useMemo(() => {
        if (!fetchedArticles) return []

        return sortAIArticlesByTicketsCount(fetchedArticles)
    }, [fetchedArticles])

    const recommendationsItems: AIArticleRecommendationItem[] = useMemo(() => {
        const filteredArticles = sortedFetchedArticles.filter((article) =>
            filterAIArticleStatusByReviewAction(article, statusFilter)
        )

        return filteredArticles.map((article) => ({
            title: article.title,
            templateKey: article.key,
            ticketsCount: article.related_tickets_count ?? 0,
            reviewAction: article.review_action,
            createArticle: () => createArticle(article.key),
        }))
    }, [sortedFetchedArticles, statusFilter, createArticle])

    return useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return {
            paginatedItems: recommendationsItems.slice(startIndex, endIndex),
            itemsCount: recommendationsItems.length,
            totalItemsCount: fetchedArticles?.length || 0,
            isLoading,
            batchDatetime:
                fetchedArticles.length > 0
                    ? fetchedArticles[0].batch_datetime
                    : undefined,
        }
    }, [
        currentPage,
        fetchedArticles,
        isLoading,
        itemsPerPage,
        recommendationsItems,
    ])
}
