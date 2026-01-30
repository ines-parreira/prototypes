import { GetArticleVersionStatus } from '@gorgias/help-center-types'

import type { FilteredKnowledgeHubArticle } from '../types'

/**
 * Determines which version of an article to fetch based on version IDs.
 *
 * This function implements the business logic for choosing between the current
 * published version and the latest draft version of a Help Center article.
 *
 * @param article - Article data containing version information. May be undefined or partial.
 * @returns GetArticleVersionStatus.LatestDraft if the article has unpublished changes,
 *          GetArticleVersionStatus.Current if the article is published or undefined.
 *
 * @example
 * ```ts
 * // Article with draft changes
 * const status = getVersionStatus({ draftVersionId: 2, publishedVersionId: 1 })
 * // Returns GetArticleVersionStatus.LatestDraft
 *
 * // Article with no draft changes
 * const status = getVersionStatus({ draftVersionId: 1, publishedVersionId: 1 })
 * // Returns GetArticleVersionStatus.Current
 * ```
 */
export function getVersionStatus(
    article: FilteredKnowledgeHubArticle | undefined,
): GetArticleVersionStatus {
    const draft = isDraft(article)
    if (draft) {
        return GetArticleVersionStatus.LatestDraft
    }

    return GetArticleVersionStatus.Current
}

/**
 * Determines whether an article has unpublished draft changes.
 *
 * An article is considered a draft if:
 * - It has never been published (no publishedVersionId)
 * - Its draft version differs from the published version
 *
 * @param article - Article data containing version information. May be undefined or partial.
 * @returns true if the article has unpublished changes or has never been published,
 *          false if the article is undefined or fully published with no changes.
 *
 * @example
 * ```ts
 * // Never published
 * isDraft({ draftVersionId: 1 })
 * // Returns true
 *
 * // Published with no changes
 * isDraft({ draftVersionId: 1, publishedVersionId: 1 })
 * // Returns false
 *
 * // Published with draft changes
 * isDraft({ draftVersionId: 2, publishedVersionId: 1 })
 * // Returns true
 * ```
 */
export function isDraft(
    article:
        | Pick<
              FilteredKnowledgeHubArticle,
              'id' | 'draftVersionId' | 'publishedVersionId'
          >
        | undefined,
): boolean {
    if (!article) {
        return false
    }
    if (!article.publishedVersionId) {
        return true
    }
    if (article.draftVersionId === article.publishedVersionId) {
        return false
    }
    return true
}

/**
 * Checks if an article has draft edits on top of a published version.
 * Returns true when BOTH publishedVersionId exists AND draftVersionId differs from it.
 *
 * @param article - Article with version IDs
 * @returns true if article is published but has unpublished draft changes
 *
 * @example
 * ```tsx
 * hasDraftEdits({ publishedVersionId: 1, draftVersionId: 2 })
 * // Returns true - published article with draft edits
 *
 * hasDraftEdits({ publishedVersionId: null, draftVersionId: 1 })
 * // Returns false - never published (no publishedVersionId)
 *
 * hasDraftEdits({ publishedVersionId: 1, draftVersionId: 1 })
 * // Returns false - published with no draft changes
 * ```
 */
export function hasDraftEdits(
    article:
        | Pick<
              FilteredKnowledgeHubArticle,
              'id' | 'draftVersionId' | 'publishedVersionId'
          >
        | undefined,
): boolean {
    if (!article) {
        return false
    }
    if (!article.publishedVersionId) {
        return false
    }
    if (article.draftVersionId === article.publishedVersionId) {
        return false
    }
    return true
}
