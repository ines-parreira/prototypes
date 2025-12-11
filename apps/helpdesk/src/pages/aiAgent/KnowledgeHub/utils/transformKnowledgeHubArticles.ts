import type { KnowledgeHubArticle } from 'models/helpCenter/types'
import { KnowledgeHubArticleSourceType } from 'models/helpCenter/types'
import type {
    KnowledgeItem,
    KnowledgeVisibility,
} from 'pages/aiAgent/KnowledgeHub/types'
import { KnowledgeType } from 'pages/aiAgent/KnowledgeHub/types'

export function mapSourceTypeToKnowledgeType(
    sourceType: KnowledgeHubArticle['type'],
): KnowledgeType {
    switch (sourceType) {
        case KnowledgeHubArticleSourceType.GuidanceHelpCenter:
            return KnowledgeType.Guidance
        case KnowledgeHubArticleSourceType.FaqHelpCenter:
            return KnowledgeType.FAQ
        case KnowledgeHubArticleSourceType.StoreDomain:
            return KnowledgeType.Domain
        case KnowledgeHubArticleSourceType.Url:
            return KnowledgeType.URL
        case KnowledgeHubArticleSourceType.Document:
            return KnowledgeType.Document
        default:
            return KnowledgeType.Guidance
    }
}

export function transformKnowledgeHubArticlesToKnowledgeItems(
    articles: KnowledgeHubArticle[],
): KnowledgeItem[] {
    return articles.map((article) => ({
        id: article.id.toString(),
        title: article.title,
        type: mapSourceTypeToKnowledgeType(article.type),
        lastUpdatedAt: article.updatedDatetime,
        inUseByAI:
            article.visibilityStatus.toLowerCase() as KnowledgeVisibility,
        source: article.source,
        localeCode: article.localeCode,
        draftVersionId: article.draftVersionId,
        publishedVersionId: article.publishedVersionId,
    }))
}
