import {useConditionalGetAIArticles} from 'pages/settings/helpCenter/hooks/useConditionalGetAIArticles'
import {sortAIArticlesByTicketsCount} from 'pages/settings/helpCenter/components/AIArticlesLibraryView/AIArticlesLibraryUtils'
import {TopQuestionsSectionProps} from './TopQuestionsSection'

export const filteredSortedTopQuestionsFromFetchedArticles = (
    fetchedArticles: ReturnType<
        typeof useConditionalGetAIArticles
    >['fetchedArticles']
): TopQuestionsSectionProps['topQuestions'] => {
    if (!fetchedArticles) {
        return []
    }

    return sortAIArticlesByTicketsCount([...fetchedArticles])
        .filter((article) => article.review_action === undefined)
        .map((article) => ({
            title: article.title,
            templateKey: article.key,
            ticketsCount: article.related_tickets_count ?? 0,
            reviewAction: article.review_action,
        }))
}
