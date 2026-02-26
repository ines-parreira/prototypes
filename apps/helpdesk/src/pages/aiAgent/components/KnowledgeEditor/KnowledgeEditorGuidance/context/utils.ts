import type { GuidanceArticle } from 'pages/aiAgent/types'
import type { Components } from 'rest_api/help_center_api/client.generated'

export const fromArticleTranslation = (
    article: Components.Schemas.ArticleWithLocalTranslation,
): GuidanceArticle => ({
    content: article.translation.content,
    createdDatetime: article.translation.created_datetime,
    draftVersionId: article.translation.draft_version_id,
    publishedVersionId: article.translation.published_version_id,
    id: article.id,
    locale: article.translation.locale,
    title: article.translation.title,
    visibility: article.translation.visibility_status,
    lastUpdated: article.translation.updated_datetime,
    templateKey: article.template_key ?? null,
    isCurrent: article.translation.is_current,
    intents: article.translation.intents,
})

export const fromArticleTranslationResponse = (
    response: Components.Schemas.ArticleTranslationResponseDto,
    currentGuidanceArticle: {
        id: number
        templateKey?: string | null
    },
): GuidanceArticle => ({
    id: currentGuidanceArticle.id,
    templateKey: currentGuidanceArticle?.templateKey ?? null,
    content: response.content,
    createdDatetime: response.created_datetime,
    draftVersionId: response.draft_version_id,
    publishedVersionId: response.published_version_id,
    locale: response.locale,
    title: response.title,
    visibility: response.visibility_status,
    lastUpdated: response.updated_datetime,
    isCurrent: response.is_current,
    intents: response.intents,
})
