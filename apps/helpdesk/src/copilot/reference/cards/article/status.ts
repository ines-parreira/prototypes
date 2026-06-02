import type { GuidanceArticle } from 'pages/aiAgent/types'

export type ArticleReferenceStatus = {
    label: string
    /** Status dot color. Omitted for draft states, which render without a dot. */
    dotColor?: 'green' | 'grey'
}

/**
 * Mirrors `getToolbarState` in
 * KnowledgeEditorTopBar/KnowledgeEditorTopBarSkillControls.tsx:
 *   isCurrent === true + PUBLIC   -> Enabled
 *   isCurrent === true + UNLISTED -> Disabled
 *   has published version         -> Draft changes
 *   otherwise                     -> Draft
 */
export function getStatusTag(article: GuidanceArticle): ArticleReferenceStatus {
    if (article.isCurrent === true) {
        return article.visibility === 'PUBLIC'
            ? { label: 'Enabled', dotColor: 'green' }
            : { label: 'Disabled', dotColor: 'grey' }
    }
    if (article.publishedVersionId !== null) {
        return { label: 'Draft changes' }
    }
    return { label: 'Draft' }
}
