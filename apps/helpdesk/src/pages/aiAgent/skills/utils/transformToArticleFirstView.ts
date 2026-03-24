import type {
    ArticleVersion,
    IntentResponseDto,
    TransformedArticle,
} from '../types'
import { formatIntentName } from '../utils'

/**
 * Transforms intent-first data to article-first view
 *
 * Takes intents array where each intent has multiple articles,
 * and returns articles array where each article has multiple intents.
 *
 * If the same article appears in both published and draft versions,
 * both configurations are stored under the same article entry.
 *
 * @param intents - Array of intents from useListIntents
 * @returns Array of transformed articles with all linked intents
 */
export function transformToArticleFirstView(
    intents: IntentResponseDto[],
): TransformedArticle[] {
    const articlesMap = new Map<number, TransformedArticle>()

    for (const intent of intents) {
        for (const article of intent.articles) {
            const articleId = article.id

            let transformedArticle = articlesMap.get(articleId)

            if (!transformedArticle) {
                transformedArticle = {
                    id: articleId,
                    title: article.title,
                    intents: [],
                    status:
                        article.visibility_status === 'PUBLIC'
                            ? 'enabled'
                            : 'disabled',
                }
                articlesMap.set(articleId, transformedArticle)
            }

            const intentExists = transformedArticle.intents.some(
                (i) => i.name === intent.name,
            )
            if (!intentExists) {
                transformedArticle.intents.push({
                    name: intent.name,
                    formattedName: formatIntentName(intent.name),
                })
            }

            const versionConfig: ArticleVersion = {
                locale: article.locale,
                article_translation_version_id:
                    article.article_translation_version_id,
            }

            if (article.status === 'published') {
                transformedArticle.publishedVersion = versionConfig
            } else if (article.status === 'draft') {
                transformedArticle.draftVersion = versionConfig
            }
        }
    }

    return Array.from(articlesMap.values())
}
