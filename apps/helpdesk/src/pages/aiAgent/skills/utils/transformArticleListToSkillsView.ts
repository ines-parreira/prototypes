import type { Components } from 'rest_api/help_center_api/client.generated'

import type { TransformedArticle } from '../types'
import { formatIntentName } from '../utils'

type ArticleListDataDto = Components.Schemas.ArticleListDataDto

export function transformArticleListToSkillsView(
    articles: ArticleListDataDto[],
): TransformedArticle[] {
    return articles.map((article) => {
        const { translation } = article

        const intents = (translation.intents ?? []).map((name) => ({
            name,
            formattedName: formatIntentName(name),
        }))

        const hasDraft =
            translation.draft_version_id !== null &&
            translation.draft_version_id !== translation.published_version_id

        const result: TransformedArticle = {
            id: article.id,
            title: translation.title,
            content: translation.content,
            intents,
            status:
                translation.visibility_status === 'PUBLIC'
                    ? 'enabled'
                    : 'disabled',
        }

        if (hasDraft) {
            result.draftVersion = {
                locale: translation.locale,
                article_translation_version_id: translation.draft_version_id!,
            }
        }

        if (translation.published_version_id !== null) {
            result.publishedVersion = {
                locale: translation.locale,
                article_translation_version_id:
                    translation.published_version_id,
            }
        }

        return result
    })
}
