import {
    AIArticle,
    AIArticleToggleOptionValue,
    AILibraryArticleItem,
} from 'models/helpCenter/types'

import {replaceNewLinesWithBr} from '../HelpCenterCreationWizard/HelpCenterCreationWizardUtils'

export const sortAIArticlesByTicketsCount = (
    articles: AIArticle[]
): AIArticle[] => {
    return articles.sort(
        (a, b) =>
            (b.related_tickets_count ?? 0) - (a.related_tickets_count ?? 0)
    )
}

export const mapAILibraryArticlesData = (
    articles: AIArticle[],
    selectedArticleType: AIArticleToggleOptionValue,
    latestBatchDate: string | undefined
) => {
    const sortedArticles = sortAIArticlesByTicketsCount(articles)

    const allArticleItems: AILibraryArticleItem[] = sortedArticles.map(
        (article) => {
            const isNew = article.batch_datetime === latestBatchDate

            return {
                ...article,
                html_content: replaceNewLinesWithBr(article.html_content) ?? '',
                isNew,
            }
        }
    )

    switch (selectedArticleType) {
        case AIArticleToggleOptionValue.New: {
            const newArticles = allArticleItems.filter(
                (article) => article.isNew
            )

            return newArticles
        }
        case AIArticleToggleOptionValue.Old: {
            const newArticles = allArticleItems.filter(
                (article) => !article.isNew
            )

            return newArticles
        }
        default: {
            return allArticleItems
        }
    }
}
