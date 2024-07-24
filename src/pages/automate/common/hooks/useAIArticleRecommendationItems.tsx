import {useMemo} from 'react'
import {AIArticle, LocaleCode} from 'models/helpCenter/types'
import {useConditionalGetAIArticles} from 'pages/settings/helpCenter/hooks/useConditionalGetAIArticles'
import {sortAIArticlesByTicketsCount} from 'pages/settings/helpCenter/components/AIArticlesLibraryView/AIArticlesLibraryUtils'

export enum AllRecommendationsStatus {
    All = 'all',
    ArticleCreated = 'article-created',
    NotCreated = 'not-created',
}

export type AIArticleRecommendationItem = {
    title: string
    templateKey: string
    ticketsCount: number
    reviewAction?:
        | 'archive'
        | 'publish'
        | 'saveAsDraft'
        | 'dismissFromTopQuestions'
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
            return !article.review_action
        default:
            return false
    }
}

type Props = {
    helpCenterId: number
    storeIntegrationId: number | null
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

    const {fetchedArticles, isLoading} = useConditionalGetAIArticles({
        helpCenterId,
        storeIntegrationId,
        locale,
    })

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
        }))
    }, [sortedFetchedArticles, statusFilter])

    return useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return {
            paginatedItems: recommendationsItems.slice(startIndex, endIndex),
            itemsCount: recommendationsItems.length,
            totalItemsCount: fetchedArticles?.length || 0,
            isLoading,
            batchDatetime: fetchedArticles
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
